<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { Trash2Icon, XIcon } from '@lucide/vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/design-system/ui/alert-dialog'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Input } from '@/design-system/ui/input'
import { Skeleton, TableRowsSkeleton } from '@/design-system/ui/skeleton'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { useContextStore, useCurrentAcademicYearQuery } from '@/features/academic-year'
import { useTeachingUnitsQuery } from '@/features/teaching-unit'
import { type Student } from '@/features/student'
import { toApiError } from '@/shared/api/errors'
import { registerUnsavedGuard } from '@/shared/lib/unsaved-changes'
import { isFailingScore } from '@/shared/utils/format'
import RetakeStudentCombobox from './RetakeStudentCombobox.vue'
import ScoreEntryFilters from './ScoreEntryFilters.vue'
import { useDeleteScoreMutation, useEligibleStudentsQuery, useSaveScoresMutation } from './score.queries'
import type { ExamSession } from './score.types'

const errorMessage = ref<string | null>(null)

const router = useRouter()
const context = useContextStore()

const { data: currentYear } = useCurrentAcademicYearQuery()
const classYear = computed(() => currentYear.value?.year ?? null)

const { data: teachingUnits, isPending: subjectsPending } = useTeachingUnitsQuery()
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

const { data: eligibleStudents, isPending: eligibleStudentsPending } = useEligibleStudentsQuery(subjectId)
const saveMutation = useSaveScoresMutation(subjectId)
const deleteMutation = useDeleteScoreMutation(subjectId)

const isPending = computed(() => subjectsPending.value)

const currentSubject = computed(() => subjects.value.find((s) => s.id === subjectId.value) ?? null)
const currentUnit = computed(
  () => unitsWithSubjects.value.find((u) => u.subjects.some((s) => s.id === subjectId.value)) ?? null,
)
const subjectLabel = computed(() => (currentSubject.value ? `${currentSubject.value.name}` : ''))

const sessionStudents = computed(() => {
  if (!eligibleStudents.value) return []
  return session.value === 'normale' ? eligibleStudents.value.regularSession : eligibleStudents.value.retakeSession
})

/** Étudiants ajoutés manuellement (rattrapage volontaire), en plus de la liste retournée par le back. */
const addedStudents = ref<Student[]>([])

/** Brouillon local des notes saisies ou corrigées, tant qu'elles n'ont pas été envoyées. */
const drafts = reactive<Record<number, number | null>>({})

function resetDrafts() {
  for (const key of Object.keys(drafts)) delete drafts[Number(key)]
  addedStudents.value = []
}
watch([subjectId, session], resetDrafts)

const rows = computed(() => {
  const base = sessionStudents.value.map((s) => ({
    studentId: Number(s.id),
    student: s,
    existing: s.score,
    isAdded: false,
  }))
  if (session.value !== 'rattrapage' || addedStudents.value.length === 0) return base
  const extra = addedStudents.value.map((s) => ({ studentId: s.id, student: s, existing: null, isAdded: true }))
  return [...base, ...extra]
})

/** Étudiants dont le niveau réel diffère du niveau consulté : ils cumulent encore cette matière d'un niveau inférieur. */
const nativeRows = computed(() => rows.value.filter((r) => r.student.class === context.level))
const cumulRows = computed(() => rows.value.filter((r) => r.student.class !== context.level))

type ScoreRow = (typeof rows)['value'][number]
type DisplayEntry = { type: 'separator'; key: string } | { type: 'row'; key: number; row: ScoreRow; gradeIndex: number }

/** Cumulants regroupés après les étudiants du niveau, séparés par un en-tête de section (choix UX validé). */
const displayRows = computed<DisplayEntry[]>(() => {
  const native = nativeRows.value.map((row, i): DisplayEntry => ({
    type: 'row',
    key: row.studentId,
    row,
    gradeIndex: i,
  }))
  const cumul = cumulRows.value.map((row, i): DisplayEntry => ({
    type: 'row',
    key: row.studentId,
    row,
    gradeIndex: native.length + i,
  }))
  if (cumul.length === 0) return native
  return [...native, { type: 'separator', key: 'cumul-separator' }, ...cumul]
})

const isRattrapage = computed(() => session.value === 'rattrapage')
const addedStudentIds = computed(() => addedStudents.value.map((s) => s.id))

function addStudent(student: Student) {
  addedStudents.value = [...addedStudents.value, student]
}

function removeAddedStudent(studentId: number) {
  addedStudents.value = addedStudents.value.filter((s) => s.id !== studentId)
  delete drafts[studentId]
}

function isScoreInRange(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 20
}

/** Le brouillon dès que la ligne a été touchée, sinon la note déjà enregistrée. */
function currentValue(row: ScoreRow): number | null {
  return row.studentId in drafts ? (drafts[row.studentId] ?? null) : (row.existing?.score ?? null)
}

function isOutOfRange(row: ScoreRow): boolean {
  const value = currentValue(row)
  return value !== null && !isScoreInRange(value)
}

// Une ligne ABS (note enregistrée à vide) compte comme saisie, au même titre qu'une note chiffrée.
const filledCount = computed(() => rows.value.filter((r) => r.existing !== null || currentValue(r) !== null).length)
const progressLabel = computed(() => `${filledCount.value}/${rows.value.length}`)

/** Lignes touchées dont la valeur diffère de l'enregistré : création, correction ou effacement. */
const pendingChanges = computed(() =>
  rows.value
    .filter((row) => row.studentId in drafts)
    .map((row) => ({ row, value: drafts[row.studentId] ?? null }))
    .filter(({ row, value }) => (row.existing ? value !== row.existing.score : value !== null)),
)

