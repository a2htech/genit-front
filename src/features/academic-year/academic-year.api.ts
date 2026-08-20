import { apiClient } from '@/shared/api/client'
import type { AnneeUniversitaire } from './academic-year.types'

export async function fetchAnneesUniversitaires(): Promise<AnneeUniversitaire[]> {
  const { data } = await apiClient.get<AnneeUniversitaire[]>('/annees-universitaires')
  return data
}

export async function basculerAnneeUniversitaire(): Promise<AnneeUniversitaire> {
  const { data } = await apiClient.post<AnneeUniversitaire>('/annees-universitaires/bascule')
  return data
}
