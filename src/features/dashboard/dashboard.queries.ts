import { useQuery } from '@tanstack/vue-query'
import { fetchDashboard } from './dashboard.api'

export const dashboardKey = ['dashboard'] as const

export function useDashboardQuery() {
  return useQuery({
    queryKey: dashboardKey,
    queryFn: fetchDashboard,
  })
}
