<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowRightIcon, Trash2Icon } from '@lucide/vue'
import { Alert } from '@/design-system/ui/alert'
import { Button } from '@/design-system/ui/button'
import { ConfirmDialog } from '@/design-system/ui/confirm-dialog'
import { Empty, EmptyDescription, EmptyTitle } from '@/design-system/ui/empty'
import { TableRowsSkeleton } from '@/design-system/ui/skeleton'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { useContextStore } from '@/features/academic-year'
import { studentFullName } from '@/features/student'
import { apiErrorMessage } from '@/shared/api/errors'
import { formatAcademicYear } from '@/shared/utils/format'
import ForcedResultFormModal from './ForcedResultFormModal.vue'
import { useDeleteForcedResultMutation, useForcedResultsQuery } from './subject-result.queries'
import { DEBT_LEVELS, type ForcedSubjectResult } from './subject-result.types'

const context = useContextStore()
const debtLevel = computed(() => DEBT_LEVELS[context.level!] ?? null)

const steps = computed(() => [
  { title: `Note de ${debtLevel.value} introuvable`, text: 'Sans résultat, la dette est invisible.' },
  { title: 'Échec forcé', text: "L'étudiant la doit et peut la repasser." },
  { title: `Note saisie en ${context.level}`, text: "Elle remplace l'échec forcé." },
])

const { data: results, isPending } = useForcedResultsQuery()
const formOpen = ref(false)

const deleteMutation = useDeleteForcedResultMutation()
const pendingDelete = ref<ForcedSubjectResult | null>(null)
const errorMessage = ref<string | null>(null)

const deleteDescription = computed(() =>
  pendingDelete.value
    ? `${studentFullName(pendingDelete.value.student)} ne devra plus « ${pendingDelete.value.subject.name} ».`
    : '',
)

async function confirmDelete() {
  if (!pendingDelete.value) return
  errorMessage.value = null
  try {
    await deleteMutation.mutateAsync(pendingDelete.value.id)
  } catch (e) {
    errorMessage.value = apiErrorMessage(e)
  }
  pendingDelete.value = null
}
</script>

<template>
  <div>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-heading text-2xl font-extrabold">Résultats forcés</h1>
      <Button v-if="debtLevel" @click="formOpen = true">+ Forcer un échec</Button>
    </div>

    <Empty v-if="!debtLevel" class="mt-5 border-2 border-border bg-card">
      <EmptyTitle>Aucune dette possible en {{ context.level }}</EmptyTitle>
      <EmptyDescription>
        Seuls les étudiants de L2, L3 et M2 doivent des matières du niveau en dessous. Changez de niveau dans l'en-tête.
      </EmptyDescription>
    </Empty>

    <template v-else>
      <div class="mb-5 flex flex-col border-2 border-border bg-card shadow-brutal-md md:flex-row">
        <div
          class="flex items-center justify-center gap-3 border-b-2 border-border bg-background px-5 py-3.5 md:border-r-2 md:border-b-0"
        >
          <div class="flex flex-col items-center gap-1">
            <span class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Matière</span>
            <span class="border-2 border-border bg-card px-2.5 py-0.5 font-heading text-lg font-extrabold">
              {{ debtLevel }}
            </span>
          </div>
          <ArrowRightIcon class="mt-4 size-5 stroke-[2.5]" aria-hidden="true" />
          <div class="flex flex-col items-center gap-1">
            <span class="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Étudiant</span>
            <span class="border-2 border-border bg-accent px-2.5 py-0.5 font-heading text-lg font-extrabold">
              {{ context.level }}
            </span>
          </div>
        </div>
        <ol class="grid flex-1 md:grid-cols-3">
          <li
            v-for="(step, i) in steps"
            :key="step.title"
            class="flex gap-2.5 border-border/15 px-4.5 py-3.5 not-last:border-b md:not-last:border-r md:not-last:border-b-0"
          >
            <span
              class="flex size-5.5 shrink-0 items-center justify-center border-2 border-border bg-warning font-heading text-xs font-extrabold"
            >
              {{ i + 1 }}
            </span>
            <div>
              <div class="text-[13px] font-bold">{{ step.title }}</div>
              <div class="mt-0.5 text-xs font-medium text-muted-foreground">{{ step.text }}</div>
            </div>
          </li>
        </ol>
      </div>

      <Alert v-if="errorMessage" variant="destructive" class="mb-4">{{ errorMessage }}</Alert>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Étudiant</TableHead>
            <TableHead>Matière</TableHead>
            <TableHead>Année de l'échec</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRowsSkeleton
            v-if="isPending && !results"
            :rows="3"
            :columns="4"
            :cell-class="['h-4 w-40', 'h-4 w-48', 'h-4 w-20', 'ml-auto h-4 w-24']"
          />
          <template v-else>
            <TableEmpty v-if="!results?.length" :colspan="4">
              <div class="text-center text-sm font-semibold text-muted-foreground">
                Aucun échec forcé en {{ context.level }} — forcez-en un quand la note d'une matière de
                {{ debtLevel }} due est introuvable.
              </div>
            </TableEmpty>
            <TableRow v-for="r in results" :key="r.id">
              <TableCell>
                <span class="font-bold">{{ r.student.last_name }}</span> {{ r.student.first_name }}
              </TableCell>
              <TableCell>{{ r.subject.name }}</TableCell>
              <TableCell>{{ formatAcademicYear(r.class_year) }}</TableCell>
              <TableCell class="text-right">
                <!-- aria-label repris du libellé visible : le nom accessible doit le contenir (WCAG Label in Name). -->
                <Button
                  variant="outline"
                  emphasis="compact"
                  size="sm"
                  :aria-label="`Supprimer l'échec forcé de ${studentFullName(r.student)}`"
                  @click="pendingDelete = r"
                >
                  <Trash2Icon class="size-3.5" aria-hidden="true" />
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>

      <ForcedResultFormModal v-model:open="formOpen" :debt-level="debtLevel" />
    </template>

    <ConfirmDialog
      :open="pendingDelete !== null"
      title="Supprimer l'échec forcé ?"
      :description="deleteDescription"
      confirm-label="Supprimer"
      destructive
      :pending="deleteMutation.isPending.value"
      @update:open="pendingDelete = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
