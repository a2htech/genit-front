import type { InternalAxiosRequestConfig } from 'axios'
import { expect, it, spyOn } from 'bun:test'
import { BODY, mockApi, testApiCalls } from '@/shared/api/testing'
import {
  calculateAllAnnualResults,
  calculateAnnualResultsForClass,
  downloadTranscriptPdf,
  fetchAnnualResults,
  fetchAnnualResultsSummary,
  fetchStudentsMissingAnnualResults,
  fetchTranscript,
  fetchTranscriptForClass,
} from './transcript.api'

// Bun n'a pas de DOM : le lien de téléchargement du PDF est simulé.
Object.assign(globalThis, { document: { createElement: () => ({ click: () => {} }) } })
spyOn(URL, 'createObjectURL').mockReturnValue('blob:pdf')

testApiCalls([
  ['GET /students/5/transcript', () => fetchTranscript(5), BODY.data],
  ['GET /students/5/transcripts/L1', () => fetchTranscriptForClass(5, 'L1'), BODY.data],
  ['GET /students/5/transcript', () => downloadTranscriptPdf(5)],
  ['GET /annual-results?class=L2', () => fetchAnnualResults('L2'), BODY.data],
  ['POST /annual-results/calculations {"class":"L2"}', () => calculateAnnualResultsForClass('L2')],
  ['GET /annual-results/summary', fetchAnnualResultsSummary, BODY],
  ['GET /annual-results/missing', fetchStudentsMissingAnnualResults, BODY.data],
  ['POST /annual-results/calculations {}', calculateAllAnnualResults],
])

it('asks the transcript as a PDF through the Accept header', async () => {
  let config: InternalAxiosRequestConfig | undefined
  mockApi((request) => {
    config = request
    return {}
  })
  await downloadTranscriptPdf(5)
  expect(config?.headers.Accept).toBe('application/pdf')
  expect(config?.responseType).toBe('blob')
})

it('reads a 404 on a past level as not enough scores', async () => {
  mockApi(() => ({ status: 404 }))
  expect(await fetchTranscriptForClass(5, 'L1')).toBeNull()
})
