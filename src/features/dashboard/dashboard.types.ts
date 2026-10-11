import type { Level } from '@/features/academic-year'
import type { Role } from '@/features/auth'
import type { AcademicStatusCode } from '@/features/student'

export interface DashboardAcademicYear {
  year: number
  isCurrent: boolean
}

export interface DashboardStudents {
  total: number
  byClass: Partial<Record<Level, number>>
}

export interface DashboardCatalog {
  teachingUnits: number
  subjects: number
}

export interface DashboardAnnualResults {
  calculated: number
  pending: number
  byStatus: Partial<Record<AcademicStatusCode, number>>
  expiredCumul: number
}

export interface DashboardScores {
  totalEntered: number
  /** null tant qu'aucune note n'est saisie ; `retakeRate` vaut 0 dans ce cas, jamais null. */
  averageScore: number | null
  retakeRate: number
}

export interface MinimalDashboard {
  role: Role
  /** null tant qu'aucune année universitaire n'est configurée côté back. */
  academicYear: DashboardAcademicYear | null
  students: DashboardStudents
  catalog: DashboardCatalog
}

export interface FullDashboard extends MinimalDashboard {
  annualResults: DashboardAnnualResults
  scores: DashboardScores
}

export type Dashboard = MinimalDashboard | FullDashboard

/** Le back choisit la version selon `dashboard.view-full` : on lit la forme reçue, pas le rôle. */
export function isFullDashboard(dashboard: Dashboard): dashboard is FullDashboard {
  return 'scores' in dashboard
}
