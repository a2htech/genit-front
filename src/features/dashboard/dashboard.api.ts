import { apiClient } from '@/shared/api/client'
import type { Dashboard } from './dashboard.types'

export async function fetchDashboard(): Promise<Dashboard> {
  const { data } = await apiClient.get<{ data: Dashboard }>('/dashboard')
  return data.data
}
