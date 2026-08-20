import { computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useContextStore } from '@/features/academic-year'
import {
  createMatiere,
  deleteMatiere,
  fetchMatieres,
  fetchUnitesEnseignement,
  updateMatiere,
} from './teaching-unit.api'
import type { MatiereFormValues, MatiereUpdatePayload } from './teaching-unit.types'

export function useUnitesEnseignementQuery() {
  const context = useContextStore()
  const niveau = computed(() => context.niveau)
  return useQuery({
    queryKey: computed(() => ['unites-enseignement', niveau.value]),
    queryFn: () => fetchUnitesEnseignement(niveau.value!),
    enabled: computed(() => niveau.value !== null),
  })
}

export function useMatieresQuery() {
  const context = useContextStore()
  const niveau = computed(() => context.niveau)
  return useQuery({
    queryKey: computed(() => ['matieres', niveau.value]),
    queryFn: () => fetchMatieres(niveau.value!),
    enabled: computed(() => niveau.value !== null),
  })
}

function useInvalidateMatieres() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['matieres'] })
}

export function useCreateMatiereMutation() {
  const invalidate = useInvalidateMatieres()
  return useMutation({
    mutationFn: (payload: MatiereFormValues) => createMatiere(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateMatiereMutation() {
  const invalidate = useInvalidateMatieres()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MatiereUpdatePayload }) => updateMatiere(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteMatiereMutation() {
  const invalidate = useInvalidateMatieres()
  return useMutation({
    mutationFn: (id: string) => deleteMatiere(id),
    onSuccess: invalidate,
  })
}
