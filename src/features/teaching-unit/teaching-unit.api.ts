import { apiClient } from '@/shared/api/client'
import type { Niveau } from '@/features/academic-year'
import type { Matiere, MatiereFormValues, MatiereUpdatePayload, UniteEnseignement } from './teaching-unit.types'

export async function fetchUnitesEnseignement(niveau: Niveau): Promise<UniteEnseignement[]> {
  const { data } = await apiClient.get<UniteEnseignement[]>('/unites-enseignement', {
    params: { niveau },
  })
  return data
}

export async function fetchMatieres(niveau: Niveau): Promise<Matiere[]> {
  const { data } = await apiClient.get<Matiere[]>('/matieres', { params: { niveau } })
  return data
}

export async function createMatiere(payload: MatiereFormValues): Promise<Matiere> {
  const { data } = await apiClient.post<Matiere>('/matieres', payload)
  return data
}

export async function updateMatiere(id: string, payload: MatiereUpdatePayload): Promise<Matiere> {
  const { data } = await apiClient.put<Matiere>(`/matieres/${id}`, payload)
  return data
}

export async function deleteMatiere(id: string): Promise<void> {
  await apiClient.delete(`/matieres/${id}`)
}
