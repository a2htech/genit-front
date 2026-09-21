<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter, type LocationQueryRaw } from 'vue-router'
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from '@/design-system/ui/combobox'
import { Empty, EmptyDescription, EmptyTitle } from '@/design-system/ui/empty'
import { Skeleton } from '@/design-system/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { LEVELS, useContextStore, type Level } from '@/features/academic-year'
import { studentFullName, useFilteredStudents, type Student } from '@/features/student'
import { formatAverage, formatDate, formatScore, isFailingScore } from '@/shared/utils/format'
import { downloadTranscriptPdf } from './transcript.api'
import { useTranscriptQuery } from './transcript.queries'
import { MENTION_LABEL_FR, STATUS_LABEL_FR, type AcademicStatusLabel } from './transcript.types'

const route = useRoute()
const router = useRouter()
const context = useContextStore()

const studentId = computed(() => {
  const raw = route.params.studentId as string | undefined
  return raw ? Number(raw) : null
})

// Recherche transmise par la liste : précédent/suivant parcourent son tableau entier, pas sa seule page affichée.
const listSearch = computed(() => (typeof route.query.search === 'string' ? route.query.search : ''))
const { data: students, filtered: listStudents } = useFilteredStudents(listSearch)
const currentStudent = computed(() => students.value?.find((s) => s.id === studentId.value) ?? null)

const position = computed(() => listStudents.value.findIndex((s) => s.id === studentId.value))
const previousStudent = computed(() => (position.value > 0 ? listStudents.value[position.value - 1] : undefined))
const nextStudent = computed(() => (position.value >= 0 ? listStudents.value[position.value + 1] : undefined))

function siblingLabel(direction: string, s: Student | undefined) {
  return s ? `${direction} : ${studentFullName(s)}` : direction
}

/** Un étudiant choisi dans la recherche sort du parcours de la liste : `query` n'est gardée que par précédent/suivant. */
function openTranscript(s: Student | undefined, query: LocationQueryRaw = {}) {
  if (!s) return
  router.push({ name: 'transcript', params: { studentId: s.id }, query })
}

const levelView = ref<Level | null>(context.level)
watch(studentId, () => {
  levelView.value = context.level
})

const { data: transcript, isPending } = useTranscriptQuery(studentId, levelView)

const levelIndex = computed(() => LEVELS.findIndex((n) => n.value === context.level))
const levelOptions = computed(() => LEVELS.slice(0, levelIndex.value + 1))
const showLevelSwitcher = computed(() => levelOptions.value.length > 1)

function averageBadgeTone(average: number | null) {
  if (average === null) return 'outline'
  return average < 10 ? 'destructive' : 'success'
}

const resultBandClass: Record<AcademicStatusLabel, string> = {
  PASSED: 'bg-success text-success-foreground',
  CONDITIONAL: 'bg-warning text-warning-foreground',
  FAILED: 'bg-destructive text-destructive-foreground',
  COMPLETED: 'bg-accent text-accent-foreground',
}

