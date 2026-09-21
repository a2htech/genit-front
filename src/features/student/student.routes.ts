import type { RouteRecordRaw } from 'vue-router'

export const studentRoutes: RouteRecordRaw[] = [
  {
    path: '/students',
    name: 'students',
    component: () => import('./StudentListPage.vue'),
  },
  {
    path: '/students/:studentId',
    name: 'student-detail',
    component: () => import('./StudentDetailPage.vue'),
    meta: { nav: 'students' },
  },
]
