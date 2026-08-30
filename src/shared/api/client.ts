import axios, { isAxiosError } from 'axios'

type TokenProvider = () => Promise<string | null>
type UnauthorizedHandler = () => void

let getToken: TokenProvider = () => Promise.resolve(null)
let onUnauthorized: UnauthorizedHandler = () => {}

/** Wired once by app/main.ts to Clerk's useAuth().getToken — client.ts must never import Clerk directly. */
export function setAuthTokenProvider(provider: TokenProvider): void {
  getToken = provider
}

/** Wired once by app/main.ts to a router redirect — client.ts must never import the router directly. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  onUnauthorized = handler
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

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 403) {
      onUnauthorized()
    }
    return Promise.reject(error)
  },
)
