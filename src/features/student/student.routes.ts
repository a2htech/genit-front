import type { RouteRecordRaw } from 'vue-router'

export const studentRoutes: RouteRecordRaw[] = [
  {
    path: '/students',
    name: 'students',
    component: () => import('./StudentListPage.vue'),
  },
]
