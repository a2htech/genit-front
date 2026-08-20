import type { AnneeUniversitaire, Niveau } from '@/features/academic-year'
import type { Etudiant } from '@/features/student'
import type { Matiere, UniteEnseignement } from '@/features/teaching-unit'

export const state = {
  annees: [
    { id: '2026', libelle: '2025-2026', statut: 'active' },
    { id: '2025', libelle: '2024-2025', statut: 'archivee' },
    { id: '2024', libelle: '2023-2024', statut: 'archivee' },
  ] as AnneeUniversitaire[],

  etudiants: [
    { id: 'e1', matricule: 'L2INF-001', nom: 'Rakotomalala', prenom: 'Hery', dateNaissance: '12/03/2003', statut: 'Inscrit', niveau: 'L2' },
    { id: 'e2', matricule: 'L2INF-002', nom: 'Andriantsoa', prenom: 'Fara', dateNaissance: '24/07/2003', statut: 'Inscrit', niveau: 'L2' },
    { id: 'e3', matricule: 'L2INF-003', nom: 'Rasoanaivo', prenom: 'Tiana', dateNaissance: '02/11/2002', statut: 'Inscrit', niveau: 'L2' },
    { id: 'e4', matricule: 'L2INF-004', nom: 'Ravaka', prenom: 'Nomena', dateNaissance: '18/05/2003', statut: 'Inscrit', niveau: 'L2' },
    { id: 'e5', matricule: 'L2INF-005', nom: 'Andrianina', prenom: 'Solo', dateNaissance: '09/01/2003', statut: 'Inscrit', niveau: 'L2' },
    { id: 'e6', matricule: 'L2INF-006', nom: 'Rakotoarisoa', prenom: 'Mialy', dateNaissance: '30/09/2003', statut: 'Inscrit', niveau: 'L2' },
    { id: 'e7', matricule: 'L2INF-007', nom: 'Tovonanahary', prenom: 'Fy', dateNaissance: '14/02/2003', statut: 'Inscrit', niveau: 'L2' },
    { id: 'e8', matricule: 'L2INF-008', nom: 'Rabemananjara', prenom: 'Njaka', dateNaissance: '27/06/2003', statut: 'Non inscrit', niveau: 'L2' },
    { id: 'e9', matricule: 'L1INF-001', nom: 'Rakotobe', prenom: 'Fenitra', dateNaissance: '15/04/2005', statut: 'Inscrit', niveau: 'L1' },
    { id: 'e10', matricule: 'L1INF-002', nom: 'Andriamampianina', prenom: 'Voahirana', dateNaissance: '03/08/2005', statut: 'Inscrit', niveau: 'L1' },
    { id: 'e11', matricule: 'L1INF-003', nom: 'Randriamampionona', prenom: 'Iavotiana', dateNaissance: '21/01/2005', statut: 'Inscrit', niveau: 'L1' },
    { id: 'e12', matricule: 'L1INF-004', nom: 'Rasolofoniaina', prenom: 'Miora', dateNaissance: '09/10/2004', statut: 'Inscrit', niveau: 'L1' },
    { id: 'e13', matricule: 'L1INF-005', nom: 'Razanadrakoto', prenom: 'Faniry', dateNaissance: '27/05/2005', statut: 'Inscrit', niveau: 'L1' },
  ] as Etudiant[],

  ues: [
    { id: 'u1', code: 'UE-INF201', intitule: 'Fondamentaux Informatiques', credits: 8, semestre: 'S1', niveau: 'L2' },
    { id: 'u2', code: 'UE-MAT201', intitule: "Mathématiques pour l'informatique", credits: 8, semestre: 'S1', niveau: 'L2' },
    { id: 'u3', code: 'UE-LC201', intitule: 'Langues et Communication', credits: 6, semestre: 'S2', niveau: 'L2' },
    { id: 'u4', code: 'UE-PRJ201', intitule: 'Projet et Stage', credits: 8, semestre: 'S2', niveau: 'L2' },
    { id: 'u5', code: 'UE-INF101', intitule: "Introduction à l'informatique", credits: 6, semestre: 'S1', niveau: 'L1' },
    { id: 'u6', code: 'UE-MAT101', intitule: 'Mathématiques générales', credits: 6, semestre: 'S1', niveau: 'L1' },
    { id: 'u7', code: 'UE-LC101', intitule: 'Communication', credits: 4, semestre: 'S2', niveau: 'L1' },
  ] as UniteEnseignement[],

  matieres: [
    { id: 'm1', code: 'INF201-A', intitule: 'Algorithmique avancée', coefficient: 3, ueId: 'u1', enseignant: 'M. Andrianjafy', niveau: 'L2' },
    { id: 'm2', code: 'INF201-B', intitule: "Systèmes d'exploitation", coefficient: 2, ueId: 'u1', enseignant: 'M. Andrianjafy', niveau: 'L2' },
    { id: 'm3', code: 'INF201-C', intitule: 'Réseaux', coefficient: 2, ueId: 'u1', enseignant: 'Mme Razafy', niveau: 'L2' },
    { id: 'm4', code: 'MAT201-A', intitule: 'Analyse', coefficient: 2, ueId: 'u2', enseignant: 'Mme Rasoa', niveau: 'L2' },
    { id: 'm5', code: 'MAT201-B', intitule: 'Probabilités & statistiques', coefficient: 2, ueId: 'u2', enseignant: 'Mme Rasoa', niveau: 'L2' },
    { id: 'm6', code: 'LC201-A', intitule: 'Anglais technique', coefficient: 1, ueId: 'u3', enseignant: 'M. Randrianasolo', niveau: 'L2' },
    { id: 'm7', code: 'LC201-B', intitule: 'Communication écrite', coefficient: 1, ueId: 'u3', enseignant: 'M. Randrianasolo', niveau: 'L2' },
    { id: 'm8', code: 'PRJ201-A', intitule: 'Projet tutoré', coefficient: 3, ueId: 'u4', enseignant: 'Mme Rakotondrabe', niveau: 'L2' },
    { id: 'm9', code: 'PRJ201-B', intitule: 'Gestion de projet', coefficient: 2, ueId: 'u4', enseignant: 'Mme Rakotondrabe', niveau: 'L2' },
    { id: 'm10', code: 'INF101-A', intitule: 'Introduction à la programmation', coefficient: 2, ueId: 'u5', enseignant: 'M. Rakotoson', niveau: 'L1' },
    { id: 'm11', code: 'INF101-B', intitule: 'Bureautique', coefficient: 1, ueId: 'u5', enseignant: 'M. Rakotoson', niveau: 'L1' },
    { id: 'm12', code: 'MAT101-A', intitule: 'Algèbre générale', coefficient: 2, ueId: 'u6', enseignant: 'Mme Ravololona', niveau: 'L1' },
    { id: 'm13', code: 'MAT101-B', intitule: 'Analyse', coefficient: 2, ueId: 'u6', enseignant: 'Mme Ravololona', niveau: 'L1' },
    { id: 'm14', code: 'LC101-A', intitule: 'Expression écrite', coefficient: 1, ueId: 'u7', enseignant: 'Mme Andriamahefa', niveau: 'L1' },
  ] as Matiere[],

  // notes[etudiantId][matiereId] = { normale?, rattrapage? }
  notes: {
    e1: { m1: { normale: 16 }, m2: { normale: 15 }, m3: { normale: 14 }, m4: { normale: 15 }, m5: { normale: 16 }, m6: { normale: 14 }, m7: { normale: 15 }, m8: { normale: 17 }, m9: { normale: 16 } },
    e2: { m1: { normale: 13 }, m2: { normale: 12 }, m3: { normale: 14 }, m4: { normale: 12 }, m5: { normale: 13 }, m6: { normale: 14 }, m7: { normale: 13 }, m8: { normale: 12 }, m9: { normale: 14 } },
    e3: { m1: { normale: 14 }, m2: { normale: 13 }, m3: { normale: 15 }, m4: { normale: 13 }, m5: { normale: 12 }, m6: { normale: 8 }, m7: { normale: 9 }, m8: { normale: 13 }, m9: { normale: 14 } },
    e4: { m1: { normale: 12 }, m2: { normale: 13 }, m3: { normale: 11 }, m4: { normale: 7 }, m5: { normale: 8 }, m6: { normale: 12 }, m7: { normale: 13 }, m8: { normale: 14 }, m9: { normale: 12 } },
    e5: { m1: { normale: 11 }, m2: { normale: 10 }, m3: { normale: 9 }, m4: { normale: 8 }, m5: { normale: 7 }, m6: { normale: 10 }, m7: { normale: 11 }, m8: { normale: 8 }, m9: { normale: 9 } },
    e6: { m1: { normale: 11 }, m2: { normale: 10 }, m3: { normale: 11 }, m4: { normale: 11 }, m5: { normale: 10 }, m6: { normale: 11 }, m7: { normale: 10 }, m8: { normale: 10 }, m9: { normale: 11 } },
    e7: { m1: { normale: 7 }, m2: { normale: 6 }, m3: { normale: 8 }, m4: { normale: 6 }, m5: { normale: 7 }, m6: { normale: 7 }, m7: { normale: 6 }, m8: { normale: 5 }, m9: { normale: 6 } },
    e8: { m1: { normale: 13 }, m2: { normale: 12 }, m3: { normale: 14 }, m4: { normale: 13 }, m5: { normale: 12 }, m6: { normale: 9 }, m7: { normale: 8 }, m8: { normale: 13 }, m9: { normale: 12 } },
    e9: { m10: { normale: 16 }, m11: { normale: 15 }, m12: { normale: 17 }, m13: { normale: 16 }, m14: { normale: 15 } },
    e10: { m10: { normale: 12 }, m11: { normale: 11 }, m12: { normale: 13 }, m13: { normale: 12 }, m14: { normale: 11 } },
    e11: { m10: { normale: 14 }, m11: { normale: 13 }, m12: { normale: 8 }, m13: { normale: 7 }, m14: { normale: 12 } },
    e12: { m10: { normale: 8 }, m11: { normale: 7 }, m12: { normale: 6 }, m13: { normale: 5 }, m14: { normale: 6 } },
    e13: { m10: { normale: 11 }, m11: { normale: 12 }, m12: { normale: 9 }, m13: { normale: 11 }, m14: { normale: 10 } },
  } as Record<string, Record<string, { normale?: number; rattrapage?: number }>>,

  dettesAnterieures: {
    e2: ['L1INF-MAT101 — Algèbre générale'],
    e4: ['L1INF-PHY101 — Physique générale'],
    e7: ['L1INF-MAT101 — Algèbre générale', 'L1INF-INF102 — Structures de données'],
  } as Record<string, string[]>,

  historiqueNiveaux: {
    e1: [{ niveau: 'L1' as Niveau, annee: '2024-2025', decision: 'admis', semestres: [{ numero: 1, creditsValides: 30, creditsTotal: 30 }, { numero: 2, creditsValides: 30, creditsTotal: 30 }] }],
    e2: [{ niveau: 'L1' as Niveau, annee: '2024-2025', decision: 'dettes', semestres: [{ numero: 1, creditsValides: 24, creditsTotal: 30 }, { numero: 2, creditsValides: 27, creditsTotal: 30 }] }],
    e4: [{ niveau: 'L1' as Niveau, annee: '2024-2025', decision: 'dettes', semestres: [{ numero: 1, creditsValides: 21, creditsTotal: 30 }, { numero: 2, creditsValides: 24, creditsTotal: 30 }] }],
    e7: [{ niveau: 'L1' as Niveau, annee: '2024-2025', decision: 'dettes', semestres: [{ numero: 1, creditsValides: 18, creditsTotal: 30 }, { numero: 2, creditsValides: 21, creditsTotal: 30 }] }],
  } as Record<string, { niveau: Niveau; annee: string; decision: string; semestres: { numero: number; creditsValides: number; creditsTotal: number }[] }[]>,
}
