import { apiClient } from '@/shared/api/client'
import { SESSION_CODE, type ExamSession, type Score, type SubjectEligibleStudents } from './score.types'

export async function fetchEligibleStudents(subjectId: number): Promise<SubjectEligibleStudents> {
  const { data } = await apiClient.get<{ data: SubjectEligibleStudents }>(`/subjects/${subjectId}/eligible-students`)
  return data.data
}

export interface StoreScoresPayload {
  subjectId: number
  session: ExamSession
  classYear: number
  scores: { student_id: number; score: number }[]
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
