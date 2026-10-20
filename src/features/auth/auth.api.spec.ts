import { BODY, testApiCalls } from '@/shared/api/testing'
import { fetchMe } from './auth.api'

testApiCalls([['GET /me', fetchMe, BODY.data]])
