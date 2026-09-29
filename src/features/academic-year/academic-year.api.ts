import { apiClient } from '@/shared/api/client'
import type { AcademicYear } from './academic-year.types'

export async function fetchCurrentAcademicYear(): Promise<AcademicYear> {
  const { data } = await apiClient.get<{ data: AcademicYear }>('/academic-years/current')
  return data.data
}

export async function rolloverAcademicYear(): Promise<AcademicYear> {
  const { data } = await apiClient.post<{ data: AcademicYear }>('/academic-years/rollover')
  return data.data
}
