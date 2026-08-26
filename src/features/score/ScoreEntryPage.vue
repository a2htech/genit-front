<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { CheckIcon, ChevronDownIcon } from '@lucide/vue'
import { Button } from '@/design-system/ui/button'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from '@/design-system/ui/combobox'
import { Input } from '@/design-system/ui/input'
import { Spinner } from '@/design-system/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { useContextStore, useCurrentAcademicYearQuery } from '@/features/academic-year'
import { useSubjectsQuery, type Subject } from '@/features/teaching-unit'
import { useStudentsQuery } from '@/features/student'
import { toApiError } from '@/shared/api/errors'
import { isFailingScore } from '@/shared/utils/format'
import { useScoresQuery, useStoreScoresMutation, useUpdateScoreMutation } from './score.queries'
import type { ExamSession, Score } from './score.types'

const errorMessage = ref<string | null>(null)

const router = useRouter()
const context = useContextStore()

const { data: currentYear } = useCurrentAcademicYearQuery()
const classYear = computed(() => currentYear.value?.year ?? null)

const { data: subjects, isPending: subjectsPending } = useSubjectsQuery()
const subjectId = ref<number | null>(null)
watchEffect(() => {
  if (!subjectId.value && subjects.value && subjects.value.length > 0) {
    subjectId.value = subjects.value[0]!.id
  }
})

const session = ref<ExamSession>('normale')

const { data: students, isPending: studentsPending } = useStudentsQuery()
const { data: existingScores, isPending: scoresPending } = useScoresQuery(subjectId, session, classYear)
const storeMutation = useStoreScoresMutation(subjectId, session, classYear)
const updateMutation = useUpdateScoreMutation(subjectId, session, classYear)

const isPending = computed(() => subjectsPending.value || studentsPending.value)

const currentSubject = computed(() => subjects.value?.find((s) => s.id === subjectId.value) ?? null)
const subjectLabel = computed(() => (currentSubject.value ? `${currentSubject.value.name}` : ''))

const existingByStudent = computed(() => {
  const map = new Map<number, Score>()
  for (const s of existingScores.value ?? []) map.set(s.student_id, s)
  return map
})

/** Brouillon local des lignes non encore envoyées (aucun score existant côté back pour ce couple étudiant/matière). */
const drafts = reactive<Record<number, number | null>>({})
watch([subjectId, session], () => {
  for (const key of Object.keys(drafts)) delete drafts[Number(key)]
})

const rows = computed(
  () => (students.value ?? []).map((s) => ({ student: s, existing: existingByStudent.value.get(s.id) ?? null })),
)

const filledDraftsCount = computed(() => Object.values(drafts).filter((v) => typeof v === 'number').length)
const progressLabel = computed(
  () => `${(existingScores.value?.length ?? 0) + filledDraftsCount.value}/${rows.value.length}`,
)

function onExistingInput(scoreId: number, raw: string | number) {
  const value = raw === '' ? null : Number(raw)
  errorMessage.value = null
  updateMutation.mutate(
    { id: scoreId, score: value },
    { onError: (e) => (errorMessage.value = toApiError(e).message) },
  )
}

function onDraftInput(studentId: number, raw: string | number) {
  drafts[studentId] = raw === '' ? null : Number(raw)
}

function onKeydown(e: KeyboardEvent, index: number) {
  if (e.key === 'Enter') {
    e.preventDefault()
    const next = document.getElementById(`grade-input-${index + 1}`)
    next?.focus()
  }
}

const hasDraftsToSave = computed(() => filledDraftsCount.value > 0)

async function save() {
  if (!subjectId.value || classYear.value === null || !hasDraftsToSave.value) return
  const scores = Object.entries(drafts)
    .filter(([, v]) => typeof v === 'number')
    .map(([studentId, value]) => ({ student_id: Number(studentId), score: value as number }))
  errorMessage.value = null
  try {
    await storeMutation.mutateAsync({
      subjectId: subjectId.value,
      session: session.value,
      classYear: classYear.value,
      scores,
    })
  } catch (e) {
    errorMessage.value = toApiError(e).message
    return
  }
  for (const key of Object.keys(drafts)) delete drafts[Number(key)]
}

