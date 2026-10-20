import { BODY, testApiCalls } from '@/shared/api/testing'
import { fetchCurrentAcademicYear, rolloverAcademicYear } from './academic-year.api'

testApiCalls([
  ['GET /academic-years/current', fetchCurrentAcademicYear, BODY.data],
  ['POST /academic-years/rollover', rolloverAcademicYear, BODY.data],
])
