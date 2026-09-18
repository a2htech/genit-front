import { useQuery } from '@tanstack/vue-query'
import { fetchDashboard } from './dashboard.api'

export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  })
}
