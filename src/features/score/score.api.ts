import { apiClient } from '@/shared/api/client'
import type { Niveau } from '@/features/academic-year'
import type { NoteRow, SessionExamen } from './score.types'

export interface FetchNotesParams {
  matiereId: string
  session: SessionExamen
  niveau: Niveau
}

export async function fetchNotes(params: FetchNotesParams): Promise<NoteRow[]> {
  const { data } = await apiClient.get<NoteRow[]>('/notes', {
    params: { matiere_id: params.matiereId, session: params.session, niveau: params.niveau },
  })
  return data
}

export interface UpsertNotePayload {
  matiereId: string
  session: SessionExamen
  etudiantId: string
  valeur: number | null
}

export async function upsertNote(payload: UpsertNotePayload): Promise<void> {
  await apiClient.put('/notes', {
    matiere_id: payload.matiereId,
    session: payload.session,
    etudiant_id: payload.etudiantId,
    valeur: payload.valeur,
  })
}

export async function validerSaisie(matiereId: string, session: SessionExamen): Promise<void> {
  await apiClient.post('/notes/valider', { matiere_id: matiereId, session })
}

export interface SaisieProgress {
  filled: number
  total: number
}

export async function fetchSaisieProgress(niveau: Niveau): Promise<SaisieProgress> {
  const { data } = await apiClient.get<SaisieProgress>('/notes/progression', { params: { niveau } })
  return data
}
