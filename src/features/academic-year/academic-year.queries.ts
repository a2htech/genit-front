import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createAcademicYear, fetchCurrentAcademicYear } from './academic-year.api'

export const currentAcademicYearKey = ['academic-year', 'current'] as const

export function useCurrentAcademicYearQuery() {
  // Plus court que le staleTime global (5 min) : une bascule d'année par un autre client doit
  // remonter vite via le prochain refetchOnWindowFocus/remount, sans attendre 5 min.
  return useQuery({
    queryKey: currentAcademicYearKey,
    queryFn: fetchCurrentAcademicYear,
    staleTime: 60 * 1000,
  })
}

export function useCreateAcademicYearMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAcademicYear,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: currentAcademicYearKey }),
  })
}
