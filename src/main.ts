import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { clerkPlugin } from '@clerk/vue'

import App from './App.vue'
import router from '@/app/router'
import { VueQueryPlugin, queryClient } from '@/app/plugins/query'
import { useContextStore } from '@/features/academic-year'
import { clerkAppearance } from '@/features/auth'
import { setAnneeProvider } from '@/shared/api/client'
import '@/app/styles/main.css'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY manquante dans .env')
}

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { worker } = await import('@/mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const app = createApp(App)
  app.use(createPinia())
  app.use(clerkPlugin, {
    publishableKey: CLERK_PUBLISHABLE_KEY,
    appearance: clerkAppearance,
    // Sans ça, les liens croisés sign-in <-> sign-up de Clerk pointent vers l'Account Portal externe.
    signInUrl: import.meta.env.VITE_CLERK_SIGN_IN_URL,
    signUpUrl: import.meta.env.VITE_CLERK_SIGN_UP_URL,
  })

  const context = useContextStore()
  setAnneeProvider(() => context.annee)

  app.use(router)
  app.use(VueQueryPlugin, { queryClient })

  app.mount('#app')
}

bootstrap()
