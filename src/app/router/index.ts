import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { queryClient } from '@/app/plugins/query'
import { academicYearRoutes, useContextStore } from '@/features/academic-year'
import { authRoutes, meQueryOptions, useAuthStore } from '@/features/auth'
import { transcriptRoutes } from '@/features/transcript'
import { studentRoutes } from '@/features/student'
import { teachingUnitRoutes } from '@/features/teaching-unit'
import { scoreRoutes } from '@/features/score'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../pages/DashboardPage.vue'),
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('../pages/UnauthorizedPage.vue'),
    meta: { requiresAuth: false, requiresContext: false },
  },
  ...authRoutes,
  ...academicYearRoutes,
  ...studentRoutes,
  ...teachingUnitRoutes,
  ...scoreRoutes,
  ...transcriptRoutes,
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

    const { permissions } = await queryClient.ensureQueryData(meQueryOptions)
    // Sans permission, seul le dashboard minimal est ouvert, et le niveau n'y sert à rien.
    if (permissions.length === 0) return to.name === 'dashboard' ? true : { name: 'dashboard' }
    if (to.meta.permission && !permissions.includes(to.meta.permission)) return { name: 'dashboard' }
  }

  if (to.meta.requiresContext === false) return true
  const context = useContextStore()
  if (!context.hasContext) return { name: 'context-setup' }
  return true
})

export default router
