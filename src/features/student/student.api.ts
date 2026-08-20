import { apiClient } from '@/shared/api/client'
import type { Niveau } from '@/features/academic-year'
import type { Etudiant, EtudiantFormValues, EtudiantsPage } from './student.types'

export interface FetchEtudiantsParams {
  niveau: Niveau
  search: string
  page: number
  perPage: number
}

export async function fetchEtudiants(params: FetchEtudiantsParams): Promise<EtudiantsPage> {
  const { data } = await apiClient.get<EtudiantsPage>('/etudiants', { params })
  return data
}

export async function createEtudiant(payload: EtudiantFormValues): Promise<Etudiant> {
  const { data } = await apiClient.post<Etudiant>('/etudiants', payload)
  return data
}

export async function updateEtudiant(id: string, payload: EtudiantFormValues): Promise<Etudiant> {
  const { data } = await apiClient.put<Etudiant>(`/etudiants/${id}`, payload)
  return data
}

export async function deleteEtudiant(id: string): Promise<void> {
  await apiClient.delete(`/etudiants/${id}`)
}
