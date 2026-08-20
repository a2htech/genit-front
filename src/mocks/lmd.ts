import type { Matiere, UniteEnseignement } from '@/features/teaching-unit'
import { state } from './data'

type Session = 'normale' | 'rattrapage'

export function noteFor(etudiantId: string, matiereId: string, session: Session): number | undefined {
  return state.notes[etudiantId]?.[matiereId]?.[session]
}

export function mention(moy: number | null): string {
  if (moy === null) return '—'
  if (moy < 10) return 'NV'
  if (moy < 12) return 'VP'
  if (moy < 14) return 'VAB'
  if (moy < 16) return 'VB'
  return 'VTB'
}

export function matieresDeUe(ueId: string): Matiere[] {
  return state.matieres.filter((m) => m.ueId === ueId)
}

export function ueMoyenne(etudiantId: string, ue: UniteEnseignement, session: Session): number | null {
  let sum = 0
  let coefSum = 0
  for (const m of matieresDeUe(ue.id)) {
    const n = noteFor(etudiantId, m.id, session)
    if (typeof n === 'number') {
      sum += n * m.coefficient
      coefSum += m.coefficient
    }
  }
  return coefSum ? sum / coefSum : null
}

export function moyenneGenerale(etudiantId: string, session: Session, ues: UniteEnseignement[]): number | null {
  let sum = 0
  let creditSum = 0
  for (const ue of ues) {
    const m = ueMoyenne(etudiantId, ue, session)
    if (m !== null) {
      sum += m * ue.credits
      creditSum += ue.credits
    }
  }
  return creditSum ? sum / creditSum : null
}

/** Décision de la fiche "Résultats" — fondée sur la moyenne générale et le nombre d'UE en dette. */
export function decisionParMoyenne(
  moyGenerale: number | null,
  uesEnDette: number,
): { code: 'admis' | 'dettes' | 'redouble' | 'incomplet'; label: string } {
  if (moyGenerale === null) return { code: 'incomplet', label: 'Incomplet' }
  if (moyGenerale >= 10 && uesEnDette === 0) return { code: 'admis', label: 'ADMIS(E)' }
  if (moyGenerale >= 8 && uesEnDette <= 1) return { code: 'dettes', label: 'ADMIS(E) AVEC DETTES' }
  return { code: 'redouble', label: 'REDOUBLE' }
}

/** Décision affichée sur le bulletin individuel — fondée sur le ratio de crédits validés. */
export function decisionParCredits(
  totalCredits: number,
  totalValides: number,
): { code: 'admis' | 'dettes' | 'redouble' | 'incomplet'; label: string } {
  if (totalCredits === 0) return { code: 'incomplet', label: 'Incomplet' }
  if (totalValides === totalCredits) return { code: 'admis', label: 'ADMIS(E)' }
  if (totalValides >= totalCredits * 0.6) return { code: 'dettes', label: 'ADMIS(E) AVEC DETTES' }
  return { code: 'redouble', label: 'REDOUBLE' }
}

export function matieresARepasser(etudiantId: string, session: Session): Matiere[] {
  return state.matieres.filter((m) => {
    const n = noteFor(etudiantId, m.id, session)
    return typeof n === 'number' && n < 10
  })
}

export function ectsAcquis(etudiantId: string, session: Session, ues: UniteEnseignement[]): number {
  let total = 0
  for (const ue of ues) {
    const m = ueMoyenne(etudiantId, ue, session)
    if (m !== null && m >= 10) total += ue.credits
  }
  return total
}
