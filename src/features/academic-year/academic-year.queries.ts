import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { createAcademicYear, fetchCurrentAcademicYear } from './academic-year.api'

export const currentAcademicYearKey = ['academic-year', 'current'] as const

export function useCurrentAcademicYearQuery() {
  return useQuery({ queryKey: currentAcademicYearKey, queryFn: fetchCurrentAcademicYear })
}

export function useCreateAcademicYearMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAcademicYear,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: currentAcademicYearKey }),
  })
}
