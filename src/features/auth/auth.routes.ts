import type { RouteRecordRaw } from 'vue-router'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/sign-in',
    name: 'sign-in',
    component: () => import('./SignInPage.vue'),
    meta: { requiresAuth: false, requiresContext: false },
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: () => import('./SignUpPage.vue'),
    meta: { requiresAuth: false, requiresContext: false },
  },
]
