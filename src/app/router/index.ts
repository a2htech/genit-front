import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import { etudiantRoutes } from '@/features/etudiant'
import { ficheRoutes } from '@/features/fiche'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../pages/DashboardPage.vue'),
  },
  ...etudiantRoutes,
  ...ficheRoutes,
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
