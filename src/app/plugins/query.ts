import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { persistQueryClient } from '@tanstack/query-persist-client-core'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { currentAcademicYearKey } from '@/features/academic-year'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

/**
 * L'année universitaire courante ne change que via une bascule explicite (cf.
 * useCreateAcademicYearMutation) : elle survit donc à un refresh au lieu d'être re-fetchée comme
 * le reste du cache, qui lui reste en mémoire et se vide à chaque rechargement de page.
 */
persistQueryClient({
  queryClient,
  persister: createSyncStoragePersister({ storage: window.localStorage }),
  dehydrateOptions: {
    shouldDehydrateQuery: (query) =>
      query.queryKey.length === currentAcademicYearKey.length &&
      query.queryKey.every((part, i) => part === currentAcademicYearKey[i]),
  },
})

export { VueQueryPlugin }
