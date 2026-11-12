import { apiClient } from '@/shared/api/client'
import type { Level } from '@/features/academic-year'
import type { ForcedSubjectResult } from './subject-result.types'

export async function fetchForcedResults(level: Level): Promise<ForcedSubjectResult[]> {
  const { data } = await apiClient.get<{ data: ForcedSubjectResult[] }>('/subject-results/forced', {
    params: { class: level },
  })
  return data.data
}

export async function forceFail(studentId: number, subjectId: number): Promise<ForcedSubjectResult> {
  const { data } = await apiClient.post<{ data: ForcedSubjectResult }>('/subject-results/forced', {
    student_id: studentId,
    subject_id: subjectId,
  })
  return data.data
}

export async function deleteForcedResult(id: number): Promise<void> {
  await apiClient.delete(`/subject-results/forced/${id}`)
}
