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

export function useRetakeEligibleStudentsQuery(subjectId: Ref<number | null>, name: Ref<string>, enabled: Ref<boolean>) {
  return useQuery({
    queryKey: computed(() => ['subjects', subjectId.value, 'retake-eligible-students', name.value] as const),
    queryFn: () => fetchRetakeEligibleStudents(subjectId.value!, name.value),
    enabled: computed(() => enabled.value && subjectId.value !== null),
    placeholderData: keepPreviousData,
  })
}

export function useStoreScoresMutation(subjectId: Ref<number | null>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StoreScoresPayload) => storeScoresForSubject(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eligibleStudentsKey(subjectId.value) }),
  })
}

export function useUpdateScoreMutation(subjectId: Ref<number | null>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, score }: { id: number; score: number | null }) => updateScore(id, score),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: eligibleStudentsKey(subjectId.value) }),
  })
}
