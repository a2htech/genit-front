import { apiClient } from '@/shared/api/client'
import { fetchAllPages, type LaravelPage } from '@/shared/api/pagination'
import type { Level } from '@/features/academic-year'
import type { Subject, SubjectFormValues, SubjectUpdatePayload, TeachingUnit } from './teaching-unit.types'

export async function fetchTeachingUnits(level: Level): Promise<TeachingUnit[]> {
  return fetchAllPages((page) =>
    apiClient
      .get<LaravelPage<TeachingUnit>>('/teaching-units', { params: { class: level, page } })
      .then((r) => r.data),
  )
}

export async function createSubject(payload: SubjectFormValues): Promise<Subject> {
  const { data } = await apiClient.post<{ data: Subject }>('/subjects', payload)
  return data.data
}

export async function updateSubject(id: number, payload: SubjectUpdatePayload): Promise<Subject> {
  const { data } = await apiClient.put<{ data: Subject }>(`/subjects/${id}`, payload)
  return data.data
}

export async function deleteSubject(id: number): Promise<void> {
  await apiClient.delete(`/subjects/${id}`)
}
