<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from '@lucide/vue'
import { Alert } from '@/design-system/ui/alert'
import { Badge } from '@/design-system/ui/badge'
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
import { ConfirmDialog } from '@/design-system/ui/confirm-dialog'
import { Skeleton } from '@/design-system/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { useContextStore } from '@/features/academic-year'
import { apiErrorMessage } from '@/shared/api/errors'
import { useDeleteSubjectMutation, useTeachingUnitsQuery, useUpdateSubjectMutation } from './teaching-unit.queries'
import SubjectFormModal from './SubjectFormModal.vue'
import { semestersForLevel, type Subject } from './teaching-unit.types'

const context = useContextStore()
// Le contexte (niveau) est garanti par le router guard avant d'atteindre cette page.
const semesterOptions = computed(() => semestersForLevel(context.level!))
const semester = ref<number>(semesterOptions.value[0])
const errorMessage = ref<string | null>(null)

// Les semestres valides changent avec le niveau ; sans ça, `semester` garde une valeur qui n'existe plus.
watch(
  () => context.level,
  () => (semester.value = semesterOptions.value[0]),
)

const { data: teachingUnits, isPending } = useTeachingUnitsQuery()
const updateMutation = useUpdateSubjectMutation()
const deleteMutation = useDeleteSubjectMutation()

const unitsForSemester = computed(() => (teachingUnits.value ?? []).filter((u) => u.semester === semester.value))
const allSubjects = computed(() => (teachingUnits.value ?? []).flatMap((u) => u.subjects))

const expandedUnit = reactive<Record<number, boolean>>({})

function availableFor(unitId: number): Subject[] {
  return allSubjects.value.filter((s) => s.teaching_unit_id !== unitId)
}

function attach(unitId: number, subject: Subject | null) {
  if (!subject) return
  errorMessage.value = null
  updateMutation.mutate(
    { id: subject.id, payload: { teaching_unit_id: unitId } },
    { onError: (e) => (errorMessage.value = apiErrorMessage(e)) },
  )
}

const formOpen = ref(false)
const formSubject = ref<Subject | null>(null)
const formUnitId = ref(0)

function openSubjectForm(unitId: number, subject: Subject | null) {
  formUnitId.value = unitId
  formSubject.value = subject
  formOpen.value = true
}

const deleteTarget = ref<Subject | null>(null)

async function confirmDelete() {
  if (!deleteTarget.value) return
  errorMessage.value = null
  try {
    await deleteMutation.mutateAsync(deleteTarget.value.id)
  } catch (e) {
    errorMessage.value = apiErrorMessage(e)
  }
  deleteTarget.value = null
}
</script>

<template>
  <div>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-heading text-2xl font-extrabold">
        Unités d'enseignement — {{ context.level }} · Semestre {{ semester }}
      </h1>
      <ToggleGroup v-model="semester" type="single" variant="outline">
        <ToggleGroupItem v-for="s in semesterOptions" :key="s" :value="s">Semestre {{ s }}</ToggleGroupItem>
      </ToggleGroup>
    </div>

    <Alert v-if="errorMessage" variant="destructive" class="mb-4">{{ errorMessage }}</Alert>

    <template v-if="isPending">
      <div
        v-for="i in 3"
        :key="i"
        class="mb-4.5 flex items-center gap-4 border-2 border-border bg-card px-5 py-4.5 shadow-brutal-md"
      >
        <Skeleton class="size-5" />
        <Skeleton class="h-4 w-27.5" />
        <Skeleton class="h-4 flex-1" />
        <Skeleton class="h-4 w-32.5" />
      </div>
    </template>

    <template v-else>
      <div
        v-for="unit in unitsForSemester"
        :key="unit.id"
        class="mb-4.5 border-2 border-border bg-card shadow-brutal-md"
      >
        <div
          class="flex cursor-pointer items-center gap-4 px-5 py-4.5"
          @click="expandedUnit[unit.id] = !expandedUnit[unit.id]"
        >
          <component :is="expandedUnit[unit.id] ? ChevronDownIcon : ChevronRightIcon" class="size-5 shrink-0" />
          <div class="w-27.5 font-heading text-sm font-extrabold">{{ unit.code }}</div>
          <div class="flex-1 text-[15px] font-semibold">{{ unit.name }}</div>
          <div class="w-32.5 text-right text-sm font-semibold text-muted-foreground">
            {{ unit.subjects.length }} matière{{ unit.subjects.length > 1 ? 's' : '' }}
          </div>
        </div>

        <div v-if="expandedUnit[unit.id]" class="border-t-2 border-border bg-muted px-5 py-4.5 pl-14">
          <div
            v-for="subject in unit.subjects"
            :key="subject.id"
            class="flex items-center gap-3 border-b border-border/30 py-2.5 last:border-b-0"
          >
            <div class="h-5.5 w-1 bg-foreground" />
            <div class="flex-1 text-sm">{{ subject.name }}</div>
            <Badge variant="accent">{{ subject.credit }} crédits</Badge>
            <div class="w-28 text-xs text-muted-foreground">{{ subject.hourly_vol }}h</div>
            <div class="flex gap-1.5">
              <Button emphasis="compact" size="sm" @click="openSubjectForm(unit.id, subject)">Éditer</Button>
              <Button variant="destructive" emphasis="compact" size="sm" @click="deleteTarget = subject">Suppr.</Button>
            </div>
          </div>
          <div v-if="unit.subjects.length === 0" class="py-2.5 text-sm text-muted-foreground">
            Aucune matière rattachée.
          </div>

          <div class="mt-3.5 flex flex-wrap items-center gap-2.5">
            <Combobox
              v-if="availableFor(unit.id).length > 0"
              :model-value="null"
              by="id"
              @update:model-value="(v) => attach(unit.id, v as Subject | null)"
            >
              <ComboboxAnchor as-child>
                <ComboboxTrigger as-child>
                  <Button
                    variant="outline"
                    emphasis="compact"
                    size="sm"
                    role="combobox"
                    class="justify-between gap-2 bg-card"
                  >
                    + Rattacher une matière existante…
                    <ChevronDownIcon class="size-4 shrink-0 opacity-50" />
                  </Button>
                </ComboboxTrigger>
              </ComboboxAnchor>
              <ComboboxList align="start" class="w-72">
                <ComboboxInput placeholder="Rechercher une matière…" />
                <ComboboxViewport>
                  <ComboboxEmpty>Aucune matière trouvée.</ComboboxEmpty>
                  <ComboboxGroup>
                    <ComboboxItem v-for="subject in availableFor(unit.id)" :key="subject.id" :value="subject">
                      {{ subject.name }}
                      <ComboboxItemIndicator><CheckIcon /></ComboboxItemIndicator>
                    </ComboboxItem>
                  </ComboboxGroup>
                </ComboboxViewport>
              </ComboboxList>
            </Combobox>
            <Button emphasis="compact" size="sm" @click="openSubjectForm(unit.id, null)">+ Nouvelle matière</Button>
          </div>
        </div>
      </div>
    </template>

    <SubjectFormModal
      v-model:open="formOpen"
      :subject="formSubject"
      :teaching-unit-id="formUnitId"
      :units="unitsForSemester"
    />

    <ConfirmDialog
      :open="deleteTarget !== null"
      title="Supprimer cette matière ?"
      :description="`${deleteTarget?.name ?? ''} sera définitivement supprimée.`"
      confirm-label="Supprimer"
      destructive
      :pending="deleteMutation.isPending.value"
      @update:open="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
