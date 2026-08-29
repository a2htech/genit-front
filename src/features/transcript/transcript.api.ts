import { isAxiosError } from 'axios'
import { apiClient } from '@/shared/api/client'
import type { Level } from '@/features/academic-year'
import type { AnnualResult, Transcript } from './transcript.types'

export async function fetchTranscript(studentId: number): Promise<Transcript> {
  const { data } = await apiClient.get<{ data: Transcript }>(`/transcripts/${studentId}`)
  return data.data
}

/** Niveau historique : 404 = pas assez de notes saisies à ce niveau, pas une erreur à propager. */
export async function fetchTranscriptForClass(studentId: number, level: Level): Promise<Transcript | null> {
  try {
    const { data } = await apiClient.get<{ data: Transcript }>(`/transcripts/${studentId}/${level}`)
    return data.data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export async function fetchAnnualResults(level: Level): Promise<AnnualResult[]> {
  const { data } = await apiClient.get<{ data: AnnualResult[] }>(`/students/annual-results/${level}`)
  return data.data
}

/** Job lancé côté back (synchrone ou en file selon QUEUE_CONNECTION) ; le front se contente d'invalider la liste après. */
export async function calculateAllAnnualResults(): Promise<void> {
  await apiClient.post('/students/annual-results/calculate-all')
}

export async function downloadTranscriptPdf(studentId: number): Promise<void> {
  const response = await apiClient.get(`/transcripts/${studentId}/pdf`, { responseType: 'blob' })
  const url = URL.createObjectURL(response.data as Blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `fiche-resultats-${studentId}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
