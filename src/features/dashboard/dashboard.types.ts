import type { Level } from '@/features/academic-year'
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
  averageScore: number
  retakeRate: number
}

export interface UserDashboard {
  role: 'user'
  academicYear: DashboardAcademicYear
  students: DashboardStudents
  catalog: DashboardCatalog
}

export interface AdminDashboard extends Omit<UserDashboard, 'role'> {
  role: 'admin'
  annualResults: DashboardAnnualResults
  scores: DashboardScores
}

export type Dashboard = UserDashboard | AdminDashboard

export function isAdminDashboard(dashboard: Dashboard): dashboard is AdminDashboard {
  return dashboard.role === 'admin'
}
