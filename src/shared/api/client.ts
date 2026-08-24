import axios from 'axios'

type TokenProvider = () => Promise<string | null>

let getToken: TokenProvider = () => Promise.resolve(null)

/** Wired once by app/main.ts to Clerk's useAuth().getToken — client.ts must never import Clerk directly. */
export function setAuthTokenProvider(provider: TokenProvider): void {
  getToken = provider
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
