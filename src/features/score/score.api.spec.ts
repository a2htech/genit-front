import { expect, it } from 'bun:test'
import { BODY, mockApi, testApiCalls } from '@/shared/api/testing'
import {
  deleteScore,
  deliberateScore,
  fetchCurrentYearRetakeScore,
  fetchEligibleStudents,
  fetchRetakeEligibleStudents,
  storeScoresForSubject,
  updateScore,
} from './score.api'

testApiCalls([
  ['GET /subjects/3/eligible-students', () => fetchEligibleStudents(3), BODY.data],
  ['GET /subjects/3/retake-eligible-students', () => fetchRetakeEligibleStudents(3, ''), BODY.data],
  ['GET /subjects/3/retake-eligible-students?name=Rabe', () => fetchRetakeEligibleStudents(3, 'Rabe'), BODY.data],
  [
    'POST /subjects/3/scores {"subject_id":3,"session":"2","class_year":2026,"scores":[{"student_id":7,"score":null}]}',
    () =>
      storeScoresForSubject({
        subjectId: 3,
        session: 'rattrapage',
        classYear: 2026,
        scores: [{ student_id: 7, score: null }],
      }),
    BODY.data,
  ],
  ['PUT /scores/4 {"score":null}', () => updateScore(4, null), BODY.data],
  ['DELETE /scores/4', () => deleteScore(4)],
  [
    'GET /scores/latest?student_id=7&subject_id=3&session=2&across_all_years=0',
    () => fetchCurrentYearRetakeScore(7, 3),
    BODY.data,
  ],
  ['POST /scores/4/deliberate {"score":10}', () => deliberateScore(4, 10), BODY.data],
])

it('reads a 404 as no retake score this year', async () => {
  mockApi(() => ({ status: 404 }))
  expect(await fetchCurrentYearRetakeScore(7, 3)).toBeNull()
})
