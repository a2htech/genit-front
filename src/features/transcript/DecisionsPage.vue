<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { BanIcon } from '@lucide/vue'
import { Alert } from '@/design-system/ui/alert'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Card } from '@/design-system/ui/card'
import { Empty, EmptyDescription, EmptyTitle } from '@/design-system/ui/empty'
import { Skeleton, StatCardSkeleton, TableRowsSkeleton } from '@/design-system/ui/skeleton'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { useContextStore } from '@/features/academic-year'
import {
  ACADEMIC_STATUS_CODES,
  ACADEMIC_STATUS_LABELS,
  ACADEMIC_STATUS_VARIANTS,
  studentFullName,
  useStudentsQuery,
  type AcademicStatusCode,
} from '@/features/student'
import { apiErrorMessage } from '@/shared/api/errors'
import { useAnnualResultsQuery, useCalculateAnnualResultsForClassMutation } from './transcript.queries'
import { isDecisionApplicable } from './transcript.types'

const router = useRouter()
const context = useContextStore()
const errorMessage = ref<string | null>(null)

const { data: annualResults, isPending: resultsPending } = useAnnualResultsQuery()
const { data: students, isPending: studentsPending } = useStudentsQuery()
const isPending = computed(() => resultsPending.value || studentsPending.value)

const calculateMutation = useCalculateAnnualResultsForClassMutation()

async function recalculate() {
  errorMessage.value = null
  try {
    await calculateMutation.mutateAsync()
  } catch (e) {
    errorMessage.value = apiErrorMessage(e)
  }
}

const studentsById = computed(() => new Map((students.value ?? []).map((s) => [s.id, s])))

/** Seules les décisions possibles à ce niveau ont une carte et un filtre. */
const statCards = computed(() =>
  ACADEMIC_STATUS_CODES.filter((status) => isDecisionApplicable(status, context.level!)).map((status) => ({
    status,
    count: (annualResults.value ?? []).filter((r) => r.status === status).length,
  })),
)
const statsGridClass = computed(() => (statCards.value.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'))

const filter = ref<AcademicStatusCode | 'all'>('all')
watch(statCards, (cards) => {
  if (filter.value !== 'all' && !cards.some((c) => c.status === filter.value)) filter.value = 'all'
})

const rows = computed(() => {
  const list = annualResults.value ?? []
  return (filter.value === 'all' ? list : list.filter((r) => r.status === filter.value)).map((result) => ({
    result,
    student: studentsById.value.get(result.student_id) ?? null,
  }))
})

function openTranscript(studentId: number) {
  router.push({ name: 'transcript', params: { studentId: String(studentId) } })
}
</script>

<template>
  <div>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-heading text-2xl font-extrabold">Résultats — {{ context.level }}</h1>
      <Button variant="secondary" :disabled="calculateMutation.isPending.value" @click="recalculate">
        {{ calculateMutation.isPending.value ? 'Calcul en cours…' : 'Recalculer les résultats' }}
      </Button>
    </div>

    <Alert v-if="errorMessage" variant="destructive" class="mb-4">{{ errorMessage }}</Alert>

    <template v-if="isPending">
      <div class="mb-5.5 grid grid-cols-2 gap-4" :class="statsGridClass">
        <StatCardSkeleton
          v-for="card in statCards"
          :key="card.status"
          :label="ACADEMIC_STATUS_LABELS[card.status]"
          class="px-4 py-3"
          value-class="h-8 w-14"
        />
      </div>
      <Skeleton class="mb-4 h-9 w-72" />
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
          <TableRowsSkeleton :rows="5" :columns="4" />
        </TableBody>
      </Table>
    </template>

    <template v-else>
      <Empty v-if="(annualResults ?? []).length === 0">
        <EmptyTitle>Aucun résultat calculé</EmptyTitle>
        <EmptyDescription>
          Cliquez sur « Recalculer les résultats » pour générer les décisions annuelles de cette classe.
        </EmptyDescription>
      </Empty>

      <template v-else>
        <div class="mb-5.5 grid grid-cols-2 gap-4" :class="statsGridClass">
          <Card v-for="card in statCards" :key="card.status" class="px-4 py-3">
            <div class="text-xs font-extrabold text-muted-foreground uppercase">
              {{ ACADEMIC_STATUS_LABELS[card.status] }}
            </div>
            <div class="font-heading text-3xl font-extrabold">{{ card.count }}</div>
          </Card>
        </div>

        <ToggleGroup v-model="filter" type="single" variant="outline" class="mb-4">
          <ToggleGroupItem value="all" size="sm">Tous</ToggleGroupItem>
          <ToggleGroupItem v-for="card in statCards" :key="card.status" :value="card.status" size="sm">
            {{ ACADEMIC_STATUS_LABELS[card.status] }}
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
              <div class="text-center text-sm font-semibold text-muted-foreground">Aucun étudiant dans ce filtre.</div>
            </TableEmpty>
            <TableRow
              v-for="row in rows"
              :key="row.result.id"
              interactive
              @click="openTranscript(row.result.student_id)"
            >
              <TableCell class="font-bold">{{ row.result.student_id }}</TableCell>
              <TableCell>
                {{ row.student ? studentFullName(row.student) : `Étudiant #${row.result.student_id}` }}
              </TableCell>
              <TableCell>
                <Badge
                  :variant="row.result.expired ? 'critical' : ACADEMIC_STATUS_VARIANTS[row.result.status]"
                  :title="
                    row.result.expired
                      ? 'Dette non rattrapée dans le délai imparti : ne peut plus se réinscrire à ce niveau.'
                      : undefined
                  "
                >
                  <BanIcon v-if="row.result.expired" aria-hidden="true" class="size-3" />
                  {{ row.result.expired ? 'Exclu(e)' : ACADEMIC_STATUS_LABELS[row.result.status] }}
                </Badge>
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
    </template>
  </div>
</template>
