import type { RouteRecordRaw } from 'vue-router'

export const subjectResultRoutes: RouteRecordRaw[] = [
  {
    path: '/forced-results',
    name: 'forced-results',
    component: () => import('./ForcedResultListPage.vue'),
    meta: { permission: 'results.force' },
  },
]
