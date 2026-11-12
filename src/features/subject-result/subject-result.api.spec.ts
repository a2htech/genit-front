import { BODY, testApiCalls } from '@/shared/api/testing'
import { deleteForcedResult, fetchForcedResults, forceFail } from './subject-result.api'

testApiCalls([
  ['GET /subject-results/forced?class=L2', () => fetchForcedResults('L2'), BODY.data],
  ['POST /subject-results/forced {"student_id":3,"subject_id":4}', () => forceFail(3, 4), BODY.data],
  ['DELETE /subject-results/forced/5', () => deleteForcedResult(5)],
])
