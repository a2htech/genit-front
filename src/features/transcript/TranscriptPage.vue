<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Empty, EmptyDescription, EmptyTitle } from '@/design-system/ui/empty'
import { Input } from '@/design-system/ui/input'
import { Spinner } from '@/design-system/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { LEVELS, useContextStore, type Level } from '@/features/academic-year'
import { useStudentsQuery } from '@/features/student'
import { formatAverage, formatDate, formatScore, isFailingScore } from '@/shared/utils/format'
import { downloadTranscriptPdf } from './transcript.api'
import { useTranscriptQuery } from './transcript.queries'
import { MENTION_LABEL_FR, STATUS_LABEL_FR } from './transcript.types'

const route = useRoute()
const router = useRouter()
const context = useContextStore()

const studentId = computed(() => {
  const raw = route.params.studentId as string | undefined
  return raw ? Number(raw) : null
})
const search = ref('')

const { data: students } = useStudentsQuery()
const suggestions = computed(() => {
  if (studentId.value) return []
  const term = search.value.toLowerCase().trim()
  if (!term) return []
  return (students.value ?? [])
    .filter((s) => `${s.first_name} ${s.last_name ?? ''}`.toLowerCase().includes(term))
    .slice(0, 5)
})

function selectSuggestion(id: number, label: string) {
  search.value = label
  router.push({ name: 'transcript', params: { studentId: String(id) } })
}

function onSearchChange() {
  if (studentId.value) router.replace({ name: 'transcript', params: {} })
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

const resultBandClass: Record<string, string> = {
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
  <h1 class="font-heading mb-5 text-2xl font-extrabold">Bulletin</h1>

  <div class="relative mb-6.5 max-w-115">
    <Input v-model="search" placeholder="Rechercher un étudiant par nom…" @input="onSearchChange" />
    <div
      v-if="suggestions.length > 0"
      class="absolute top-[calc(100%+4px)] right-0 left-0 z-10 border-2 border-border bg-card shadow-brutal-md"
    >
      <div
        v-for="s in suggestions"
        :key="s.id"
        class="cursor-pointer border-b-2 border-border px-3.5 py-2.5 text-sm font-semibold last:border-b-0 hover:bg-accent hover:text-accent-foreground"
        @click="selectSuggestion(s.id, `${s.first_name} ${s.last_name}`)"
      >
        {{ s.first_name }} {{ s.last_name }} — #{{ s.id }}
      </div>
    </div>
  </div>

  <Empty v-if="!studentId">
    <EmptyTitle>Aucun étudiant sélectionné</EmptyTitle>
    <EmptyDescription>Recherchez un étudiant ci-dessus pour afficher son bulletin.</EmptyDescription>
  </Empty>

  <Spinner v-else-if="isPending" class="mx-auto mt-12 size-8" />

  <Empty v-else-if="!transcript">
    <EmptyTitle>Pas assez de notes à ce niveau</EmptyTitle>
    <EmptyDescription>Ce niveau ne compte pas encore assez de notes saisies pour générer un bulletin.</EmptyDescription>
  </Empty>

  <div v-else class="border-2 border-border bg-card shadow-brutal-lg">
    <div class="border-b-2 border-border px-6 py-4.5 text-center">
      <div class="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
        Université — Mention Informatique
      </div>
      <div class="font-heading mt-1 text-base font-extrabold">
        Fiche individuelle de résultats — {{ transcript.student.class }}
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-5 border-b-2 border-border p-6">
      <div class="font-heading flex size-18 shrink-0 items-center justify-center border-2 border-border bg-muted text-2xl font-extrabold">
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
      <div class="font-heading mb-3.5 text-base font-extrabold">Semestre {{ sem.number }}</div>

      <div v-for="ue in sem.teachingUnits" :key="ue.code" class="mb-3.5 border-2 border-border">
        <div class="flex flex-wrap items-center gap-2.5 border-b-2 border-border bg-muted px-3.5 py-2.5">
          <div class="font-heading min-w-45 flex-1 text-[13px] font-extrabold">{{ ue.code }} — {{ ue.name }}</div>
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
      class="font-heading border-b-2 border-border p-5 text-center text-[26px] font-extrabold tracking-wide"
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
