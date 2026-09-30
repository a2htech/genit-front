import { defineStore } from 'pinia'
import { useAuth } from '@clerk/vue'
import { computed, watch } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const { isSignedIn, isLoaded, orgRole, signOut } = useAuth()

  // Même source que le back, qui déduit le rôle admin de l'org_role Clerk.
  const isAdmin = computed(() => orgRole.value === 'org:admin')
  // Recopie RoleEnum::permissions() côté back : `scores.deliberate` n'est donné qu'à admin et coordinator.
  const canDeliberateScores = computed(() => orgRole.value === 'org:admin' || orgRole.value === 'org:coordinator')

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

  return { isSignedIn, isLoaded, isAdmin, canDeliberateScores, signOut, waitUntilLoaded }
})
