<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ChevronDownIcon, ChevronRightIcon } from '@lucide/vue'
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select'
import { Spinner } from '@/design-system/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { useContextStore } from '@/features/academic-year'
import { toApiError } from '@/shared/api/errors'
import {
  useCreateSubjectMutation,
  useDeleteSubjectMutation,
  useTeachingUnitsQuery,
  useUpdateSubjectMutation,
} from './teaching-unit.queries'
import SubjectFormModal from './SubjectFormModal.vue'
import { semestersForLevel, type Subject, type SubjectFormValues } from './teaching-unit.types'

const context = useContextStore()
// Le contexte (niveau) est garanti par le router guard avant d'atteindre cette page.
const semesterOptions = computed(() => semestersForLevel(context.level!))
const semester = ref<number>(semesterOptions.value[0])
const errorMessage = ref<string | null>(null)

const { data: teachingUnits, isPending } = useTeachingUnitsQuery()

const createMutation = useCreateSubjectMutation()
const updateMutation = useUpdateSubjectMutation()
const deleteMutation = useDeleteSubjectMutation()

const unitsForSemester = computed(() => (teachingUnits.value ?? []).filter((u) => u.semester === semester.value))
const allSubjects = computed(() => (teachingUnits.value ?? []).flatMap((u) => u.subjects))

const expandedUnit = reactive<Record<number, boolean>>({})
const attachValue = reactive<Record<number, string>>({})

function toggleExpand(unitId: number) {
  expandedUnit[unitId] = !expandedUnit[unitId]
}

function availableFor(unitId: number): Subject[] {
  return allSubjects.value.filter((s) => s.teaching_unit_id !== unitId)
}

function attach(unitId: number, subjectId: string) {
  if (!subjectId) return
  errorMessage.value = null
  updateMutation.mutate(
    { id: Number(subjectId), payload: { teaching_unit_id: unitId } },
    { onError: (e) => (errorMessage.value = toApiError(e).message) },
  )
  attachValue[unitId] = ''
}

const emptyForm: SubjectFormValues = { name: '', credit: 1, hourly_vol: 1, teaching_unit_id: 0 }
const modalOpen = ref(false)
const modalTitle = ref('')
const editingId = ref<number | null>(null)
const formValues = ref<SubjectFormValues>({ ...emptyForm })

function openNewSubject(unitId: number) {
  editingId.value = null
  modalTitle.value = 'Nouvelle matière'
  formValues.value = { ...emptyForm, teaching_unit_id: unitId }
  modalOpen.value = true
}

function openEditSubject(s: Subject) {
  editingId.value = s.id
  modalTitle.value = 'Modifier la matière'
  formValues.value = {
    name: s.name,
    credit: s.credit,
    hourly_vol: s.hourly_vol,
    teaching_unit_id: s.teaching_unit_id,
  }
  modalOpen.value = true
}

async function saveSubject(values: SubjectFormValues) {
  errorMessage.value = null
  try {
    if (editingId.value) {
      await updateMutation.mutateAsync({ id: editingId.value, payload: values })
    } else {
      await createMutation.mutateAsync(values)
    }
  } catch (e) {
    errorMessage.value = toApiError(e).message
    return
  }
  modalOpen.value = false
}

const deleteTarget = ref<Subject | null>(null)
// AlertDialogAction closes the dialog (nulling deleteTarget via @update:open) in the
// same click before this handler runs, so the id to delete is captured separately.
let deleteTargetId: number | null = null

function askDelete(s: Subject) {
  deleteTarget.value = s
  deleteTargetId = s.id
}

async function confirmDelete() {
  if (deleteTargetId === null) return
  const id = deleteTargetId
  deleteTargetId = null
  errorMessage.value = null
  try {
    await deleteMutation.mutateAsync(id)
  } catch (e) {
    errorMessage.value = toApiError(e).message
    return
  }
  deleteTarget.value = null
}
</script>

<template>
  <Spinner v-if="isPending" class="mx-auto mt-32 size-8" />
  <div v-else>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-heading text-2xl font-extrabold">
        Unités d'enseignement — {{ context.level }} · Semestre {{ semester }}
      </h1>
      <ToggleGroup v-model="semester" type="single" variant="outline">
        <ToggleGroupItem v-for="s in semesterOptions" :key="s" :value="s">Semestre {{ s }}</ToggleGroupItem>
      </ToggleGroup>
    </div>

    <div v-if="errorMessage" class="mb-4 border-2 border-destructive bg-destructive/10 p-3 text-sm font-semibold text-destructive">
      {{ errorMessage }}
    </div>

    <div v-for="unit in unitsForSemester" :key="unit.id" class="mb-4.5 border-2 border-border bg-card shadow-brutal-md">
      <div class="flex cursor-pointer items-center gap-4 px-5 py-4.5" @click="toggleExpand(unit.id)">
        <component :is="expandedUnit[unit.id] ? ChevronDownIcon : ChevronRightIcon" class="size-5 shrink-0" />
        <div class="font-heading w-27.5 text-sm font-extrabold">{{ unit.code }}</div>
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
            <Button emphasis="compact" size="sm" @click="openEditSubject(subject)">Éditer</Button>
            <Button variant="destructive" emphasis="compact" size="sm" @click="askDelete(subject)">Suppr.</Button>
          </div>
        </div>
        <div v-if="unit.subjects.length === 0" class="py-2.5 text-sm text-muted-foreground">
          Aucune matière rattachée.
        </div>

        <div class="mt-3.5 flex flex-wrap items-center gap-2.5">
          <Select
            v-if="availableFor(unit.id).length > 0"
            :model-value="attachValue[unit.id] || undefined"
            @update:model-value="(v) => v && attach(unit.id, String(v))"
          >
            <SelectTrigger size="sm"><SelectValue placeholder="+ Rattacher une matière existante…" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="subject in availableFor(unit.id)" :key="subject.id" :value="String(subject.id)">
                  {{ subject.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button emphasis="compact" size="sm" @click="openNewSubject(unit.id)">+ Nouvelle matière</Button>
        </div>
      </div>
    </div>

    <SubjectFormModal
      v-model:open="modalOpen"
      :title="modalTitle"
      :initial-values="formValues"
      :unit-options="unitsForSemester.map((u) => ({ value: u.id, label: `${u.code} — ${u.name}` }))"
      :saving="createMutation.isPending.value || updateMutation.isPending.value"
      @save="saveSubject"
    />

    <AlertDialog :open="!!deleteTarget" @update:open="(v) => !v && (deleteTarget = null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette matière ?</AlertDialogTitle>
          <AlertDialogDescription>{{ deleteTarget?.name }} sera définitivement supprimée.</AlertDialogDescription>
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
