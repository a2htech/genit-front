export type ExamSession = 'normale' | 'rattrapage'

/** Code numérique attendu en écriture (InsertScoresBySubjectRequest/UpdateScoreRequest) ; la lecture renvoie le libellé. */
export const SESSION_CODE: Record<ExamSession, '1' | '2'> = {
  normale: '1',
  rattrapage: '2',
}

export interface Score {
  id: number
  subject_id: number
  student_id: number
  session: ExamSession
  class_year: number
  score: number | null
  original: number | null
  created_at: string | null
  updated_at: string | null
}
