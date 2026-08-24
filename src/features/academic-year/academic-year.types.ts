export type Level = 'L1' | 'L2' | 'L3' | 'M1' | 'M2'

export const LEVELS: { value: Level; label: string }[] = [
  { value: 'L1', label: 'Licence 1' },
  { value: 'L2', label: 'Licence 2' },
  { value: 'L3', label: 'Licence 3' },
  { value: 'M1', label: 'Master 1' },
  { value: 'M2', label: 'Master 2' },
]

export interface AcademicYear {
  id: number
  year: number
  is_current: boolean
}
