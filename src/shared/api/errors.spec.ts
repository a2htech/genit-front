import { AxiosError, type AxiosResponse } from 'axios'
import { expect, it } from 'bun:test'
import { apiErrorMessage } from './errors'

const httpError = (data: unknown) =>
  new AxiosError('Request failed', undefined, undefined, undefined, { data } as AxiosResponse)

it.each([
  [
    'Le nom est requis.',
    httpError({ message: 'The given data was invalid.', errors: { name: ['Le nom est requis.'] } }),
  ],
  ['Année introuvable.', httpError({ message: 'Année introuvable.' })],
  ['Request failed', httpError(undefined)],
  ['Erreur inattendue.', new Error('boom')],
])('%s', (message, error) => {
  expect(apiErrorMessage(error)).toBe(message)
})