function finish() {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <Spinner v-if="isPending" class="mx-auto mt-32 size-8" />
  <div v-else>
    <h1 class="font-heading mb-5 text-2xl font-extrabold">Saisie des notes — {{ context.level }}</h1>

    <div class="mb-5.5 flex flex-wrap gap-4">
      <div>
        <div class="mb-1.5 text-xs font-bold tracking-wide uppercase">Matière</div>
        <Combobox
          :model-value="currentSubject"
          by="id"
          @update:model-value="(v) => (subjectId = (v as Subject | null)?.id ?? null)"
        >
          <ComboboxAnchor as-child>
            <ComboboxTrigger as-child>
              <Button variant="outline" emphasis="compact" role="combobox" class="min-w-65 justify-between gap-2 bg-card">
                {{ currentSubject?.name ?? 'Sélectionner une matière' }}
                <ChevronDownIcon class="size-4 shrink-0 opacity-50" />
              </Button>
            </ComboboxTrigger>
          </ComboboxAnchor>
          <ComboboxList align="start" class="w-65">
            <ComboboxInput placeholder="Rechercher une matière…" />
            <ComboboxViewport>
              <ComboboxEmpty>Aucune matière trouvée.</ComboboxEmpty>
              <ComboboxGroup>
                <ComboboxItem v-for="s in subjects ?? []" :key="s.id" :value="s">
                  {{ s.name }}
                  <ComboboxItemIndicator><CheckIcon /></ComboboxItemIndicator>
                </ComboboxItem>
              </ComboboxGroup>
            </ComboboxViewport>
          </ComboboxList>
        </Combobox>
      </div>
      <div>
        <div class="mb-1.5 text-xs font-bold tracking-wide uppercase">Session</div>
        <ToggleGroup v-model="session" type="single" variant="outline">
          <ToggleGroupItem value="normale">Normale</ToggleGroupItem>
          <ToggleGroupItem value="rattrapage">Rattrapage</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>

    <div class="mb-2.5 flex items-center justify-between">
      <div class="text-sm font-bold">{{ subjectLabel }}</div>
      <div class="font-heading bg-primary px-3.5 py-1.5 text-sm font-extrabold text-primary-foreground">
        {{ progressLabel }} saisies
      </div>
    </div>

    <div v-if="errorMessage" class="mb-4 border-2 border-destructive bg-destructive/10 p-3 text-sm font-semibold text-destructive">
      {{ errorMessage }}
    </div>

    <Spinner v-if="scoresPending" class="mx-auto my-8 size-8" />
    <Table v-else class="mb-24">
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>Étudiant</TableHead>
          <TableHead class="w-40">Note / 20</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(row, index) in rows" :key="row.student.id">
          <TableCell class="font-bold">{{ row.student.id }}</TableCell>
          <TableCell>{{ row.student.first_name }} {{ row.student.last_name }}</TableCell>
          <TableCell>
            <Input
              v-if="row.existing"
              :id="`grade-input-${index}`"
              type="number"
              :min="0"
              :max="20"
              :step="0.5"
              placeholder="—"
              class="text-center font-bold"
              :class="isFailingScore(row.existing.score) ? 'text-destructive' : ''"
              :model-value="row.existing.score ?? ''"
              @update:model-value="(v) => onExistingInput(row.existing!.id, v ?? '')"
              @keydown="(e: KeyboardEvent) => onKeydown(e, index)"
            />
            <Input
              v-else
              :id="`grade-input-${index}`"
              type="number"
              :min="0"
              :max="20"
              :step="0.5"
              placeholder="—"
              class="text-center font-bold"
              :class="isFailingScore(drafts[row.student.id] ?? null) ? 'text-destructive' : ''"
              :model-value="drafts[row.student.id] ?? ''"
              @update:model-value="(v) => onDraftInput(row.student.id, v ?? '')"
              @keydown="(e: KeyboardEvent) => onKeydown(e, index)"
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <div class="fixed inset-x-0 bottom-0 z-30 flex justify-end gap-3.5 bg-foreground px-6 py-4">
      <Button
        variant="success"
        class="border-background shadow-[4px_4px_0_0_var(--background)] hover:shadow-[2px_2px_0_0_var(--background)]"
        :disabled="!hasDraftsToSave || storeMutation.isPending.value"
        @click="save"
      >
        Enregistrer les nouvelles notes
      </Button>
      <Button
        variant="secondary"
        class="border-background shadow-[4px_4px_0_0_var(--background)] hover:shadow-[2px_2px_0_0_var(--background)]"
        @click="finish"
      >
        Terminer
      </Button>
    </div>
  </div>
</template>
