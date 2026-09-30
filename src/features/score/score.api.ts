import { isAxiosError } from 'axios'
import { apiClient } from '@/shared/api/client'
import type { Student } from '@/features/student'
import { SESSION_CODE, type ExamSession, type Score, type SubjectEligibleStudents } from './score.types'

export async function fetchEligibleStudents(subjectId: number): Promise<SubjectEligibleStudents> {
  const { data } = await apiClient.get<{ data: SubjectEligibleStudents }>(`/subjects/${subjectId}/eligible-students`)
  return data.data
}

export async function fetchRetakeEligibleStudents(subjectId: number, name: string): Promise<Student[]> {
  const { data } = await apiClient.get<{ data: Student[] }>(`/subjects/${subjectId}/retake-eligible-students`, {
    params: name ? { name } : undefined,
  })
  return data.data
}

export interface StoreScoresPayload {
  subjectId: number
  session: ExamSession
  classYear: number
  scores: { student_id: number; score: number | null }[]
}

export async function storeScoresForSubject(payload: StoreScoresPayload): Promise<Score[]> {
  const { data } = await apiClient.post<{ data: Score[] }>(`/subjects/${payload.subjectId}/scores`, {
    subject_id: payload.subjectId,
    session: SESSION_CODE[payload.session],
    class_year: payload.classYear,
    scores: payload.scores,
  })
  return data.data
}

export async function updateScore(id: number, score: number | null): Promise<Score> {
  const { data } = await apiClient.put<{ data: Score }>(`/scores/${id}`, { score })
  return data.data
}

export async function deleteScore(id: number): Promise<void> {
  await apiClient.delete(`/scores/${id}`)
}

/** Année courante seulement : 404 = aucune note cette année pour cette session, donc rien à délibérer. */
export async function fetchCurrentYearScore(
  studentId: number,
  subjectId: number,
  session: ExamSession,
): Promise<Score | null> {
  try {
    const { data } = await apiClient.get<{ data: Score }>('/scores/latest', {
      params: { student_id: studentId, subject_id: subjectId, session: SESSION_CODE[session], across_all_years: 0 },
    })
    return data.data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

/** Remplace `score` et laisse `original` intact ; le back recalcule le résultat de la matière. */
export async function deliberateScore(id: number, score: number): Promise<Score> {
  const { data } = await apiClient.post<{ data: Score }>(`/scores/${id}/deliberate`, { score })
  return data.data
}
