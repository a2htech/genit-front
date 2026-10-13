import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { allTeachingUnitsKey } from '@/features/teaching-unit'
import { assignSubjects, fetchUsers } from './user.api'

const usersKey = ['users'] as const

export function useUsersQuery() {
  return useQuery({ queryKey: usersKey, queryFn: fetchUsers })
}

export function useAssignSubjectsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ clerkId, subjectIds }: { clerkId: string; subjectIds: number[] }) =>
      assignSubjects(clerkId, subjectIds),
    // L'affectation retire aussi des matières à d'autres enseignants, tous niveaux confondus.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: usersKey }),
        queryClient.invalidateQueries({ queryKey: allTeachingUnitsKey }),
      ]),
  })
}
