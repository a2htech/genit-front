import { isAxiosError } from 'axios'

interface LaravelErrorBody {
  message?: string
  errors?: Record<string, string[]>
}

/** Le `message` Laravel est souvent le générique "The given data was invalid." : la 1re erreur de champ dit mieux. */
export function apiErrorMessage(error: unknown): string {
  if (!isAxiosError<LaravelErrorBody>(error)) return 'Erreur inattendue.'
  const body = error.response?.data
  const fieldError = body?.errors && Object.values(body.errors)[0]?.[0]
  return fieldError ?? body?.message ?? error.message
}
