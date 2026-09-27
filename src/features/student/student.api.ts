import { apiClient } from '@/shared/api/client'
import { fetchAllPages, type LaravelPage } from '@/shared/api/pagination'
import type { Level } from '@/features/academic-year'
import type { ArchivedStudentFilters, Student, StudentFormValues, StudentUpdatePayload } from './student.types'

/** `GET /students` n'a pas d'ORDER BY : on fixe l'ordre ici, sinon liste et navigation du bulletin divergent. */
export async function fetchStudents(level: Level): Promise<Student[]> {
  const students = await fetchAllPages((page) =>
    apiClient
      .get<LaravelPage<Student>>('/students', { params: { class: level, per_page: 100, page } })
      .then((r) => r.data),
  )
  return students.sort((a, b) => a.id - b.id)
}

/** Pas d'ORDER BY côté back : l'ordre d'une page à l'autre n'est pas garanti. */
export async function fetchArchivedStudents(filters: ArchivedStudentFilters): Promise<LaravelPage<Student>> {
  const { data } = await apiClient.get<LaravelPage<Student>>('/students/archived', {
    // Un paramètre à undefined n'est pas envoyé par axios.
    params: {
      page: filters.page,
      per_page: 25,
      name: filters.name.trim() || undefined,
      class: filters.level === 'all' ? undefined : filters.level,
    },
  })
  return data
}

export async function fetchStudent(id: number): Promise<Student> {
  const { data } = await apiClient.get<{ data: Student }>(`/students/${id}`)
  return data.data
}

export async function createStudent(payload: StudentFormValues): Promise<Student> {
  const { data } = await apiClient.post<{ data: Student }>('/students', payload)
  return data.data
}

export async function updateStudent(id: number, payload: StudentUpdatePayload): Promise<Student> {
  const { data } = await apiClient.put<{ data: Student }>(`/students/${id}`, payload)
  return data.data
}

export async function deleteStudent(id: number): Promise<void> {
  await apiClient.delete(`/students/${id}`)
}
