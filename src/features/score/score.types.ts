export type SessionExamen = 'normale' | 'rattrapage'

export interface NoteRow {
  etudiantId: string
  matricule: string
  nomComplet: string
  valeur: number | null
}
