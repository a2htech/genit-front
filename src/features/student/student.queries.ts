import { computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useContextStore } from '@/features/academic-year'
import { createStudent, deleteStudent, fetchStudents, updateStudent } from './student.api'
import type { StudentFormValues, StudentUpdatePayload } from './student.types'

function studentsKey(level: string | null) {
  return ['students', level] as const
}

/** Un seul fetch (paginé jusqu'au bout) par niveau ; recherche/pagination faites ensuite côté client. */
export function useStudentsQuery() {
  const context = useContextStore()
  const level = computed(() => context.level)
  return useQuery({
    queryKey: computed(() => studentsKey(level.value)),
    queryFn: () => fetchStudents(level.value!),
    enabled: computed(() => level.value !== null),
  })
}

function useInvalidateStudents() {
  const context = useContextStore()
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: studentsKey(context.level) })
}

export function useCreateStudentMutation() {
  const invalidate = useInvalidateStudents()
  return useMutation({
    mutationFn: (payload: StudentFormValues) => createStudent(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateStudentMutation() {
  const invalidate = useInvalidateStudents()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StudentUpdatePayload }) => updateStudent(id, payload),
    onSuccess: invalidate,
  })
}

export function useDeleteStudentMutation() {
  const invalidate = useInvalidateStudents()
  return useMutation({
    mutationFn: (id: number) => deleteStudent(id),
    onSuccess: invalidate,
  })
}
