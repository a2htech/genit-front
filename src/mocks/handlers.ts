import { http, HttpResponse } from 'msw'
import type { Etudiant, EtudiantFormValues } from '@/features/student'
import type { Matiere, MatiereFormValues, MatiereUpdatePayload } from '@/features/teaching-unit'
import type { Niveau } from '@/features/academic-year'
import type { Bulletin, BulletinUeBloc } from '@/features/decision'
import { state } from './data'
import {
  decisionParCredits,
  decisionParMoyenne,
  ectsAcquis,
  matieresARepasser,
  mention,
  moyenneGenerale,
  noteFor,
  ueMoyenne,
} from './lmd'

const API = import.meta.env.VITE_API_URL
const url = (path: string) => `${API}${path}`

function annee(id: string | null) {
  return state.annees.find((a) => a.id === id) ?? state.annees.find((a) => a.statut === 'active')!
}

export const handlers = [
  http.get(url('/annees-universitaires'), () => HttpResponse.json(state.annees)),

  http.post(url('/annees-universitaires/bascule'), () => {
    const current = state.annees.find((a) => a.statut === 'active')
    if (current) current.statut = 'archivee'
    const [start, end] = (current?.libelle ?? '2025-2026').split('-').map(Number)
    const nextEnd = (end ?? 0) + 1
    const nouvelle = { id: String(nextEnd), libelle: `${(start ?? 0) + 1}-${nextEnd}`, statut: 'active' as const }
    state.annees.unshift(nouvelle)
    return HttpResponse.json(nouvelle)
  }),

  http.get(url('/etudiants'), ({ request }) => {
    const params = new URL(request.url).searchParams
    const niveau = params.get('niveau')
    const search = (params.get('search') ?? '').toLowerCase().trim()
    const page = Number(params.get('page') ?? '1')
    const perPage = Number(params.get('perPage') ?? '5')

    let list = state.etudiants.filter((e) => e.niveau === niveau)
    if (search) {
      list = list.filter((e) => `${e.nom} ${e.prenom} ${e.matricule}`.toLowerCase().includes(search))
    }
    const total = list.length
    const start = (page - 1) * perPage
    return HttpResponse.json({ data: list.slice(start, start + perPage), meta: { page, perPage, total } })
  }),

  http.post(url('/etudiants'), async ({ request }) => {
    const payload = (await request.json()) as EtudiantFormValues
    const created: Etudiant = { id: `e${Date.now()}`, ...payload }
    state.etudiants.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put(url('/etudiants/:id'), async ({ request, params }) => {
    const payload = (await request.json()) as EtudiantFormValues
    const idx = state.etudiants.findIndex((e) => e.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    state.etudiants[idx] = { ...state.etudiants[idx]!, ...payload }
    return HttpResponse.json(state.etudiants[idx])
  }),

  http.delete(url('/etudiants/:id'), ({ params }) => {
    state.etudiants = state.etudiants.filter((e) => e.id !== params.id)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(url('/unites-enseignement'), ({ request }) => {
    const niveau = new URL(request.url).searchParams.get('niveau')
    return HttpResponse.json(state.ues.filter((u) => u.niveau === niveau))
  }),

  http.get(url('/matieres'), ({ request }) => {
    const niveau = new URL(request.url).searchParams.get('niveau')
    return HttpResponse.json(state.matieres.filter((m) => m.niveau === niveau))
  }),

  http.post(url('/matieres'), async ({ request }) => {
    const payload = (await request.json()) as MatiereFormValues
    const ue = state.ues.find((u) => u.id === payload.ueId)
    const created: Matiere = { id: `m${Date.now()}`, ...payload, niveau: ue?.niveau ?? 'L1' }
    state.matieres.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),

  http.put(url('/matieres/:id'), async ({ request, params }) => {
    const payload = (await request.json()) as MatiereUpdatePayload
    const idx = state.matieres.findIndex((m) => m.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    state.matieres[idx] = { ...state.matieres[idx]!, ...payload }
    return HttpResponse.json(state.matieres[idx])
  }),

  http.delete(url('/matieres/:id'), ({ params }) => {
    state.matieres = state.matieres.filter((m) => m.id !== params.id)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(url('/notes'), ({ request }) => {
    const params = new URL(request.url).searchParams
    const matiereId = params.get('matiere_id')!
    const session = params.get('session') as 'normale' | 'rattrapage'
    const niveau = params.get('niveau')
    const rows = state.etudiants
      .filter((e) => e.niveau === niveau)
      .map((e) => ({
        etudiantId: e.id,
        matricule: e.matricule,
        nomComplet: `${e.prenom} ${e.nom}`,
        valeur: noteFor(e.id, matiereId, session) ?? null,
      }))
    return HttpResponse.json(rows)
  }),

  http.put(url('/notes'), async ({ request }) => {
    const body = (await request.json()) as {
      matiere_id: string
      session: 'normale' | 'rattrapage'
      etudiant_id: string
      valeur: number | null
    }
    state.notes[body.etudiant_id] = state.notes[body.etudiant_id] ?? {}
    const forMatiere = (state.notes[body.etudiant_id]![body.matiere_id] ??= {})
    if (body.valeur === null) delete forMatiere[body.session]
    else forMatiere[body.session] = body.valeur
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(url('/notes/valider'), () => new HttpResponse(null, { status: 204 })),

  http.get(url('/notes/progression'), ({ request }) => {
    const niveau = new URL(request.url).searchParams.get('niveau')
    const etudiants = state.etudiants.filter((e) => e.niveau === niveau)
    const matieres = state.matieres.filter((m) => m.niveau === niveau)
    const total = etudiants.length * matieres.length
    let filled = 0
    for (const e of etudiants) {
      for (const m of matieres) {
        if (typeof noteFor(e.id, m.id, 'normale') === 'number') filled++
      }
    }
    return HttpResponse.json({ filled, total })
  }),

  http.get(url('/bulletins/:etudiantId'), ({ request, params }) => {
    const niveauView = new URL(request.url).searchParams.get('niveau') as Niveau
    const etudiant = state.etudiants.find((e) => e.id === params.etudiantId)
    if (!etudiant) return new HttpResponse(null, { status: 404 })

    const anneeActive = annee(null)
    const initiales = `${etudiant.prenom[0] ?? ''}${etudiant.nom[0] ?? ''}`
    const base = {
      etudiantId: etudiant.id,
      nomComplet: `${etudiant.prenom} ${etudiant.nom}`,
      initiales,
      matricule: etudiant.matricule,
      dateNaissance: etudiant.dateNaissance,
    }

    if (niveauView !== etudiant.niveau) {
      const hist = (state.historiqueNiveaux[etudiant.id] ?? []).find((h) => h.niveau === niveauView)
      const decLabel =
        hist?.decision === 'admis' ? 'ADMIS(E)' : hist?.decision === 'dettes' ? 'ADMIS(E) AVEC DETTES' : hist?.decision === 'redouble' ? 'REDOUBLE' : 'Incomplet'
      const decCode = (hist?.decision as Bulletin['decisionCode']) ?? 'incomplet'
      const bulletin: Bulletin = {
        ...base,
        niveauLabel: niveauView,
        anneeLabel: hist?.annee ?? '—',
        isHistorique: true,
        semestres: hist?.semestres ?? [],
        decisionCode: decCode,
        decisionLabel: decLabel,
      }
      return HttpResponse.json(bulletin)
    }

    const uesDuNiveau = state.ues.filter((u) => u.niveau === niveauView)
    const semestres = (['S1', 'S2'] as const).map((semCode, idx) => {
      const semUes = uesDuNiveau.filter((u) => u.semestre === semCode)
      const ueBlocs: BulletinUeBloc[] = semUes.map((ue) => {
        const normaleMoy = ueMoyenne(etudiant.id, ue, 'normale')
        const rattrapageMoy = ueMoyenne(etudiant.id, ue, 'rattrapage')
        return {
          ue: { code: ue.code, intitule: ue.intitule, credits: ue.credits },
          normaleMoyenne: normaleMoy,
          rattrapageMoyenne: rattrapageMoy,
          normaleMention: mention(normaleMoy),
          rattrapageMention: mention(rattrapageMoy),
          normaleCreditsAcquis: normaleMoy !== null && normaleMoy >= 10 ? ue.credits : 0,
          rattrapageCreditsAcquis:
            rattrapageMoy !== null && rattrapageMoy >= 10
              ? ue.credits
              : normaleMoy !== null && normaleMoy >= 10
                ? ue.credits
                : 0,
          matieres: state.matieres
            .filter((m) => m.ueId === ue.id)
            .map((m) => ({
              intitule: m.intitule,
              coefficient: m.coefficient,
              noteNormale: noteFor(etudiant.id, m.id, 'normale') ?? null,
              noteRattrapage: noteFor(etudiant.id, m.id, 'rattrapage') ?? null,
            })),
        }
      })
      const creditsTotal = semUes.reduce((a, u) => a + u.credits, 0)
      const creditsValidesNormale = ueBlocs.reduce((a, b) => a + b.normaleCreditsAcquis, 0)
      const creditsValidesRattrapage = ueBlocs.reduce((a, b) => a + b.rattrapageCreditsAcquis, 0)
      return { numero: idx + 1, ueBlocs, creditsTotal, creditsValidesNormale, creditsValidesRattrapage }
    })

    const totalCredits = semestres.reduce((a, s) => a + s.creditsTotal, 0)
    const totalValides = semestres.reduce((a, s) => a + s.creditsValidesNormale, 0)
    const decision = decisionParCredits(totalCredits, totalValides)

    const bulletin: Bulletin = {
      ...base,
      niveauLabel: etudiant.niveau,
      anneeLabel: anneeActive.libelle,
      isHistorique: false,
      semestres,
      decisionCode: decision.code,
      decisionLabel: decision.label,
    }
    return HttpResponse.json(bulletin)
  }),

  http.get(url('/resultats'), ({ request }) => {
    const niveau = new URL(request.url).searchParams.get('niveau') as Niveau
    const ues = state.ues.filter((u) => u.niveau === niveau)
    const etudiants = state.etudiants.filter((e) => e.niveau === niveau)

    const rows = etudiants.map((e) => {
      const uesEnDette = ues.filter((ue) => {
        const m = ueMoyenne(e.id, ue, 'normale')
        return m !== null && m < 10
      })
      const mg = moyenneGenerale(e.id, 'normale', ues)
      const decision = decisionParMoyenne(mg, uesEnDette.length)
      return {
        etudiantId: e.id,
        nomComplet: `${e.prenom} ${e.nom}`,
        decisionCode: decision.code,
        decisionLabel: decision.label,
        ects: ectsAcquis(e.id, 'normale', ues),
        dettes: state.dettesAnterieures[e.id] ?? [],
        matieresARepasser: matieresARepasser(e.id, 'normale').map((m) => m.code),
      }
    })

    const stats = {
      admis: rows.filter((r) => r.decisionCode === 'admis').length,
      dettes: rows.filter((r) => r.decisionCode === 'dettes').length,
      redouble: rows.filter((r) => r.decisionCode === 'redouble').length,
    }
    const creditsTotal = ues.reduce((a, ue) => a + ue.credits, 0)
    return HttpResponse.json({ stats, creditsTotal, rows })
  }),
]
