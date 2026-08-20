import type { Niveau } from '@/features/academic-year'

export type StatutEtudiant = 'Inscrit' | 'Non inscrit'

export interface Etudiant {
  id: string
  matricule: string
  nom: string
  prenom: string
  dateNaissance: string
  statut: StatutEtudiant
  niveau: Niveau
}

export interface EtudiantFormValues {
  matricule: string
  nom: string
  prenom: string
  dateNaissance: string
  statut: StatutEtudiant
  niveau: Niveau
}

export interface EtudiantsPage {
  data: Etudiant[]
  meta: { page: number; perPage: number; total: number }
}
