import type { RouteRecordRaw } from 'vue-router'

export const teachingUnitRoutes: RouteRecordRaw[] = [
  {
    path: '/teaching-units',
    name: 'teaching-units',
    component: () => import('./TeachingUnitListPage.vue'),
  },
]
