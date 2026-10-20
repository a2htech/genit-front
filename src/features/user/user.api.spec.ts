import { BODY, testApiCalls } from '@/shared/api/testing'
import { assignSubjects, fetchUsers } from './user.api'

testApiCalls([
  ['GET /users?per_page=100&page=1', fetchUsers, BODY.data],
  ['PUT /users/user_1/subjects {"subject_ids":[3,4]}', () => assignSubjects('user_1', [3, 4]), BODY.data],
])
