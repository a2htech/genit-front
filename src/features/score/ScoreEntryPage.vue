<script setup lang="ts">
import { computed, onUnmounted, ref, watch, watchEffect } from 'vue'
import { Trash2Icon, XIcon } from '@lucide/vue'
import { Alert } from '@/design-system/ui/alert'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { ConfirmDialog } from '@/design-system/ui/confirm-dialog'
import { Input } from '@/design-system/ui/input'
import { Skeleton, TableRowsSkeleton } from '@/design-system/ui/skeleton'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { useContextStore, useCurrentAcademicYearQuery } from '@/features/academic-year'
import { useTeachingUnitsQuery } from '@/features/teaching-unit'
import { studentFullName, type Student } from '@/features/student'
import { apiErrorMessage } from '@/shared/api/errors'
import { registerUnsavedGuard } from '@/shared/lib/unsaved-changes'
import { isFailingScore } from '@/shared/utils/format'
import RetakeStudentCombobox from './RetakeStudentCombobox.vue'
import ScoreEntryFilters from './ScoreEntryFilters.vue'
import { useDeleteScoreMutation, useEligibleStudentsQuery, useSaveScoresMutation } from './score.queries'
import type { ExamSession } from './score.types'

const context = useContextStore()
const errorMessage = ref<string | null>(null)

const { data: currentYear } = useCurrentAcademicYearQuery()
const classYear = computed(() => currentYear.value?.year ?? null)

const { data: teachingUnits, isPending } = useTeachingUnitsQuery()
const unitsWithSubjects = computed(() => (teachingUnits.value ?? []).filter((u) => u.subjects.length > 0))
const subjects = computed(() => unitsWithSubjects.value.flatMap((u) => u.subjects))
const subjectId = ref<number | null>(null)
// Les matières valides changent avec le niveau ; sans ça, subjectId garde une valeur qui n'existe plus.
watch(
  () => context.level,
  () => (subjectId.value = null),
)
watchEffect(() => {
  if (!subjectId.value && subjects.value.length > 0) {
    subjectId.value = subjects.value[0]!.id
  }
})

const session = ref<ExamSession>('normale')
const isRattrapage = computed(() => session.value === 'rattrapage')

const { data: eligibleStudents, isPending: eligibleStudentsPending } = useEligibleStudentsQuery(subjectId)
const saveMutation = useSaveScoresMutation(subjectId)
const deleteMutation = useDeleteScoreMutation(subjectId)

const currentSubject = computed(() => subjects.value.find((s) => s.id === subjectId.value) ?? null)
const currentUnit = computed(
  () => unitsWithSubjects.value.find((u) => u.subjects.some((s) => s.id === subjectId.value)) ?? null,
)

/** Étudiants ajoutés manuellement (rattrapage volontaire), en plus de la liste retournée par le back. */
const addedStudents = ref<Student[]>([])

/** Brouillon local des notes saisies ou corrigées, tant qu'elles n'ont pas été envoyées. */
const drafts = ref<Record<number, number | null>>({})

function discardChanges() {
  drafts.value = {}
  addedStudents.value = []
}
watch([subjectId, session], discardChanges)

const rows = computed(() => {
  const sessionStudents = isRattrapage.value
    ? (eligibleStudents.value?.retakeSession ?? [])
    : (eligibleStudents.value?.regularSession ?? [])
  const base = sessionStudents.map((s) => ({ studentId: Number(s.id), student: s, existing: s.score, isAdded: false }))
  if (!isRattrapage.value) return base
  const added = addedStudents.value.map((s) => ({ studentId: s.id, student: s, existing: null, isAdded: true }))
  return [...base, ...added]
})
type ScoreRow = (typeof rows)['value'][number]

/** Les cumulants (niveau réel inférieur au niveau consulté) passent après les étudiants du niveau. */
const levelRows = computed(() => rows.value.filter((r) => r.student.class === context.level))
const orderedRows = computed(() => [...levelRows.value, ...rows.value.filter((r) => r.student.class !== context.level)])

function addStudent(student: Student) {
  addedStudents.value = [...addedStudents.value, student]
}

