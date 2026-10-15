import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { expect, it } from 'bun:test'
import { apiClient } from './client'

/** Une page Laravel unique : sert à la fois d'enveloppe `{ data }` et de réponse paginée. */
export const BODY = { data: [{ id: 1 }], meta: { last_page: 1 } }

type Reply = (config: InternalAxiosRequestConfig) => { status?: number; data?: unknown }

/** Remplace le transport d'apiClient et note chaque appel en « MÉTHODE /url?query corps ». */
export function mockApi(reply: Reply = () => ({ data: BODY })): string[] {
  const requests: string[] = []
  apiClient.defaults.adapter = async (config) => {
    const url = axios.getUri({ url: config.url, params: config.params })
    requests.push([config.method?.toUpperCase(), url, config.data].filter(Boolean).join(' '))
    const { status = 200, data } = reply(config)
    const response = { status, statusText: '', data, headers: {}, config }
    if (status >= 400) throw new AxiosError(`HTTP ${status}`, undefined, config, undefined, response)
    return response
  }
  return requests
}

export function testApiCalls(rows: [request: string, call: () => Promise<unknown>, returns?: unknown][]): void {
  for (const [request, call, returns] of rows) {
    it(request, async () => {
      const requests = mockApi()
      expect(await call()).toEqual(returns)
      expect(requests).toEqual([request])
    })
  }
}
