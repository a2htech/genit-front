import { defineStore } from 'pinia'
import { useAuth } from '@clerk/vue'
import { computed, watch } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const { isSignedIn, isLoaded, orgRole, signOut } = useAuth()

  // Même source que le back, qui déduit le rôle admin de l'org_role Clerk.
  const isAdmin = computed(() => orgRole.value === 'org:admin')

  /** Le guard de route doit attendre l'hydratation de la session Clerk avant de trancher. */
  function waitUntilLoaded(): Promise<void> {
    if (isLoaded.value) return Promise.resolve()
    return new Promise((resolve) => {
      const stop = watch(isLoaded, (loaded) => {
        if (loaded) {
          stop()
          resolve()
        }
      })
    })
  }

  return { isSignedIn, isLoaded, isAdmin, signOut, waitUntilLoaded }
})
