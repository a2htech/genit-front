import type { RouteRecordRaw } from 'vue-router'

export const transcriptRoutes: RouteRecordRaw[] = [
  {
    path: '/transcript/:studentId?',
    name: 'transcript',
    component: () => import('./TranscriptPage.vue'),
  },
  {
    path: '/decisions',
    name: 'decisions',
    component: () => import('./DecisionsPage.vue'),
  },
]
