import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import { clerkPlugin, useAuth } from '@clerk/vue'

import App from './App.vue'
import router from '@/app/router'
import { VueQueryPlugin, queryClient } from '@/app/plugins/query'
import { currentAcademicYearKey, useContextStore } from '@/features/academic-year'
import { clerkAppearance } from '@/features/auth'
import { setAuthTokenProvider, setUnauthorizedHandler } from '@/shared/api/client'
import '@/app/styles/main.css'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY manquante dans .env')
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

  // useAuth() injects from the plugin's provide(), so it needs runWithContext outside a component.
  const { getToken, isSignedIn } = app.runWithContext(() => useAuth())
  setAuthTokenProvider(() => getToken.value())
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
