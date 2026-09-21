<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Alert } from '@/design-system/ui/alert'
import { Button } from '@/design-system/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/design-system/ui/field'
import { Input } from '@/design-system/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select'
import { apiErrorMessage } from '@/shared/api/errors'
import { useCreateSubjectMutation, useUpdateSubjectMutation } from './teaching-unit.queries'
import type { Subject, SubjectFormValues, TeachingUnit } from './teaching-unit.types'

/** `subject` null = création dans l'UE `teachingUnitId` ; sinon édition de cette matière. */
const props = defineProps<{
  subject: Subject | null
  teachingUnitId: number
  units: TeachingUnit[]
}>()
const open = defineModel<boolean>('open', { required: true })

const emptyForm: SubjectFormValues = { name: '', credit: 1, hourly_vol: 1, teaching_unit_id: 0 }
const form = reactive<SubjectFormValues>({ ...emptyForm })
const errorMessage = ref<string | null>(null)

const title = computed(() => (props.subject ? 'Modifier la matière' : 'Nouvelle matière'))

watch(open, (isOpen) => {
  if (!isOpen) return
  errorMessage.value = null
  const s = props.subject
  Object.assign(
    form,
    s
      ? { name: s.name, credit: s.credit, hourly_vol: s.hourly_vol, teaching_unit_id: s.teaching_unit_id }
      : { ...emptyForm, teaching_unit_id: props.teachingUnitId },
  )
})

const createMutation = useCreateSubjectMutation()
const updateMutation = useUpdateSubjectMutation()
const saving = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

async function save() {
  errorMessage.value = null
  // Un <input type="number"> renvoie une chaîne.
  const payload = { ...form, credit: Number(form.credit), hourly_vol: Number(form.hourly_vol) }
  try {
    if (props.subject) {
      await updateMutation.mutateAsync({ id: props.subject.id, payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
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
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription class="sr-only">Formulaire matière</DialogDescription>
      </DialogHeader>

      <Alert v-if="errorMessage" variant="destructive">{{ errorMessage }}</Alert>

      <FieldGroup>
        <Field>
          <FieldLabel>Intitulé</FieldLabel>
          <Input v-model="form.name" />
        </Field>
        <Field>
          <FieldLabel>Crédits</FieldLabel>
          <Input v-model="form.credit" type="number" :min="1" />
        </Field>
        <Field>
          <FieldLabel>Volume horaire</FieldLabel>
          <Input v-model="form.hourly_vol" type="number" :min="1" />
        </Field>
        <Field>
          <FieldLabel>UE de rattachement</FieldLabel>
          <Select :model-value="form.teaching_unit_id" @update:model-value="(v) => (form.teaching_unit_id = Number(v))">
            <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="unit in units" :key="unit.id" :value="unit.id">
                  {{ unit.code }} — {{ unit.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button variant="secondary" emphasis="compact" @click="open = false">Annuler</Button>
        <Button :disabled="saving" @click="save">Enregistrer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
