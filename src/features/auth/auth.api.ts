import { apiClient } from '@/shared/api/client'
import type { Me } from './auth.types'

export async function fetchMe(): Promise<Me> {
  const { data } = await apiClient.get<{ data: Me }>('/user')
  return data.data
}
