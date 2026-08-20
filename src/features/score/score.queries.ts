import { type Ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { useContextStore } from '@/features/academic-year'
import { fetchNotes, fetchSaisieProgress, upsertNote, validerSaisie, type UpsertNotePayload } from './score.api'
import type { NoteRow, SessionExamen } from './score.types'

function notesKey(niveau: string | null, matiereId: string | null, session: SessionExamen) {
  return ['notes', niveau, matiereId, session] as const
}

export function useNotesQuery(matiereId: Ref<string | null>, session: Ref<SessionExamen>) {
  const context = useContextStore()
  const niveau = computed(() => context.niveau)
  return useQuery({
    queryKey: computed(() => notesKey(niveau.value, matiereId.value, session.value)),
    queryFn: () => fetchNotes({ matiereId: matiereId.value!, session: session.value, niveau: niveau.value! }),
    enabled: computed(() => niveau.value !== null && matiereId.value !== null),
  })
}

export function useUpsertNoteMutation(matiereId: Ref<string | null>, session: Ref<SessionExamen>) {
  const context = useContextStore()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpsertNotePayload) => upsertNote(payload),
    onMutate: (payload) => {
      const key = notesKey(context.niveau, matiereId.value, session.value)
      queryClient.setQueryData<NoteRow[]>(key, (rows) =>
        rows?.map((row) => (row.etudiantId === payload.etudiantId ? { ...row, valeur: payload.valeur } : row)),
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notesKey(context.niveau, matiereId.value, session.value) })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useSaisieProgressQuery() {
  const context = useContextStore()
  const niveau = computed(() => context.niveau)
  return useQuery({
    queryKey: computed(() => ['dashboard', 'saisie-progression', niveau.value]),
    queryFn: () => fetchSaisieProgress(niveau.value!),
    enabled: computed(() => niveau.value !== null),
  })
}

export function useValiderSaisieMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ matiereId, session }: { matiereId: string; session: SessionExamen }) =>
      validerSaisie(matiereId, session),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
  })
}
