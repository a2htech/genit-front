import type { Niveau } from '@/features/academic-year'

export interface UniteEnseignement {
  id: string
  code: string
  intitule: string
  credits: number
  semestre: 'S1' | 'S2'
  niveau: Niveau
}

export interface Matiere {
  id: string
  code: string
  intitule: string
  coefficient: number
  ueId: string | null
  enseignant: string
  /** Résolu côté back à la création à partir de l'UE choisie ; ne bouge pas si la matière est détachée. */
  niveau: Niveau
}

export interface MatiereFormValues {
  code: string
  intitule: string
  coefficient: number
  ueId: string
  enseignant: string
}

export type MatiereUpdatePayload = Partial<Omit<MatiereFormValues, 'ueId'>> & { ueId?: string | null }
