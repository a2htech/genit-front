import { BODY, testApiCalls } from '@/shared/api/testing'
import { fetchDashboard } from './dashboard.api'

testApiCalls([['GET /dashboard', fetchDashboard, BODY.data]])
