export type DecisionCode = 'admis' | 'dettes' | 'redouble' | 'incomplet'

export interface BulletinMatiereRow {
  intitule: string
  coefficient: number
  noteNormale: number | null
  noteRattrapage: number | null
}

export interface BulletinUeBloc {
  ue: { code: string; intitule: string; credits: number }
  normaleMoyenne: number | null
  rattrapageMoyenne: number | null
  normaleMention: string
  rattrapageMention: string
  normaleCreditsAcquis: number
  rattrapageCreditsAcquis: number
  matieres: BulletinMatiereRow[]
}

export interface BulletinSemestreDetail {
  numero: number
  ueBlocs: BulletinUeBloc[]
  creditsTotal: number
  creditsValidesNormale: number
  creditsValidesRattrapage: number
}

export interface BulletinSemestreHistorique {
  numero: number
  creditsValides: number
  creditsTotal: number
}

interface BulletinBase {
  etudiantId: string
  nomComplet: string
  initiales: string
  matricule: string
  dateNaissance: string
  niveauLabel: string
  anneeLabel: string
  decisionCode: DecisionCode
  decisionLabel: string
}

export type Bulletin =
  | (BulletinBase & { isHistorique: true; semestres: BulletinSemestreHistorique[] })
  | (BulletinBase & { isHistorique: false; semestres: BulletinSemestreDetail[] })

export interface ResultatRow {
  etudiantId: string
  nomComplet: string
  decisionCode: DecisionCode
  decisionLabel: string
  ects: number
  dettes: string[]
  matieresARepasser: string[]
}

export interface ResultatsResponse {
  stats: { admis: number; dettes: number; redouble: number }
  creditsTotal: number
  rows: ResultatRow[]
}