function removeAddedStudent(studentId: number) {
  addedStudents.value = addedStudents.value.filter((s) => s.id !== studentId)
  delete drafts.value[studentId]
}

/** Le brouillon dès que la ligne a été touchée, sinon la note déjà enregistrée. */
function currentValue(row: ScoreRow): number | null {
  return row.studentId in drafts.value ? (drafts.value[row.studentId] ?? null) : (row.existing?.score ?? null)
}

function isOutOfRange(row: ScoreRow): boolean {
  const value = currentValue(row)
  return value !== null && (!Number.isFinite(value) || value < 0 || value > 20)
}

// Une ligne ABS (note enregistrée à vide) compte comme saisie, au même titre qu'une note chiffrée.
const filledCount = computed(() => rows.value.filter((r) => r.existing !== null || currentValue(r) !== null).length)

/** Lignes touchées dont la valeur diffère de l'enregistré : création, correction ou effacement. */
const pendingChanges = computed(() =>
  rows.value
    .filter((row) => row.studentId in drafts.value)
    .map((row) => ({ row, value: drafts.value[row.studentId] ?? null }))
    .filter(({ row, value }) => (row.existing ? value !== row.existing.score : value !== null)),
)
const hasPendingChanges = computed(() => pendingChanges.value.length > 0)
const hasOutOfRange = computed(() => pendingChanges.value.some(({ row }) => isOutOfRange(row)))

function onScoreInput(studentId: number, raw: string | number) {
  drafts.value[studentId] = raw === '' ? null : Number(raw)
}

function focusNextInput(e: KeyboardEvent, index: number) {
  if (e.key !== 'Enter') return
  e.preventDefault()
  document.getElementById(`grade-input-${index + 1}`)?.focus()
}

const unregisterGuard = registerUnsavedGuard(() => hasPendingChanges.value, discardChanges)
onUnmounted(unregisterGuard)

async function save() {
  if (!subjectId.value || classYear.value === null || !hasPendingChanges.value || hasOutOfRange.value) return
  // Toute ligne sans note enregistrée part dans le lot, vide comprise : le back crée alors une note nulle.
  const created = rows.value.filter((row) => !row.existing)
  const updated = pendingChanges.value.filter(({ row }) => row.existing)
  errorMessage.value = null
  try {
    await saveMutation.mutateAsync({
      create:
        created.length > 0
          ? {
              subjectId: subjectId.value,
              session: session.value,
              classYear: classYear.value,
              scores: created.map((row) => ({ student_id: row.studentId, score: currentValue(row) })),
            }
          : null,
      update: updated.map(({ row, value }) => ({ id: row.existing!.id, score: value })),
    })
  } catch (e) {
    errorMessage.value = apiErrorMessage(e)
    return
  }
  discardChanges()
}

const deleteTarget = ref<ScoreRow | null>(null)

async function confirmDelete() {
  const row = deleteTarget.value
  if (!row?.existing) return
  errorMessage.value = null
  try {
    await deleteMutation.mutateAsync(row.existing.id)
    delete drafts.value[row.studentId]
  } catch (e) {
    errorMessage.value = apiErrorMessage(e)
  }
  deleteTarget.value = null
}

const onDarkButtonClass =
  'border-background shadow-[4px_4px_0_0_var(--background)] hover:shadow-[2px_2px_0_0_var(--background)]'
</script>

