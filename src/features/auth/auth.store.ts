import { defineStore } from 'pinia'
import { useAuth } from '@clerk/vue'
import { watch } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const { isSignedIn, isLoaded, signOut } = useAuth()

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

  return { isSignedIn, isLoaded, signOut, waitUntilLoaded }
})
