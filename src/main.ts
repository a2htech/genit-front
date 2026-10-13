import { createApp, watch } from 'vue'
import { createPinia, storeToRefs } from 'pinia'
import { clerkPlugin } from '@clerk/vue'

import App from './App.vue'
import router from '@/app/router'
import { VueQueryPlugin, queryClient } from '@/app/plugins/query'
import { currentAcademicYearKey, useContextStore } from '@/features/academic-year'
import { clerkAppearance, useAuthStore } from '@/features/auth'
import { setAuthTokenProvider, setUnauthorizedHandler } from '@/shared/api/client'
import '@/app/styles/main.css'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY manquante dans .env')
}
if (!import.meta.env.VITE_CLERK_ORGANIZATION_ID) {
  throw new Error('VITE_CLERK_ORGANIZATION_ID manquante dans .env')
}

function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(clerkPlugin, {
    publishableKey: CLERK_PUBLISHABLE_KEY,
    appearance: clerkAppearance,
    // Sans ça, les liens croisés sign-in <-> sign-up de Clerk pointent vers l'Account Portal externe.
    signInUrl: import.meta.env.VITE_CLERK_SIGN_IN_URL,
    signUpUrl: import.meta.env.VITE_CLERK_SIGN_UP_URL,
  })

  // The store calls Clerk's useAuth(), which injects from the plugin: runWithContext outside a component.
  const auth = app.runWithContext(() => useAuthStore(pinia))
  const { isSignedIn } = storeToRefs(auth)
  setAuthTokenProvider(auth.getApiToken)
  setUnauthorizedHandler(() => router.push({ name: 'unauthorized' }))

  watch(isSignedIn, (signedIn, wasSignedIn) => {
    if (wasSignedIn && !signedIn) {
      queryClient.removeQueries({ queryKey: currentAcademicYearKey })
      useContextStore(pinia).reset()
    }
  })

  app.use(router)
  app.use(VueQueryPlugin, { queryClient })

  app.mount('#app')
}

bootstrap()
