import type { RouteRecordRaw } from 'vue-router'

export const academicYearRoutes: RouteRecordRaw[] = [
  {
    path: '/context',
    name: 'context-setup',
    component: () => import('./ContextSetupPage.vue'),
    meta: { requiresContext: false },
  },
  {
    path: '/academic-year',
    name: 'academic-year',
    component: () => import('./AcademicYearPage.vue'),
  },
]
