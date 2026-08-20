import { type Ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useContextStore } from '@/features/academic-year'
import { createEtudiant, deleteEtudiant, fetchEtudiants, updateEtudiant } from './student.api'
import type { EtudiantFormValues } from './student.types'

const PAGE_SIZE = 5

export function useEtudiantsQuery(search: Ref<string>, page: Ref<number>) {
  const context = useContextStore()
  const niveau = computed(() => context.niveau)
  return useQuery({
    queryKey: computed(() => ['etudiants', niveau.value, search.value, page.value]),
    queryFn: () =>
      fetchEtudiants({ niveau: niveau.value!, search: search.value, page: page.value, perPage: PAGE_SIZE }),
    enabled: computed(() => niveau.value !== null),
    placeholderData: (previous) => previous,
  })
}

export function useEtudiantsCountQuery() {
  const context = useContextStore()
  const niveau = computed(() => context.niveau)
  return useQuery({
    queryKey: computed(() => ['etudiants', 'count', niveau.value]),
    queryFn: () => fetchEtudiants({ niveau: niveau.value!, search: '', page: 1, perPage: 1 }),
    enabled: computed(() => niveau.value !== null),
    select: (page) => page.meta.total,
  })
}

export function useEtudiantsRechercheQuery(search: Ref<string>) {
  const context = useContextStore()
  const niveau = computed(() => context.niveau)
  return useQuery({
    queryKey: computed(() => ['etudiants', 'recherche', niveau.value, search.value]),
    queryFn: () => fetchEtudiants({ niveau: niveau.value!, search: search.value, page: 1, perPage: 5 }),
    enabled: computed(() => niveau.value !== null && search.value.trim().length > 0),
  })
}

function useInvalidateEtudiants() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['etudiants'] })
}

export function useCreateEtudiantMutation() {
  const invalidate = useInvalidateEtudiants()
  return useMutation({
    mutationFn: (payload: EtudiantFormValues) => createEtudiant(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateEtudiantMutation() {
  const invalidate = useInvalidateEtudiants()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EtudiantFormValues }) => updateEtudiant(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteEtudiantMutation() {
  const invalidate = useInvalidateEtudiants()
  return useMutation({
    mutationFn: (id: string) => deleteEtudiant(id),
    onSuccess: invalidate,
  })
}
