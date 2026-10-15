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
  ['GET /transcripts/5', () => fetchTranscript(5), BODY.data],
  ['GET /transcripts/5/L1', () => fetchTranscriptForClass(5, 'L1'), BODY.data],
  ['GET /transcripts/5/pdf', () => downloadTranscriptPdf(5)],
  ['GET /students/annual-results/L2', () => fetchAnnualResults('L2'), BODY.data],
  ['POST /students/annual-results/L2/calculate', () => calculateAnnualResultsForClass('L2')],
  ['GET /students/annual-results/summary', fetchAnnualResultsSummary, BODY],
  ['GET /students/annual-results/missing', fetchStudentsMissingAnnualResults, BODY.data],
  ['POST /students/annual-results/calculate-all', calculateAllAnnualResults],
])

it('reads a 404 on a past level as not enough scores', async () => {
  mockApi(() => ({ status: 404 }))
  expect(await fetchTranscriptForClass(5, 'L1')).toBeNull()
})
