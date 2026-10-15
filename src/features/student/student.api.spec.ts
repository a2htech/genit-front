import { expect, it } from 'bun:test'
import { BODY, mockApi, testApiCalls } from '@/shared/api/testing'
import {
  createStudent,
  deleteStudent,
  fetchArchivedStudents,
  fetchStudent,
  fetchStudents,
  updateStudent,
} from './student.api'
import type { StudentFormValues } from './student.types'

testApiCalls([
  ['GET /students?class=L2&per_page=100&page=1', () => fetchStudents('L2'), BODY.data],
  [
    'GET /students/archived?page=1&per_page=25',
    () => fetchArchivedStudents({ page: 1, name: ' ', level: 'all' }),
    BODY,
  ],
  [
    'GET /students/archived?page=2&per_page=25&name=Rabe&class=L3',
    () => fetchArchivedStudents({ page: 2, name: ' Rabe ', level: 'L3' }),
    BODY,
  ],
  ['GET /students/7', () => fetchStudent(7), BODY.data],
  ['POST /students {"first_name":"Rabe"}', () => createStudent({ first_name: 'Rabe' } as StudentFormValues), BODY.data],
  ['PUT /students/7 {"registered":true}', () => updateStudent(7, { registered: true }), BODY.data],
  ['DELETE /students/7', () => deleteStudent(7)],
])

it('fetches every page then orders students by id', async () => {
  const requests = mockApi(({ params }) => ({
    data: { data: [{ id: params.page === 1 ? 9 : 4 }], meta: { last_page: 2 } },
  }))
  expect((await fetchStudents('L1')).map((student) => student.id)).toEqual([4, 9])
  expect(requests).toEqual(['GET /students?class=L1&per_page=100&page=1', 'GET /students?class=L1&per_page=100&page=2'])
})
