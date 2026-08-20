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
import type { MatiereFormValues } from './teaching-unit.types'

const props = defineProps<{
  open: boolean
  title: string
  initialValues: MatiereFormValues
  ueOptions: { value: string; label: string }[]
  saving?: boolean
}>()

const emit = defineEmits<{ save: [values: MatiereFormValues]; 'update:open': [open: boolean] }>()

const form = reactive<MatiereFormValues>({ ...props.initialValues })
watch(
  () => props.initialValues,
  (v) => Object.assign(form, v),
)

function submit() {
  emit('save', { ...form, coefficient: Number(form.coefficient) })
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
          <FieldLabel>Code</FieldLabel>
          <Input v-model="form.code" />
        </Field>
        <Field>
          <FieldLabel>Intitulé</FieldLabel>
          <Input v-model="form.intitule" />
        </Field>
        <Field>
          <FieldLabel>Coefficient</FieldLabel>
          <Input v-model="form.coefficient" type="number" :min="1" />
        </Field>
        <Field>
          <FieldLabel>UE de rattachement</FieldLabel>
          <Select v-model="form.ueId">
            <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="opt in ueOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Enseignant</FieldLabel>
          <Input v-model="form.enseignant" />
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
