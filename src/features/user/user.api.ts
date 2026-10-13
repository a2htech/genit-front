import { apiClient } from '@/shared/api/client'
import { fetchAllPages, type LaravelPage } from '@/shared/api/pagination'
import type { User } from './user.types'

export async function fetchUsers(): Promise<User[]> {
  return fetchAllPages((page) =>
    apiClient.get<LaravelPage<User>>('/users', { params: { per_page: 100, page } }).then((r) => r.data),
  )
}

export async function assignSubjects(clerkId: string, subjectIds: number[]): Promise<User> {
  const { data } = await apiClient.put<{ data: User }>(`/users/${clerkId}/subjects`, { subject_ids: subjectIds })
  return data.data
}
