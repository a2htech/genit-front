<script setup lang="ts">
import { reactive, watch } from 'vue'
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
import type { SubjectFormValues } from './teaching-unit.types'

const props = defineProps<{
  open: boolean
  title: string
  initialValues: SubjectFormValues
  unitOptions: { value: number; label: string }[]
  saving?: boolean
}>()

const emit = defineEmits<{ save: [values: SubjectFormValues]; 'update:open': [open: boolean] }>()

const form = reactive<SubjectFormValues>({ ...props.initialValues })
watch(
  () => props.initialValues,
  (v) => Object.assign(form, v),
)

function submit() {
  emit('save', { ...form, credit: Number(form.credit), hourly_vol: Number(form.hourly_vol) })
}
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription class="sr-only">Formulaire matière</DialogDescription>
      </DialogHeader>

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
                <SelectItem v-for="opt in unitOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button variant="secondary" emphasis="compact" @click="emit('update:open', false)">
          Annuler
        </Button>
        <Button :disabled="saving" @click="submit">Enregistrer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
