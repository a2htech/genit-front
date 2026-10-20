import { type Ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { promiseTimeout } from '@vueuse/core'
import { useContextStore, type Level } from '@/features/academic-year'
import {
  calculateAllAnnualResults,
  calculateAnnualResultsForClass,
  fetchAnnualResults,
  fetchAnnualResultsSummary,
  fetchStudentsMissingAnnualResults,
  fetchTranscript,
  fetchTranscriptForClass,
} from './transcript.api'

function transcriptKey(studentId: number | null) {
  return ['transcript', studentId] as const
}

/** Le niveau courant de l'étudiant est toujours celui du contexte (la recherche ne liste que ce niveau-là). */
export function useTranscriptQuery(studentId: Ref<number | null>, levelView: Ref<Level | null>) {
  const context = useContextStore()
  return useQuery({
    queryKey: computed(() => [...transcriptKey(studentId.value), levelView.value]),
    queryFn: () =>
      levelView.value === context.level
        ? fetchTranscript(studentId.value!)
        : fetchTranscriptForClass(studentId.value!, levelView.value!),
    enabled: computed(() => studentId.value !== null && levelView.value !== null),
  })
}

/** Tous niveaux : une note de cumul délibérée change aussi la décision du niveau courant. */
export function useInvalidateStudentTranscripts(studentId: Ref<number | null>) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: transcriptKey(studentId.value) })
}

function annualResultsKey(level: string | null) {
  return ['annual-results', level] as const
}

const annualResultsSummaryKey = ['annual-results', 'summary'] as const

export function useAnnualResultsQuery() {
  const context = useContextStore()
  const level = computed(() => context.level)
  return useQuery({
    queryKey: computed(() => annualResultsKey(level.value)),
    queryFn: () => fetchAnnualResults(level.value!),
    enabled: computed(() => level.value !== null),
  })
}

export function useCalculateAnnualResultsForClassMutation() {
  const context = useContextStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => calculateAnnualResultsForClass(context.level!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: annualResultsKey(context.level) })
      queryClient.invalidateQueries({ queryKey: annualResultsSummaryKey })
    },
  })
}

export function useAnnualResultsSummaryQuery() {
  return useQuery({
    queryKey: annualResultsSummaryKey,
    queryFn: fetchAnnualResultsSummary,
  })
}

const missingAnnualResultsKey = ['annual-results', 'missing'] as const

export function useMissingAnnualResultsQuery() {
  return useQuery({
    queryKey: missingAnnualResultsKey,
    queryFn: fetchStudentsMissingAnnualResults,
  })
}

const CALCULATION_POLL_MS = 3_000
const CALCULATION_TIMEOUT_MS = 60_000

/** Le calcul part en file (202) : on relit les manquants jusqu'à ce qu'il n'y en ait plus, une minute
 *  au plus. Renvoie `false` si le calcul tourne encore. */
export function useCalculateAllAnnualResultsMutation() {
  const queryClient = useQueryClient()
  // staleTime 0 force la relecture, qui met aussi à jour le compteur affiché par la page.
  const fetchMissing = () =>
    queryClient.fetchQuery({
      queryKey: missingAnnualResultsKey,
      queryFn: fetchStudentsMissingAnnualResults,
      staleTime: 0,
    })
  return useMutation({
    mutationFn: async () => {
      await calculateAllAnnualResults()
      const deadline = Date.now() + CALCULATION_TIMEOUT_MS
      while ((await fetchMissing()).length > 0) {
        if (Date.now() >= deadline) return false
        await promiseTimeout(CALCULATION_POLL_MS)
      }
      return true
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['annual-results'] }),
  })
}
