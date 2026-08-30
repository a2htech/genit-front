import { type Ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useContextStore, type Level } from '@/features/academic-year'
import { calculateAllAnnualResults, fetchAnnualResults, fetchTranscript, fetchTranscriptForClass } from './transcript.api'

/** Le niveau courant de l'étudiant est toujours celui du contexte (la recherche ne liste que ce niveau-là). */
export function useTranscriptQuery(studentId: Ref<number | null>, levelView: Ref<Level | null>) {
  const context = useContextStore()
  return useQuery({
    queryKey: computed(() => ['transcript', studentId.value, levelView.value]),
    queryFn: () =>
      levelView.value === context.level
        ? fetchTranscript(studentId.value!)
        : fetchTranscriptForClass(studentId.value!, levelView.value!),
    enabled: computed(() => studentId.value !== null && levelView.value !== null),
  })
}

function annualResultsKey(level: string | null) {
  return ['annual-results', level] as const
}

export function useAnnualResultsQuery() {
  const context = useContextStore()
  const level = computed(() => context.level)
  return useQuery({
    queryKey: computed(() => annualResultsKey(level.value)),
    queryFn: () => fetchAnnualResults(level.value!),
    enabled: computed(() => level.value !== null),
  })
}

export function useCalculateAllAnnualResultsMutation() {
  const context = useContextStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: calculateAllAnnualResults,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: annualResultsKey(context.level) }),
  })
}
