import { computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useContextStore } from '@/features/academic-year'
import { deleteForcedResult, fetchForcedResults, forceFail } from './subject-result.api'

const allForcedResultsKey = ['forced-results'] as const

export function useForcedResultsQuery() {
  const context = useContextStore()
  const level = computed(() => context.level)
  return useQuery({
    queryKey: computed(() => [...allForcedResultsKey, level.value] as const),
    queryFn: () => fetchForcedResults(level.value!),
    enabled: computed(() => level.value !== null),
  })
}

function useInvalidateForcedResults() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: allForcedResultsKey })
}

export function useForceFailMutation() {
  const invalidate = useInvalidateForcedResults()
  return useMutation({
    mutationFn: ({ studentId, subjectId }: { studentId: number; subjectId: number }) => forceFail(studentId, subjectId),
    onSuccess: invalidate,
  })
}

export function useDeleteForcedResultMutation() {
  const invalidate = useInvalidateForcedResults()
  return useMutation({
    mutationFn: (id: number) => deleteForcedResult(id),
    onSuccess: invalidate,
  })
}
