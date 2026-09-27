import type { RouteRecordRaw } from 'vue-router'

export const studentRoutes: RouteRecordRaw[] = [
  {
    path: '/students',
    name: 'students',
    component: () => import('./StudentListPage.vue'),
  },
  {
    path: '/students/archived',
    name: 'archived-students',
    component: () => import('./ArchivedStudentListPage.vue'),
    meta: { nav: 'students' },
  },
  {
    path: '/students/:studentId',
    name: 'student-detail',
    component: () => import('./StudentDetailPage.vue'),
    meta: { nav: 'students' },
  },
]
