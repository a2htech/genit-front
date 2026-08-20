import { isAxiosError } from 'axios'

export class ApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.status = status
  }
}

export function toApiError(error: unknown): ApiError {
  if (isAxiosError<{ message?: string }>(error)) {
    return new ApiError(error.response?.data?.message ?? error.message, error.response?.status)
  }
  return new ApiError('Erreur inattendue.')
}
