import { BODY, testApiCalls } from '@/shared/api/testing'
import { createSubject, deleteSubject, fetchTeachingUnits, updateSubject } from './teaching-unit.api'
import type { SubjectFormValues } from './teaching-unit.types'

testApiCalls([
  ['GET /teaching-units?class=L1&page=1', () => fetchTeachingUnits('L1'), BODY.data],
  ['POST /subjects {"name":"Analyse"}', () => createSubject({ name: 'Analyse' } as SubjectFormValues), BODY.data],
  ['PATCH /subjects/3 {"credit":4}', () => updateSubject(3, { credit: 4 }), BODY.data],
  ['DELETE /subjects/3', () => deleteSubject(3)],
])