function onScoreInput(studentId: number, raw: string | number) {
  drafts[studentId] = raw === '' ? null : Number(raw)
}

function onKeydown(e: KeyboardEvent, index: number) {
  if (e.key === 'Enter') {
    e.preventDefault()
    const next = document.getElementById(`grade-input-${index + 1}`)
    next?.focus()
  }
}

const hasPendingChanges = computed(() => pendingChanges.value.length > 0)
const hasOutOfRange = computed(() => pendingChanges.value.some(({ row }) => isOutOfRange(row)))
const isSaving = saveMutation.isPending

const unregisterGuard = registerUnsavedGuard(() => hasPendingChanges.value, resetDrafts)
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
    errorMessage.value = toApiError(e).message
    return
  }
  resetDrafts()
}

const deleteTarget = ref<ScoreRow | null>(null)
// AlertDialogAction ferme le dialog (deleteTarget → null) avant ce handler : la ligne est capturée à part.
let deleteTargetRow: ScoreRow | null = null

function askDelete(row: ScoreRow) {
  deleteTarget.value = row
  deleteTargetRow = row
}

async function confirmDelete() {
  const row = deleteTargetRow
  deleteTargetRow = null
  if (!row?.existing) return
  errorMessage.value = null
  try {
    await deleteMutation.mutateAsync(row.existing.id)
    delete drafts[row.studentId]
  } catch (e) {
    errorMessage.value = toApiError(e).message
  }
  deleteTarget.value = null
}

function finish() {
  router.push({ name: 'dashboard' })
}
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
        <span>{{ subjectLabel }}</span>
      </div>
      <Skeleton v-if="isPending" class="h-8 w-24" />
      <div v-else class="bg-primary px-3.5 py-1.5 font-heading text-sm font-extrabold text-primary-foreground">
        {{ progressLabel }} saisies
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="mb-4 border-2 border-destructive bg-destructive/10 p-3 text-sm font-semibold text-destructive"
    >
      {{ errorMessage }}
    </div>

    <div v-if="hasOutOfRange" class="mb-4 border-2 border-warning bg-warning/15 p-3 text-sm font-semibold">
      Une note doit être comprise entre 0 et 20. Corrigez les valeurs signalées avant d'enregistrer.
    </div>

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
          <template v-for="entry in displayRows" :key="entry.key">
            <TableRow v-if="entry.type === 'separator'" class="bg-warning/15 hover:bg-warning/15">
              <TableCell colspan="2" class="text-xs font-bold tracking-wide text-foreground/70 uppercase">
                Étudiants en cumul
              </TableCell>
            </TableRow>
            <TableRow v-else>
              <TableCell>
                {{ entry.row.student.first_name }} {{ entry.row.student.last_name }}
                <Badge v-if="entry.row.student.class !== context.level" variant="warning" class="ml-2">
                  {{ entry.row.student.class }}
                </Badge>
                <Badge v-if="entry.row.isAdded" variant="accent" class="ml-2">Ajouté</Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Input
                    :id="`grade-input-${entry.gradeIndex}`"
                    type="number"
                    :min="0"
                    :max="20"
                    :step="0.5"
                    :placeholder="entry.row.existing ? 'ABS' : '—'"
                    class="text-center font-bold"
                    :class="[
                      isFailingScore(currentValue(entry.row)) ? 'text-destructive' : '',
                      entry.row.existing ? 'placeholder:text-destructive' : '',
                    ]"
                    :aria-invalid="isOutOfRange(entry.row)"
                    :model-value="currentValue(entry.row) ?? ''"
                    @update:model-value="(v) => onScoreInput(entry.row.studentId, v ?? '')"
                    @keydown="(e: KeyboardEvent) => onKeydown(e, entry.gradeIndex)"
                  />
                  <!-- Emplacement réservé sur chaque ligne pour que les champs restent alignés. -->
                  <div class="size-9 shrink-0">
                    <Button
                      v-if="entry.row.isAdded"
                      type="button"
                      variant="ghost"
                      size="icon"
                      emphasis="compact"
                      aria-label="Retirer cet étudiant"
                      @click="removeAddedStudent(entry.row.studentId)"
                    >
                      <XIcon />
                    </Button>
                    <Button
                      v-else-if="entry.row.existing"
                      type="button"
                      variant="ghost"
                      size="icon"
                      emphasis="compact"
                      aria-label="Supprimer cette note"
                      @click="askDelete(entry.row)"
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
            <RetakeStudentCombobox :subject-id="subjectId" :excluded-ids="addedStudentIds" @add="addStudent" />
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>

    <div class="fixed inset-x-0 bottom-0 z-30 flex justify-end gap-3.5 bg-foreground px-6 py-4">
      <Button
        variant="success"
        class="border-background shadow-[4px_4px_0_0_var(--background)] hover:shadow-[2px_2px_0_0_var(--background)]"
        :disabled="!hasPendingChanges || hasOutOfRange || isSaving"
        @click="save"
      >
        Enregistrer les notes
      </Button>
      <Button
        variant="secondary"
        class="border-background shadow-[4px_4px_0_0_var(--background)] hover:shadow-[2px_2px_0_0_var(--background)]"
        @click="finish"
      >
        Terminer
      </Button>
    </div>

    <AlertDialog :open="!!deleteTarget" @update:open="(v) => !v && (deleteTarget = null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette note ?</AlertDialogTitle>
          <AlertDialogDescription>
            La note de {{ deleteTarget?.student.first_name }} {{ deleteTarget?.student.last_name }} en
            {{ subjectLabel }} ne sera plus affichée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="deleteTarget = null">Annuler</AlertDialogCancel>
          <AlertDialogAction variant="destructive" :disabled="deleteMutation.isPending.value" @click="confirmDelete">
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
