import { type Ref, computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { fetchScores, storeScoresForSubject, updateScore, type StoreScoresPayload } from './score.api'
import type { ExamSession } from './score.types'

function scoresKey(subjectId: number | null, session: ExamSession, classYear: number | null) {
  return ['scores', subjectId, session, classYear] as const
}

export function useScoresQuery(
  subjectId: Ref<number | null>,
  session: Ref<ExamSession>,
  classYear: Ref<number | null>,
) {
  return useQuery({
    queryKey: computed(() => scoresKey(subjectId.value, session.value, classYear.value)),
    queryFn: () => fetchScores({ subjectId: subjectId.value!, session: session.value, classYear: classYear.value! }),
    enabled: computed(() => subjectId.value !== null && classYear.value !== null),
  })
}

export function useStoreScoresMutation(
  subjectId: Ref<number | null>,
  session: Ref<ExamSession>,
  classYear: Ref<number | null>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StoreScoresPayload) => storeScoresForSubject(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: scoresKey(subjectId.value, session.value, classYear.value) }),
  })
}

export function useUpdateScoreMutation(
  subjectId: Ref<number | null>,
  session: Ref<ExamSession>,
  classYear: Ref<number | null>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, score }: { id: number; score: number | null }) => updateScore(id, score),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: scoresKey(subjectId.value, session.value, classYear.value) }),
  })
}
