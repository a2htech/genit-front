import { computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useContextStore } from '@/features/academic-year'
import { createSubject, deleteSubject, fetchTeachingUnits, updateSubject } from './teaching-unit.api'
import type { SubjectFormValues, SubjectUpdatePayload } from './teaching-unit.types'

function teachingUnitsKey(level: string | null) {
  return ['teaching-units', level] as const
}

export function useTeachingUnitsQuery() {
  const context = useContextStore()
  const level = computed(() => context.level)
  return useQuery({
    queryKey: computed(() => teachingUnitsKey(level.value)),
    queryFn: () => fetchTeachingUnits(level.value!),
    enabled: computed(() => level.value !== null),
  })
}

function useInvalidateTeachingUnits() {
  const context = useContextStore()
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: teachingUnitsKey(context.level) })
}

export function useCreateSubjectMutation() {
  const invalidate = useInvalidateTeachingUnits()
  return useMutation({
    mutationFn: (payload: SubjectFormValues) => createSubject(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateSubjectMutation() {
  const invalidate = useInvalidateTeachingUnits()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SubjectUpdatePayload }) => updateSubject(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteSubjectMutation() {
  const invalidate = useInvalidateTeachingUnits()
  return useMutation({
    mutationFn: (id: number) => deleteSubject(id),
    onSuccess: invalidate,
  })
}
