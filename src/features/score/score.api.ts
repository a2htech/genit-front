import { apiClient } from '@/shared/api/client'
import { fetchAllPages, type LaravelPage } from '@/shared/api/pagination'
import { SESSION_CODE, type ExamSession, type Score } from './score.types'

export interface FetchScoresParams {
  subjectId: number
  session: ExamSession
  classYear: number
}

export async function fetchScores(params: FetchScoresParams): Promise<Score[]> {
  return fetchAllPages((page) =>
    apiClient
      .get<LaravelPage<Score>>('/scores', {
        params: {
          subject_id: params.subjectId,
          session: SESSION_CODE[params.session],
          class_year: params.classYear,
          per_page: 100,
          page,
        },
      })
      .then((r) => r.data),
  )
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
