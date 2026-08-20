import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from '@/app/router'
import { VueQueryPlugin, queryClient } from '@/app/plugins/query'
import { useContextStore } from '@/features/academic-year'
import { setAnneeProvider } from '@/shared/api/client'
import '@/app/styles/main.css'

async function bootstrap() {
  if (import.meta.env.DEV) {
    const { worker } = await import('@/mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }

  const app = createApp(App)
  app.use(createPinia())

  const context = useContextStore()
  setAnneeProvider(() => context.annee)

  app.use(router)
  app.use(VueQueryPlugin, { queryClient })

  app.mount('#app')
}

bootstrap()
