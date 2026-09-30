import type { Level } from '@/features/academic-year'

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

/** Sans `original` (absence, données anciennes), une note n'est jamais signalée comme délibérée. */
export function isDeliberated(note: Pick<Score, 'score' | 'original'>): boolean {
  return note.original !== null && note.score !== note.original
}

/** Le bulletin n'expose pas l'id des notes : on les retrouve par étudiant, matière et session. */
export interface DeliberationTarget {
  studentId: number
  subjectId: number
  subjectName: string
  session: ExamSession
}

export interface SubjectEligibleStudent {
  id: string
  first_name: string
  last_name: string
  class: Level
  score: Score | null
}

export interface SubjectEligibleStudents {
  regularSession: SubjectEligibleStudent[]
  retakeSession: SubjectEligibleStudent[]
}
