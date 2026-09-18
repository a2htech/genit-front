import type { Level } from '@/features/academic-year'

export type Sex = 'M' | 'F'

export const SEX_LABELS: Record<Sex, string> = {
  M: 'Masculin',
  F: 'Féminin',
}

/** P/C/R/T calculé côté back (AcademicStatusEnum) : Passant/Cumul/Refus/Terminé. */
export type AcademicStatusCode = 'P' | 'C' | 'R' | 'T'

export const ACADEMIC_STATUS_CODES: AcademicStatusCode[] = ['P', 'C', 'R', 'T']

export const ACADEMIC_STATUS_VARIANTS: Record<AcademicStatusCode, 'success' | 'warning' | 'destructive' | 'accent'> = {
  P: 'success',
  C: 'warning',
  R: 'destructive',
  T: 'accent',
}

/** Le même code dit comme une décision annuelle : Résultats, Dashboard, bascule d'année. */
export const ACADEMIC_STATUS_LABELS: Record<AcademicStatusCode, string> = {
  P: 'Admis(e)',
  C: 'Sous réserve',
  R: 'Refusé(e)',
  T: 'Terminé',
}

/** Le même code dit comme la situation de l'étudiant dans son cursus : fiche étudiant.
 *  T n'y apparaît jamais (AcademicStatusEnum::states() l'exclut), mais complète le Record. */
export const STUDENT_STATE_LABELS: Record<AcademicStatusCode, string> = {
  P: 'Passant(e)',
  C: 'Cumulant(e)',
  R: 'Redoublant(e)',
  T: 'Diplômé(e)',
}

export interface Student {
  id: number
  first_name: string
  last_name: string | null
  sex: Sex
  birthday: string
  birthplace: string | null
  address: string | null
  phone: string | null
  class: Level
  class_year: number
  state: AcademicStatusCode
  expired: boolean
  /** L'étudiant ne fait plus partie du cursus (diplômé ou renvoyé), pas "redoublant". */
  old: boolean
  registered: boolean
  created_at: string | null
  updated_at: string | null
}

/** Un étudiant est toujours créé en L1 ; class/class_year/state/old sont système, jamais saisis ici. */
export interface StudentFormValues {
  first_name: string
  last_name: string
  sex: Sex
  birthday: string
  birthplace: string
  address: string
  phone: string
}

export type StudentUpdatePayload = Partial<StudentFormValues> & { registered?: boolean }

export function studentFullName(s: { first_name: string; last_name: string | null }): string {
  return `${s.first_name} ${s.last_name ?? ''}`.trim()
}
