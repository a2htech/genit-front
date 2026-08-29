<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Card } from '@/design-system/ui/card'
import { Empty, EmptyDescription, EmptyTitle } from '@/design-system/ui/empty'
import { Spinner } from '@/design-system/ui/spinner'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { useContextStore } from '@/features/academic-year'
import { ACADEMIC_STATUS_LABELS, useStudentsQuery, type AcademicStatusCode } from '@/features/student'
import { toApiError } from '@/shared/api/errors'
import { useAnnualResultsQuery, useCalculateAllAnnualResultsMutation } from './transcript.queries'

const router = useRouter()
const context = useContextStore()
const errorMessage = ref<string | null>(null)

const { data: annualResults, isPending: resultsPending } = useAnnualResultsQuery()
const { data: students, isPending: studentsPending } = useStudentsQuery()
const isPending = computed(() => resultsPending.value || studentsPending.value)

const calculateMutation = useCalculateAllAnnualResultsMutation()

async function recalculate() {
  errorMessage.value = null
  try {
    await calculateMutation.mutateAsync()
  } catch (e) {
    errorMessage.value = toApiError(e).message
  }
}

const studentsById = computed(() => new Map((students.value ?? []).map((s) => [s.id, s])))

const statusTone: Record<AcademicStatusCode, 'success' | 'warning' | 'destructive' | 'accent'> = {
  P: 'success',
  C: 'warning',
  R: 'destructive',
  T: 'accent',
}

const filter = ref<AcademicStatusCode | 'all'>('all')

const rows = computed(() => {
  const list = annualResults.value ?? []
  return (filter.value === 'all' ? list : list.filter((r) => r.status === filter.value)).map((r) => ({
    result: r,
    student: studentsById.value.get(r.student_id) ?? null,
  }))
})

const stats = computed(() => {
  const list = annualResults.value ?? []
  return {
    P: list.filter((r) => r.status === 'P').length,
    C: list.filter((r) => r.status === 'C').length,
    R: list.filter((r) => r.status === 'R').length,
    T: list.filter((r) => r.status === 'T').length,
  }
})

/**
 * Which decisions are even possible at this level (AcademicStatusEnum::allowsCumul()/isTerminal()
 * côté back) : L3/M2 n'ont pas de cumul (sous réserve), et seul M2 est terminal (diplôme, pas passage).
 */
const visibleStatCards = computed(() => {
  const level = context.level
  const cards: { key: AcademicStatusCode; count: number }[] = []
  if (level !== 'M2') cards.push({ key: 'P', count: stats.value.P })
  if (level !== 'L3' && level !== 'M2') cards.push({ key: 'C', count: stats.value.C })
  cards.push({ key: 'R', count: stats.value.R })
  if (level === 'M2') cards.push({ key: 'T', count: stats.value.T })
  return cards
})
const statsGridClass = computed(() => (visibleStatCards.value.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'))

const filterDefs = computed(() => [
  { key: 'all' as const, label: 'Tous' },
  ...visibleStatCards.value.map((c) => ({ key: c.key, label: ACADEMIC_STATUS_LABELS[c.key] })),
])
watch(visibleStatCards, (cards) => {
  if (filter.value !== 'all' && !cards.some((c) => c.key === filter.value)) filter.value = 'all'
})

function openTranscript(studentId: number) {
  router.push({ name: 'transcript', params: { studentId: String(studentId) } })
}
</script>

<template>
  <Spinner v-if="isPending" class="mx-auto mt-32 size-8" />
  <div v-else>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-heading text-2xl font-extrabold">Résultats — {{ context.level }}</h1>
      <Button variant="secondary" :disabled="calculateMutation.isPending.value" @click="recalculate">
        {{ calculateMutation.isPending.value ? 'Calcul en cours…' : 'Recalculer les résultats' }}
      </Button>
    </div>

    <div v-if="errorMessage" class="mb-4 border-2 border-destructive bg-destructive/10 p-3 text-sm font-semibold text-destructive">
      {{ errorMessage }}
    </div>

    <Empty v-if="(annualResults ?? []).length === 0">
      <EmptyTitle>Aucun résultat calculé</EmptyTitle>
      <EmptyDescription>
        Cliquez sur « Recalculer les résultats » pour générer les décisions annuelles de cette
        classe.
      </EmptyDescription>
    </Empty>

    <template v-else>
      <div class="mb-5.5 grid grid-cols-2 gap-4" :class="statsGridClass">
        <Card v-for="card in visibleStatCards" :key="card.key" class="px-4 py-3">
          <div class="text-xs font-extrabold text-muted-foreground uppercase">{{ ACADEMIC_STATUS_LABELS[card.key] }}</div>
          <div class="font-heading text-3xl font-extrabold">{{ card.count }}</div>
        </Card>
      </div>

      <ToggleGroup v-model="filter" type="single" variant="outline" class="mb-4">
        <ToggleGroupItem v-for="f in filterDefs" :key="f.key" :value="f.key" size="sm">
          {{ f.label }}
        </ToggleGroupItem>
      </ToggleGroup>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Étudiant</TableHead>
            <TableHead class="w-32">Décision</TableHead>
            <TableHead>Matières non acquises</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableEmpty v-if="rows.length === 0" :colspan="4">
            <div class="text-center text-sm font-semibold text-muted-foreground">
              Aucun étudiant dans ce filtre.
            </div>
          </TableEmpty>
          <TableRow
            v-for="row in rows"
            :key="row.result.id"
            interactive
            @click="openTranscript(row.result.student_id)"
          >
            <TableCell class="font-bold">{{ row.result.student_id }}</TableCell>
            <TableCell>
              {{ row.student ? `${row.student.first_name} ${row.student.last_name ?? ''}` : `Étudiant #${row.result.student_id}` }}
            </TableCell>
            <TableCell>
              <Badge :variant="statusTone[row.result.status]">{{ ACADEMIC_STATUS_LABELS[row.result.status] }}</Badge>
            </TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1.5">
                <Badge v-for="subj in row.result.failed_subjects" :key="subj.id" variant="destructive">
                  {{ subj.name }}
                </Badge>
                <span v-if="row.result.failed_subjects.length === 0" class="text-xs opacity-50">—</span>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </template>
  </div>
</template>
