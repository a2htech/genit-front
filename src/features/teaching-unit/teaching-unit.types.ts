import type { Level } from '@/features/academic-year'

export interface Subject {
  id: number
  name: string
  credit: number
  hourly_vol: number
  teaching_unit_id: number
  created_at: string | null
  updated_at: string | null
}

export interface TeachingUnit {
  id: number
  name: string
  code: string
  semester: number
  class: Level
  created_at: string | null
  updated_at: string | null
  subjects: Subject[]
}

export interface SubjectFormValues {
  name: string
  credit: number
  hourly_vol: number
  teaching_unit_id: number
}

export type SubjectUpdatePayload = Partial<SubjectFormValues>

/** SemesterEnum::allowedSemesters côté back : le semestre est numéroté sur tout le cursus (1..10), pas juste S1/S2. */
export function semestersForLevel(level: Level): [number, number] {
  switch (level) {
    case 'L1':
      return [1, 2]
    case 'L2':
      return [3, 4]
    case 'L3':
      return [5, 6]
    case 'M1':
      return [7, 8]
    case 'M2':
      return [9, 10]
  }
}
