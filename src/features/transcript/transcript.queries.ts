import { type Ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useContextStore, type Level } from '@/features/academic-year'
import { fetchTranscript, fetchTranscriptForClass } from './transcript.api'

/** Le niveau courant de l'étudiant est toujours celui du contexte (la recherche ne liste que ce niveau-là). */
export function useTranscriptQuery(studentId: Ref<number | null>, levelView: Ref<Level | null>) {
  const context = useContextStore()
  return useQuery({
    queryKey: computed(() => ['transcript', studentId.value, levelView.value]),
    queryFn: () =>
      levelView.value === context.level
        ? fetchTranscript(studentId.value!)
        : fetchTranscriptForClass(studentId.value!, levelView.value!),
    enabled: computed(() => studentId.value !== null && levelView.value !== null),
  })
}
