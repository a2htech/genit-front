import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { basculerAnneeUniversitaire, fetchAnneesUniversitaires } from './academic-year.api'

export const anneesUniversitairesKey = ['annees-universitaires'] as const

export function useAnneesUniversitairesQuery() {
  return useQuery({ queryKey: anneesUniversitairesKey, queryFn: fetchAnneesUniversitaires })
}

export function useBasculerAnneeMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: basculerAnneeUniversitaire,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: anneesUniversitairesKey }),
  })
}
