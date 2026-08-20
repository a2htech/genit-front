import { apiClient } from '@/shared/api/client'
import type { Niveau } from '@/features/academic-year'
import type { Bulletin, ResultatsResponse } from './decision.types'

export async function fetchBulletin(etudiantId: string, niveau: Niveau): Promise<Bulletin> {
  const { data } = await apiClient.get<Bulletin>(`/bulletins/${etudiantId}`, { params: { niveau } })
  return data
}

export async function fetchResultats(niveau: Niveau): Promise<ResultatsResponse> {
  const { data } = await apiClient.get<ResultatsResponse>('/resultats', { params: { niveau } })
  return data
}
