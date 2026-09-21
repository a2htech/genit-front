import { computed, type Ref } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useContextStore } from '@/features/academic-year'
import { createStudent, deleteStudent, fetchStudent, fetchStudents, updateStudent } from './student.api'
import type { StudentFormValues, StudentUpdatePayload } from './student.types'

function studentsKey(level: string | null) {
  return ['students', level] as const
}

function studentKey(id: number | null) {
  return ['student', id] as const
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

/** Filtre partagé par la liste et la navigation du bulletin : les deux parcourent les étudiants dans le même ordre. */
export function useFilteredStudents(search: Ref<string>) {
  const query = useStudentsQuery()
  const filtered = computed(() => {
    const term = search.value.toLowerCase().trim()
    const list = query.data.value ?? []
    if (!term) return list
    return list.filter((s) => `${s.first_name} ${s.last_name ?? ''} ${s.id}`.toLowerCase().includes(term))
  })
  return { ...query, filtered }
}

/** `GET /students/{id}` est sous CurrentAcademicYearScope : un étudiant d'une autre année ressort en 404, pas la peine de réessayer. */
export function useStudentQuery(id: Ref<number | null>) {
  return useQuery({
    queryKey: computed(() => studentKey(id.value)),
    queryFn: () => fetchStudent(id.value!),
    enabled: computed(() => id.value !== null),
    retry: false,
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
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: StudentUpdatePayload }) => updateStudent(id, payload),
    onSuccess: (_data, { id }) => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: studentKey(id) })
    },
  })
}

export function useDeleteStudentMutation() {
  const invalidate = useInvalidateStudents()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteStudent(id),
    onSuccess: (_data, id) => {
      invalidate()
      queryClient.removeQueries({ queryKey: studentKey(id) })
    },
  })
}
