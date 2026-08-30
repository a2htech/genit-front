import type { RouteRecordRaw } from 'vue-router'

export const scoreRoutes: RouteRecordRaw[] = [
  {
    path: '/scores',
    name: 'scores',
    component: () => import('./ScoreEntryPage.vue'),
  },
]
