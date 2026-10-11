import { defineStore } from 'pinia'
import { useAuth, useUser } from '@clerk/vue'
import { watch } from 'vue'

const SCHOOL_ORGANIZATION_ID = import.meta.env.VITE_CLERK_ORGANIZATION_ID

export const useAuthStore = defineStore('auth', () => {
  const { isSignedIn, isLoaded, getToken, signOut } = useAuth()
  const { user } = useUser()

  /** Le back ne lit le rôle que dans l'org de l'école : un membre la vise, sans changer son org active. */
  async function getApiToken(): Promise<string | null> {
    await waitUntilLoaded()
    const isMember = user.value?.organizationMemberships.some((m) => m.organization.id === SCHOOL_ORGANIZATION_ID)
    return getToken.value(isMember ? { organizationId: SCHOOL_ORGANIZATION_ID } : undefined)
  }

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

  return { isSignedIn, isLoaded, signOut, waitUntilLoaded, getApiToken }
})
