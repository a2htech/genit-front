import type { AcademicStatusCode } from '@/features/student'

/** AcademicStatusEnum::label() côté back (P/C/R/T résolus en toutes lettres). */
export type AcademicStatusLabel = 'PASSED' | 'CONDITIONAL' | 'FAILED' | 'COMPLETED'

export const STATUS_LABEL_FR: Record<AcademicStatusLabel, string> = {
  PASSED: 'Admis(e)',
  CONDITIONAL: 'Sous réserve',
  FAILED: 'Refusé(e)',
  COMPLETED: 'Diplômé(e)',
}

export type Mention = 'NV' | 'VP' | 'VAB' | 'VB' | 'VTB'

export const MENTION_LABEL_FR: Record<Mention, string> = {
  NV: 'Non Validé',
  VP: 'Validé Passable',
  VAB: 'Validé Assez Bien',
  VB: 'Validé Bien',
  VTB: 'Validé Très Bien',
}

export interface TranscriptSubject {
  id: number
  name: string
  hourlyVolume: number
  credits: number
  coefficient: number
  regularSession: { score: number | null; original: number | null }
  retakeSession: { score: number | null; original: number | null }
}

export interface TranscriptSessionResult {
  unitAverage: number
  creditsEarned: number
  mention: Mention
}

export interface TranscriptTeachingUnit {
  code: string
  name: string
  credits: number
  subjects: TranscriptSubject[]
  regularSession: TranscriptSessionResult
  retakeSession: TranscriptSessionResult
}

export interface TranscriptSemesterSummary {
  creditsValidated: string
  status: AcademicStatusLabel
}

export interface TranscriptSemester {
  number: number
  teachingUnits: TranscriptTeachingUnit[]
  result: { regularSession: TranscriptSemesterSummary; retakeSession: TranscriptSemesterSummary }
}

export interface TranscriptStudent {
  id: number
  firstName: string
  lastName: string | null
  sex: string
  birthday: string
  birthplace: string | null
  class: string
}

export interface Transcript {
  student: TranscriptStudent
  semesters: TranscriptSemester[]
  annualResult: AcademicStatusLabel
  cumulExpired: boolean
}

export interface FailedSubject {
  id: number
  name: string
}

/** Décision annuelle (P/C/R/T) déjà calculée et persistée pour un étudiant, telle que listée par classe. */
export interface AnnualResult {
  id: number
  student_id: number
  class: string
  class_year: number
  status: AcademicStatusCode
  /** La dette de l'année précédente n'a pas été rattrapée à temps (cumul expiré). */
  expired: boolean
  failed_subjects: FailedSubject[]
}
