import { type Ref, computed } from 'vue'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import {
  fetchEligibleStudents,
  fetchRetakeEligibleStudents,
  storeScoresForSubject,
  updateScore,
  type StoreScoresPayload,
} from './score.api'

function eligibleStudentsKey(subjectId: number | null) {
  return ['subjects', subjectId, 'eligible-students'] as const
}

export function useEligibleStudentsQuery(subjectId: Ref<number | null>) {
  return useQuery({
    queryKey: computed(() => eligibleStudentsKey(subjectId.value)),
    queryFn: () => fetchEligibleStudents(subjectId.value!),
    enabled: computed(() => subjectId.value !== null),
  })
}

export function useRetakeEligibleStudentsQuery(
  subjectId: Ref<number | null>,
  name: Ref<string>,
  enabled: Ref<boolean>,
) {
  return useQuery({
    queryKey: computed(() => ['subjects', subjectId.value, 'retake-eligible-students', name.value] as const),
    queryFn: () => fetchRetakeEligibleStudents(subjectId.value!, name.value),
    enabled: computed(() => enabled.value && subjectId.value !== null),
    placeholderData: keepPreviousData,
  })
}

export interface SaveScoresPayload {
  create: StoreScoresPayload | null
  update: { id: number; score: number | null }[]
}

/** Créations et corrections dans une seule mutation : un seul rafraîchissement à la fin, sans clignotement. */
export function useSaveScoresMutation(subjectId: Ref<number | null>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ create, update }: SaveScoresPayload) =>
      Promise.all([
        ...(create ? [storeScoresForSubject(create)] : []),
        ...update.map(({ id, score }) => updateScore(id, score)),
      ]),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eligibleStudentsKey(subjectId.value) }),
  })
}
