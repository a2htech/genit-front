import { expect, it, mock } from 'bun:test'
import { apiClient, setAuthTokenProvider, setUnauthorizedHandler } from './client'
import { mockApi } from './testing'

it('sends the Clerk token as a Bearer header', async () => {
  setAuthTokenProvider(() => Promise.resolve('jwt'))
  let authorization: unknown
  mockApi((config) => {
    authorization = config.headers.Authorization
    return {}
  })
  await apiClient.get('/user')
  expect(authorization).toBe('Bearer jwt')
})

it('hands a 403 over to the unauthorized handler', async () => {
  const onUnauthorized = mock(() => {})
  setUnauthorizedHandler(onUnauthorized)
  mockApi(() => ({ status: 403 }))
  await expect(apiClient.get('/users')).rejects.toThrow()
  expect(onUnauthorized).toHaveBeenCalledTimes(1)
})