<template>
  <div>
    <h1 class="mb-5 font-heading text-2xl font-extrabold">Saisie des notes — {{ context.level }}</h1>

    <ScoreEntryFilters
      v-model:subject-id="subjectId"
      v-model:session="session"
      :units="unitsWithSubjects"
      :pending="isPending"
    />

    <div class="mb-2.5 flex items-center justify-between">
      <div class="text-sm font-bold">
        <span v-if="currentUnit" class="text-muted-foreground">{{ currentUnit.code }} — {{ currentUnit.name }}</span>
        <span v-if="currentUnit" class="mx-1.5 text-muted-foreground">›</span>
        <span>{{ currentSubject?.name }}</span>
      </div>
      <Skeleton v-if="isPending" class="h-8 w-24" />
      <div v-else class="bg-primary px-3.5 py-1.5 font-heading text-sm font-extrabold text-primary-foreground">
        {{ filledCount }}/{{ rows.length }} saisies
      </div>
    </div>

    <Alert v-if="errorMessage" variant="destructive" class="mb-4">{{ errorMessage }}</Alert>

    <Alert v-if="hasOutOfRange" variant="warning" class="mb-4">
      Une note doit être comprise entre 0 et 20. Corrigez les valeurs signalées avant d'enregistrer.
    </Alert>

    <Table class="mb-24">
      <TableHeader>
        <TableRow>
          <TableHead>Étudiant</TableHead>
          <TableHead class="w-48">Note / 20</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRowsSkeleton
          v-if="isPending || eligibleStudentsPending"
          :rows="6"
          :columns="2"
          :cell-class="['h-4 w-40', 'h-9 w-full']"
        />
        <template v-else>
          <template v-for="(row, index) in orderedRows" :key="row.studentId">
            <TableRow v-if="index === levelRows.length" class="bg-warning/15 hover:bg-warning/15">
              <TableCell colspan="2" class="text-xs font-bold tracking-wide text-foreground/70 uppercase">
                Étudiants en cumul
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                {{ studentFullName(row.student) }}
                <Badge v-if="row.student.class !== context.level" variant="warning" class="ml-2">
                  {{ row.student.class }}
                </Badge>
                <Badge v-if="row.isAdded" variant="accent" class="ml-2">Ajouté</Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Input
                    :id="`grade-input-${index}`"
                    type="number"
                    :min="0"
                    :max="20"
                    :step="0.5"
                    :placeholder="row.existing ? 'ABS' : '—'"
                    class="text-center font-bold"
                    :class="[
                      isFailingScore(currentValue(row)) ? 'text-destructive' : '',
                      row.existing ? 'placeholder:text-destructive' : '',
                    ]"
                    :aria-invalid="isOutOfRange(row)"
                    :model-value="currentValue(row) ?? ''"
                    @update:model-value="(v) => onScoreInput(row.studentId, v ?? '')"
                    @keydown="(e: KeyboardEvent) => focusNextInput(e, index)"
                  />
                  <!-- Emplacement réservé sur chaque ligne pour que les champs restent alignés. -->
                  <div class="size-9 shrink-0">
                    <Button
                      v-if="row.isAdded"
                      type="button"
                      variant="ghost"
                      size="icon"
                      emphasis="compact"
                      aria-label="Retirer cet étudiant"
                      @click="removeAddedStudent(row.studentId)"
                    >
                      <XIcon />
                    </Button>
                    <Button
                      v-else-if="row.existing"
                      type="button"
                      variant="ghost"
                      size="icon"
                      emphasis="compact"
                      aria-label="Supprimer cette note"
                      @click="deleteTarget = row"
                    >
                      <Trash2Icon />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </template>
      </TableBody>
      <TableFooter v-if="isRattrapage">
        <TableRow>
          <TableCell colspan="2">
            <RetakeStudentCombobox
              :subject-id="subjectId"
              :excluded-ids="addedStudents.map((s) => s.id)"
              @add="addStudent"
            />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>

    <div class="fixed inset-x-0 bottom-0 z-30 flex justify-end gap-3.5 bg-foreground px-6 py-4">
      <Button
        variant="success"
        :class="onDarkButtonClass"
        :disabled="!hasPendingChanges || hasOutOfRange || saveMutation.isPending.value"
        @click="save"
      >
        Enregistrer les notes
      </Button>
      <Button variant="secondary" :class="onDarkButtonClass" as-child>
        <RouterLink :to="{ name: 'dashboard' }">Terminer</RouterLink>
      </Button>
    </div>

    <ConfirmDialog
      :open="deleteTarget !== null"
      title="Supprimer cette note ?"
      :description="`La note de ${deleteTarget ? studentFullName(deleteTarget.student) : ''} en ${currentSubject?.name ?? ''} ne sera plus affichée.`"
      confirm-label="Supprimer"
      destructive
      :pending="deleteMutation.isPending.value"
      @update:open="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
