import { apiClient } from '@/shared/api/client'
import { fetchAllPages, type LaravelPage } from '@/shared/api/pagination'
import type { Level } from '@/features/academic-year'
import type { Student, StudentFormValues, StudentUpdatePayload } from './student.types'

export async function fetchStudents(level: Level): Promise<Student[]> {
  return fetchAllPages((page) =>
    apiClient
      .get<LaravelPage<Student>>('/students', { params: { class: level, per_page: 100, page } })
      .then((r) => r.data),
  )
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
