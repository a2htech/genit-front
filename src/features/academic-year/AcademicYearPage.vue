<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/design-system/ui/button'
import { Card } from '@/design-system/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/ui/dialog'
import { Field, FieldLabel } from '@/design-system/ui/field'
import { Input } from '@/design-system/ui/input'
import { Skeleton } from '@/design-system/ui/skeleton'
import { ACADEMIC_STATUS_LABELS, type AcademicStatusCode } from '@/features/student'
import {
  useAnnualResultsSummaryQuery,
  useCalculateAllAnnualResultsMutation,
  useMissingAnnualResultsQuery,
} from '@/features/transcript'
import { toApiError } from '@/shared/api/errors'
import { useCreateAcademicYearMutation, useCurrentAcademicYearQuery } from './academic-year.queries'
import { LEVELS, type Level } from './academic-year.types'
import { useContextStore } from './context.store'

const router = useRouter()
const context = useContextStore()

const { data: currentYear, isPending } = useCurrentAcademicYearQuery()
const createMutation = useCreateAcademicYearMutation()

const { data: missingResults, isPending: missingPending } = useMissingAnnualResultsQuery()
const hasMissingResults = computed(() => (missingResults.value ?? []).length > 0)

const calculateMutation = useCalculateAllAnnualResultsMutation()
const calculateErrorMessage = ref<string | null>(null)

async function calculateMissingResults() {
  calculateErrorMessage.value = null
  try {
    await calculateMutation.mutateAsync()
  } catch (e) {
    calculateErrorMessage.value = toApiError(e).message
  }
}

const { data: summary, isPending: summaryPending } = useAnnualResultsSummaryQuery()

const STATUS_ORDER: AcademicStatusCode[] = ['P', 'C', 'R', 'T']
const STATUS_COLOR_CLASS: Record<AcademicStatusCode, string> = {
  P: 'bg-success',
  C: 'bg-warning',
  R: 'bg-destructive',
  T: 'bg-accent',
}

/** Mêmes règles que sur la page Décisions (AcademicStatusEnum::allowsCumul()/isTerminal() côté back). */
function isDecisionApplicable(status: AcademicStatusCode, level: Level): boolean {
  if (status === 'P') return level !== 'M2'
  if (status === 'C') return level !== 'L3' && level !== 'M2'
  if (status === 'T') return level === 'M2'
  return true
}

const summaryRows = computed(() =>
  LEVELS.map(({ value: level }) => {
    const counts = summary.value?.[level] ?? { P: 0, C: 0, R: 0, T: 0 }
    const total = counts.P + counts.C + counts.R + counts.T
    const segments = STATUS_ORDER.filter((status) => isDecisionApplicable(status, level)).map((status) => ({
      status,
      label: ACADEMIC_STATUS_LABELS[status],
      count: counts[status],
      percent: total > 0 ? (counts[status] / total) * 100 : 0,
      colorClass: STATUS_COLOR_CLASS[status],
    }))
    return { level, total, segments }
  }),
)

function openDecisions(level: Level) {
  context.setLevel(level)
  router.push({ name: 'decisions' })
}

const nextYear = computed(() => (currentYear.value ? currentYear.value.year + 1 : null))

const switchModalOpen = ref(false)
const switchConfirmText = ref('')
const switchConfirmValid = computed(() => switchConfirmText.value === String(nextYear.value))

function openSwitchConfirm() {
  switchConfirmText.value = ''
  switchModalOpen.value = true
}

async function confirmSwitch() {
  if (!switchConfirmValid.value || nextYear.value === null) return
  await createMutation.mutateAsync(nextYear.value)
  switchModalOpen.value = false
}
</script>

<template>
  <div>
    <h1 class="font-heading mb-5 text-2xl font-extrabold">Année universitaire</h1>

    <Card class="mb-6 flex-row flex-wrap items-center justify-between gap-4 px-5">
      <div>
        <div class="text-xs font-bold tracking-wide text-muted-foreground uppercase">Année active</div>
        <Skeleton v-if="isPending" class="mt-1 h-8 w-20" />
        <div v-else class="font-heading text-2xl font-extrabold">{{ currentYear?.year }}</div>
      </div>
      <Skeleton v-if="missingPending" class="h-11 w-56" />
      <Button
        v-else-if="hasMissingResults"
        variant="secondary"
        :disabled="calculateMutation.isPending.value"
        @click="calculateMissingResults"
      >
        {{ calculateMutation.isPending.value ? 'Calcul en cours…' : 'Calculer les résultats' }}
      </Button>
      <Button v-else variant="destructive" :disabled="isPending" @click="openSwitchConfirm">
        Basculer vers l'année suivante
      </Button>
    </Card>

    <div v-if="calculateErrorMessage" class="mb-6 border-2 border-destructive bg-destructive/10 p-3 text-sm font-semibold text-destructive">
      {{ calculateErrorMessage }}
    </div>

    <h2 class="font-heading mb-3 text-lg font-extrabold">Résumé des décisions</h2>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <template v-if="summaryPending">
        <Skeleton v-for="n in 5" :key="n" class="h-44 w-full" />
      </template>
      <button
        v-for="row in summaryRows"
        v-else
        :key="row.level"
        type="button"
        class="border-2 border-border bg-card p-4 text-left shadow-brutal-md transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-sm focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        @click="openDecisions(row.level)"
      >
        <div class="mb-3 flex items-baseline justify-between gap-2">
          <span class="font-heading text-xl font-extrabold">{{ row.level }}</span>
          <span class="text-xs font-bold text-muted-foreground">
            {{ row.total }} décision{{ row.total > 1 ? 's' : '' }}
          </span>
        </div>

        <template v-if="row.total > 0">
          <div class="mb-3 flex h-3 w-full overflow-hidden border-2 border-border" aria-hidden="true">
            <div
              v-for="seg in row.segments"
              :key="seg.status"
              :class="seg.colorClass"
              class="h-full border-l-2 border-border first:border-l-0"
              :style="{ width: `${seg.percent}%` }"
            />
          </div>

          <ul class="space-y-1.5">
            <li
              v-for="seg in row.segments"
              :key="seg.status"
              class="flex items-center justify-between gap-2 text-xs font-semibold"
            >
              <span class="flex items-center gap-1.5">
                <span :class="seg.colorClass" class="size-2.5 shrink-0 border border-border" aria-hidden="true" />
                {{ seg.label }}
              </span>
              <span class="font-heading font-extrabold">{{ seg.count }}</span>
            </li>
          </ul>
        </template>
        <p v-else class="text-xs font-semibold text-muted-foreground">Aucune décision calculée.</p>
      </button>
    </div>

    <Dialog v-model:open="switchModalOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Basculer vers {{ nextYear }} ?</DialogTitle>
          <DialogDescription class="sr-only">
            Confirmer la bascule vers l'année universitaire suivante.
          </DialogDescription>
        </DialogHeader>

        <div class="border-2 border-border bg-muted p-3.5 text-sm leading-relaxed">
          Cette action va créer l'année <strong>{{ nextYear }}</strong> et la définir comme année
          courante pour tout le monde. <strong>Cette action est irréversible.</strong>
        </div>

        <Field>
          <FieldLabel>Tapez « {{ nextYear }} » pour confirmer</FieldLabel>
          <Input v-model="switchConfirmText" />
        </Field>

        <DialogFooter>
          <Button variant="secondary" emphasis="compact" @click="switchModalOpen = false">
            Annuler
          </Button>
          <Button
            variant="destructive"
            :disabled="!switchConfirmValid || createMutation.isPending.value"
            @click="confirmSwitch"
          >
            Confirmer la bascule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
