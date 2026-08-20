import axios from 'axios'

type AnneeProvider = () => number | null

let getAnneeId: AnneeProvider = () => null

/** Wired once by app/main.ts to the `context` store — client.ts must never import Pinia directly. */
export function setAnneeProvider(provider: AnneeProvider): void {
  getAnneeId = provider
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

apiClient.interceptors.request.use((config) => {
  const anneeId = getAnneeId()
  if (!anneeId) return config

  if (config.method === 'get' || config.method === 'delete') {
    config.params = { annee_id: anneeId, ...config.params }
  } else {
    config.data = { annee_id: anneeId, ...config.data }
  }
  return config
})
