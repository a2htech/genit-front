import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchCurrentAcademicYear, rolloverAcademicYear } from './academic-year.api'

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

// La bascule change l'année, le niveau et l'inscription de chaque étudiant : tout le cache est périmé.
export function useRolloverAcademicYearMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: rolloverAcademicYear,
    onSuccess: () => queryClient.invalidateQueries(),
  })
}
