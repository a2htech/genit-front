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

/** Les matières viennent nested dans TeachingUnitResource : pas de fetch /subjects séparé. */
export function useSubjectsQuery() {
  const { data: teachingUnits, isPending } = useTeachingUnitsQuery()
  const data = computed(() => teachingUnits.value?.flatMap((u) => u.subjects))
  return { data, isPending }
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
