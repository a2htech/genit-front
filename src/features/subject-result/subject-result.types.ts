import type { Level } from '@/features/academic-year'
import type { Student } from '@/features/student'
import type { Subject } from '@/features/teaching-unit'

/** `SubjectResultResource` avec `class_year`, `student` et `subject` chargés. */
export interface ForcedSubjectResult {
  id: number
  student_id: number
  subject_id: number
  acquired: boolean
  class_year: number
  student: Student
  subject: Subject
}

/** Niveau des dettes d'un étudiant : celui juste en dessous, s'il connaît le cumul (le back revalide). */
export const DEBT_LEVELS: Partial<Record<Level, Level>> = { L2: 'L1', L3: 'L2', M2: 'M1' }
