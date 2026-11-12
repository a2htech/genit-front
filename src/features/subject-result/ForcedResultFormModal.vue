<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CheckIcon, ChevronDownIcon } from '@lucide/vue'
import { Alert } from '@/design-system/ui/alert'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/design-system/ui/field'
import { Skeleton } from '@/design-system/ui/skeleton'
import type { Level } from '@/features/academic-year'
import { studentFullName, useStudentsQuery, type Student } from '@/features/student'
import { useTeachingUnitsQuery, type Subject } from '@/features/teaching-unit'
import { apiErrorMessage } from '@/shared/api/errors'
import { useForceFailMutation } from './subject-result.queries'

const props = defineProps<{ debtLevel: Level }>()
const open = defineModel<boolean>('open', { required: true })

const { data: students, isPending: studentsPending } = useStudentsQuery()
const { data: teachingUnits, isPending: unitsPending } = useTeachingUnitsQuery(() => props.debtLevel)

const sortedStudents = computed(() =>
  [...(students.value ?? [])].sort((a, b) =>
    `${a.last_name ?? ''} ${a.first_name}`.localeCompare(`${b.last_name ?? ''} ${b.first_name}`, 'fr'),
  ),
)
const units = computed(() =>
  [...(teachingUnits.value ?? [])].sort((a, b) => a.semester - b.semester || a.code.localeCompare(b.code)),
)

const student = ref<Student | null>(null)
const subject = ref<Subject | null>(null)
const errorMessage = ref<string | null>(null)

watch(open, (isOpen) => {
  if (!isOpen) return
  student.value = null
  subject.value = null
  errorMessage.value = null
})

const mutation = useForceFailMutation()

async function save() {
  if (!student.value || !subject.value) return
  errorMessage.value = null
  try {
    await mutation.mutateAsync({ studentId: student.value.id, subjectId: subject.value.id })
  } catch (e) {
    errorMessage.value = apiErrorMessage(e)
    return
  }
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Forcer un échec</DialogTitle>
        <DialogDescription>
          La matière de {{ debtLevel }} est enregistrée non acquise l'an passé : l'étudiant la doit cette année.
        </DialogDescription>
      </DialogHeader>

      <Alert v-if="errorMessage" variant="destructive">{{ errorMessage }}</Alert>

      <FieldGroup>
        <Field>
          <FieldLabel>Étudiant</FieldLabel>
          <Skeleton v-if="studentsPending" class="h-9 w-full" />
          <Combobox
            v-else
            :model-value="student"
            by="id"
            @update:model-value="(v) => (student = (v as Student | null) ?? null)"
          >
            <ComboboxAnchor as-child>
              <ComboboxTrigger as-child>
                <Button
                  variant="outline"
                  emphasis="compact"
                  role="combobox"
                  class="w-full justify-between gap-2 bg-card"
                >
                  {{ student ? studentFullName(student) : 'Sélectionner un étudiant' }}
                  <ChevronDownIcon class="size-4 shrink-0 opacity-50" aria-hidden="true" />
                </Button>
              </ComboboxTrigger>
            </ComboboxAnchor>
            <ComboboxList align="start" class="w-75">
              <ComboboxInput placeholder="Nom de l'étudiant…" />
              <ComboboxViewport>
                <ComboboxEmpty>Aucun étudiant trouvé.</ComboboxEmpty>
                <ComboboxItem v-for="s in sortedStudents" :key="s.id" :value="s">
                  {{ studentFullName(s) }}
                  <ComboboxItemIndicator><CheckIcon /></ComboboxItemIndicator>
                </ComboboxItem>
              </ComboboxViewport>
            </ComboboxList>
          </Combobox>
        </Field>

        <Field>
          <FieldLabel>Matière de {{ debtLevel }}</FieldLabel>
          <Skeleton v-if="unitsPending" class="h-9 w-full" />
          <Combobox
            v-else
            :model-value="subject"
            by="id"
            @update:model-value="(v) => (subject = (v as Subject | null) ?? null)"
          >
            <ComboboxAnchor as-child>
              <ComboboxTrigger as-child>
                <Button
                  variant="outline"
                  emphasis="compact"
                  role="combobox"
                  class="w-full justify-between gap-2 bg-card"
                >
                  {{ subject?.name ?? 'Sélectionner une matière' }}
                  <ChevronDownIcon class="size-4 shrink-0 opacity-50" aria-hidden="true" />
                </Button>
              </ComboboxTrigger>
            </ComboboxAnchor>
            <ComboboxList align="start" class="w-75">
              <ComboboxInput placeholder="Rechercher une matière…" />
              <ComboboxViewport>
                <ComboboxEmpty>Aucune matière trouvée.</ComboboxEmpty>
                <ComboboxGroup v-for="unit in units" :key="unit.id" :heading="`${unit.code} — ${unit.name}`">
                  <ComboboxItem v-for="s in unit.subjects" :key="s.id" :value="s">
                    {{ s.name }}
                    <ComboboxItemIndicator><CheckIcon /></ComboboxItemIndicator>
                  </ComboboxItem>
                </ComboboxGroup>
              </ComboboxViewport>
            </ComboboxList>
          </Combobox>
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button variant="secondary" emphasis="compact" @click="open = false">Annuler</Button>
        <Button :disabled="!student || !subject || mutation.isPending.value" @click="save">Forcer l'échec</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
