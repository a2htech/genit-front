import { isAxiosError } from 'axios'

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

interface LaravelErrorBody {
  message?: string
  errors?: Record<string, string[]>
}

export function toApiError(error: unknown): ApiError {
  if (isAxiosError<LaravelErrorBody>(error)) {
    const body = error.response?.data
    // Laravel's top-level message is often the generic "The given data was invalid." —
    // the useful detail lives in `errors`, so surface the first field error when present.
    const detail = body?.errors && Object.values(body.errors)[0]?.[0]
    return new ApiError(detail ?? body?.message ?? error.message, error.response?.status)
  }
  return new ApiError('Erreur inattendue.')
}
