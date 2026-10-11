import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchMe } from './auth.api'
import { useAuthStore } from './auth.store'
import type { Permission } from './auth.types'

export const meQueryOptions = { queryKey: ['me'] as const, queryFn: fetchMe }

export function usePermissions() {
  const auth = useAuthStore()
  // Le layout est monté jusque sur la page de connexion : pas d'appel voué au 401.
  const { data: me } = useQuery({ ...meQueryOptions, enabled: computed(() => auth.isSignedIn === true) })
  const can = (permission: Permission) => me.value?.permissions.includes(permission) ?? false
  /** Faux pour un compte `user` : il n'a que le dashboard minimal. */
  const hasAccess = computed(() => !!me.value?.permissions.length)
  return { me, can, hasAccess }
}