const exporting = ref(false)
async function exportPdf() {
  if (!studentId.value) return
  exporting.value = true
  try {
    await downloadTranscriptPdf(studentId.value)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <h1 class="mb-5 font-heading text-2xl font-extrabold">Fiche individuelle de résultats</h1>

  <div class="mb-6.5 flex flex-wrap items-center justify-between gap-3">
    <Combobox
      :model-value="currentStudent"
      by="id"
      @update:model-value="(s) => openTranscript(s as Student | undefined)"
    >
      <ComboboxAnchor as-child>
        <ComboboxTrigger as-child>
          <Button variant="outline" emphasis="compact" role="combobox" class="min-w-65 justify-between gap-2 bg-card">
            {{ currentStudent ? studentFullName(currentStudent) : 'Rechercher un étudiant…' }}
            <ChevronDownIcon class="size-4 shrink-0 opacity-50" />
          </Button>
        </ComboboxTrigger>
      </ComboboxAnchor>
      <ComboboxList align="start" class="w-75">
        <ComboboxInput placeholder="Nom de l'étudiant…" />
        <ComboboxViewport>
          <ComboboxEmpty>Aucun étudiant trouvé.</ComboboxEmpty>
          <ComboboxItem v-for="s in students ?? []" :key="s.id" :value="s">
            {{ studentFullName(s) }} — #{{ s.id }}
            <ComboboxItemIndicator><CheckIcon /></ComboboxItemIndicator>
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxList>
    </Combobox>

    <nav v-if="position >= 0" aria-label="Navigation entre étudiants" class="flex items-center gap-2">
      <Button
        variant="outline"
        emphasis="compact"
        size="sm"
        :disabled="!previousStudent"
        :aria-label="siblingLabel('Précédent', previousStudent)"
        :title="siblingLabel('Précédent', previousStudent)"
        @click="openTranscript(previousStudent, route.query)"
      >
        <ChevronLeftIcon aria-hidden="true" />
        <span class="max-w-40 truncate">{{ previousStudent ? studentFullName(previousStudent) : 'Précédent' }}</span>
      </Button>
      <span class="text-xs font-bold text-muted-foreground tabular-nums">
        {{ position + 1 }} / {{ listStudents.length }}
      </span>
      <Button
        variant="outline"
        emphasis="compact"
        size="sm"
        :disabled="!nextStudent"
        :aria-label="siblingLabel('Suivant', nextStudent)"
        :title="siblingLabel('Suivant', nextStudent)"
        @click="openTranscript(nextStudent, route.query)"
      >
        <span class="max-w-40 truncate">{{ nextStudent ? studentFullName(nextStudent) : 'Suivant' }}</span>
        <ChevronRightIcon aria-hidden="true" />
      </Button>
    </nav>
  </div>

  <Empty v-if="!studentId">
    <EmptyTitle>Aucun étudiant sélectionné</EmptyTitle>
    <EmptyDescription>Choisissez un étudiant ci-dessus pour afficher son bulletin.</EmptyDescription>
  </Empty>

  <div v-else-if="isPending" class="border-2 border-border bg-card p-6 shadow-brutal-lg">
    <Skeleton class="mx-auto h-4 w-56" />
    <Skeleton class="mx-auto mt-2 h-5 w-72" />
    <div class="mt-6 flex items-center gap-5">
      <Skeleton class="size-18 shrink-0" />
      <div class="flex-1">
        <Skeleton class="h-6 w-48" />
        <Skeleton class="mt-2 h-4 w-56" />
      </div>
    </div>
    <div class="mt-6 flex flex-col gap-3">
      <Skeleton class="h-16 w-full" />
      <Skeleton class="h-16 w-full" />
      <Skeleton class="h-16 w-full" />
    </div>
  </div>

  <Empty v-else-if="!transcript">
    <EmptyTitle>Pas assez de notes à ce niveau</EmptyTitle>
    <EmptyDescription>Ce niveau ne compte pas encore assez de notes saisies pour générer un bulletin.</EmptyDescription>
  </Empty>

  <div v-else class="border-2 border-border bg-card shadow-brutal-lg">
    <div class="border-b-2 border-border px-6 py-4.5 text-center">
      <div class="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
        Université — Mention Informatique
      </div>
      <div class="mt-1 font-heading text-base font-extrabold">
        Fiche individuelle de résultats — {{ transcript.student.class }}
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-5 border-b-2 border-border p-6">
      <div
        class="flex size-18 shrink-0 items-center justify-center border-2 border-border bg-muted font-heading text-2xl font-extrabold"
      >
        {{ transcript.student.firstName[0] }}{{ transcript.student.lastName?.[0] ?? '' }}
      </div>
      <div>
        <div class="font-heading text-[22px] font-extrabold">
          {{ transcript.student.firstName }} {{ transcript.student.lastName }}
        </div>
        <div class="mt-0.5 text-[13px] font-semibold text-muted-foreground">
          #{{ transcript.student.id }} · Né(e) le {{ formatDate(transcript.student.birthday) }}
        </div>
      </div>
      <ToggleGroup
        v-if="showLevelSwitcher"
        :model-value="levelView ?? undefined"
        type="single"
        class="ml-auto"
        @update:model-value="(v) => v && (levelView = v as Level)"
      >
        <ToggleGroupItem v-for="n in levelOptions" :key="n.value" :value="n.value" size="sm">
          {{ n.value }}
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <div v-for="sem in transcript.semesters" :key="sem.number" class="border-b-2 border-border p-6">
      <div class="mb-3.5 font-heading text-base font-extrabold">Semestre {{ sem.number }}</div>

      <div v-for="ue in sem.teachingUnits" :key="ue.code" class="mb-3.5 border-2 border-border">
        <div class="flex flex-wrap items-center gap-2.5 border-b-2 border-border bg-muted px-3.5 py-2.5">
          <div class="min-w-45 flex-1 font-heading text-[13px] font-extrabold">{{ ue.code }} — {{ ue.name }}</div>
          <span class="text-[11px] font-bold text-muted-foreground">{{ ue.credits }} crédits</span>
          <Badge :variant="averageBadgeTone(ue.regularSession.unitAverage)">
            N: {{ formatAverage(ue.regularSession.unitAverage) }} · {{ MENTION_LABEL_FR[ue.regularSession.mention] }} ·
            {{ ue.regularSession.creditsEarned }} cr.
          </Badge>
          <Badge :variant="averageBadgeTone(ue.retakeSession.unitAverage)">
            R: {{ formatAverage(ue.retakeSession.unitAverage) }} · {{ MENTION_LABEL_FR[ue.retakeSession.mention] }} ·
            {{ ue.retakeSession.creditsEarned }} cr.
          </Badge>
        </div>
        <table class="w-full border-collapse">
          <tbody>
            <tr v-for="subj in ue.subjects" :key="subj.id" class="border-b border-border/30 last:border-b-0">
              <td class="px-3.5 py-2 text-[13px]">{{ subj.name }}</td>
              <td class="px-3.5 py-2 text-xs text-muted-foreground">coef. {{ subj.coefficient }}</td>
              <td
                class="w-25 px-3.5 py-2 text-right text-[13px] font-bold"
                :class="isFailingScore(subj.regularSession.score) ? 'text-destructive' : ''"
              >
                N: {{ formatScore(subj.regularSession.score) }}
              </td>
              <td
                class="w-25 px-3.5 py-2 text-right text-[13px] font-bold"
                :class="isFailingScore(subj.retakeSession.score) ? 'text-destructive' : ''"
              >
                R: {{ formatScore(subj.retakeSession.score) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-2 flex flex-wrap gap-4">
        <div class="min-w-50 flex-1 border-2 border-border bg-muted p-3.5">
          <div class="text-[11px] font-bold text-muted-foreground uppercase">Crédits validés — Normale</div>
          <div class="font-heading text-xl font-extrabold">{{ sem.result.regularSession.creditsValidated }}</div>
        </div>
        <div class="min-w-50 flex-1 border-2 border-border bg-muted p-3.5">
          <div class="text-[11px] font-bold text-muted-foreground uppercase">Crédits validés — Rattrapage</div>
          <div class="font-heading text-xl font-extrabold">{{ sem.result.retakeSession.creditsValidated }}</div>
        </div>
      </div>
    </div>

    <div
      class="border-b-2 border-border p-5 text-center font-heading text-[26px] font-extrabold tracking-wide"
      :class="resultBandClass[transcript.annualResult]"
    >
      {{ STATUS_LABEL_FR[transcript.annualResult] }}
      <span v-if="transcript.cumulExpired" class="block text-sm font-semibold">(dette non rattrapée)</span>
    </div>

    <div class="flex justify-end p-6">
      <Button variant="secondary" :disabled="exporting" @click="exportPdf">
        {{ exporting ? 'Export en cours…' : 'Exporter en PDF' }}
      </Button>
    </div>
  </div>
</template>
