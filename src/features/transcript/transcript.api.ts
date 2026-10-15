import { isAxiosError } from 'axios'
import { apiClient } from '@/shared/api/client'
import type { Level } from '@/features/academic-year'
import type { Student } from '@/features/student'
import type { AnnualResult, AnnualResultsSummary, Transcript } from './transcript.types'

export async function fetchTranscript(studentId: number): Promise<Transcript> {
  const { data } = await apiClient.get<{ data: Transcript }>(`/students/${studentId}/transcript`)
  return data.data
}

/** Niveau historique : 404 = pas assez de notes saisies à ce niveau, pas une erreur à propager. */
export async function fetchTranscriptForClass(studentId: number, level: Level): Promise<Transcript | null> {
  try {
    const { data } = await apiClient.get<{ data: Transcript }>(`/students/${studentId}/transcripts/${level}`)
    return data.data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export async function fetchAnnualResults(level: Level): Promise<AnnualResult[]> {
  const { data } = await apiClient.get<{ data: AnnualResult[] }>('/annual-results', { params: { class: level } })
  return data.data
}

export async function calculateAnnualResultsForClass(level: Level): Promise<void> {
  await apiClient.post('/annual-results/calculations', { class: level })
}

/** Réponse renvoyée telle quelle par le back (pas d'enveloppe `data`). */
export async function fetchAnnualResultsSummary(): Promise<AnnualResultsSummary> {
  const { data } = await apiClient.get<AnnualResultsSummary>('/annual-results/summary')
  return data
}

export async function fetchStudentsMissingAnnualResults(): Promise<Student[]> {
  const { data } = await apiClient.get<{ data: Student[] }>('/annual-results/missing')
  return data.data
}

/** Recalcule tous les niveaux, décisions déjà calculées comprises. Répond 202 : le calcul part
 *  en file et n'est pas fini au retour. */
export async function calculateAllAnnualResults(): Promise<void> {
  await apiClient.post('/annual-results/calculations', {})
}

/** Même URL que le bulletin JSON : seul le header `Accept` fait revenir le PDF. */
export async function downloadTranscriptPdf(studentId: number): Promise<void> {
  const response = await apiClient.get(`/students/${studentId}/transcript`, {
    headers: { Accept: 'application/pdf' },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `fiche-resultats-${studentId}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
