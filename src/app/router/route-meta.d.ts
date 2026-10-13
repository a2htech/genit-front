import 'vue-router'
import type { Permission } from '@/features/auth'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresContext?: boolean
    /** Onglet de navigation gardé actif sur une page de détail. */
    nav?: string
    /** Sans elle, le guard ramène au dashboard : pas d'aller-retour 403. */
    permission?: Permission
  }
}
