import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { academicYearRoutes, useContextStore } from '@/features/academic-year'
import { authRoutes, useAuthStore } from '@/features/auth'
import { decisionRoutes } from '@/features/decision'
import { studentRoutes } from '@/features/student'
import { teachingUnitRoutes } from '@/features/teaching-unit'
import { scoreRoutes } from '@/features/score'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../pages/DashboardPage.vue'),
  },
  ...authRoutes,
  ...academicYearRoutes,
  ...studentRoutes,
  ...teachingUnitRoutes,
  ...scoreRoutes,
  ...decisionRoutes,
  ...(import.meta.env.DEV
    ? [
        {
          path: '/ds',
          name: 'ds-preview',
          component: () => import('../dev/DsPreviewPage.vue'),
          meta: { requiresAuth: false, requiresContext: false },
        },
      ]
    : []),
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth !== false) {
    const auth = useAuthStore()
    await auth.waitUntilLoaded()
    if (!auth.isSignedIn) return { name: 'sign-in' }
  }

  if (to.meta.requiresContext === false) return true
  const context = useContextStore()
  if (!context.hasContext) return { name: 'context-setup' }
  return true
})

export default router
