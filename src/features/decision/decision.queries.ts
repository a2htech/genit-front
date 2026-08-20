import { type Ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useContextStore, type Niveau } from '@/features/academic-year'
import { fetchBulletin, fetchResultats } from './decision.api'

export function useBulletinQuery(etudiantId: Ref<string | null>, niveauView: Ref<Niveau | null>) {
  return useQuery({
    queryKey: computed(() => ['bulletin', etudiantId.value, niveauView.value]),
    queryFn: () => fetchBulletin(etudiantId.value!, niveauView.value!),
    enabled: computed(() => etudiantId.value !== null && niveauView.value !== null),
  })
}

export function useResultatsQuery() {
  const context = useContextStore()
  const niveau = computed(() => context.niveau)
  return useQuery({
    queryKey: computed(() => ['resultats', niveau.value]),
    queryFn: () => fetchResultats(niveau.value!),
    enabled: computed(() => niveau.value !== null),
  })
}
