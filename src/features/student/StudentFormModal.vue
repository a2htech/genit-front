<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
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
import { Toggle } from '@/design-system/ui/toggle'
import type { StudentFormValues, Sex } from './student.types'

const props = defineProps<{
  open: boolean
  title: string
  initialValues: StudentFormValues
  editing: boolean
  initialRegistered: boolean
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [values: StudentFormValues, registered: boolean]
  'update:open': [open: boolean]
}>()

const sexOptions: { value: Sex; label: string }[] = [
  { value: 'M', label: 'Masculin' },
  { value: 'F', label: 'Féminin' },
]

const form = reactive<StudentFormValues>({ ...props.initialValues })
const registered = ref(props.initialRegistered)
watch(
  () => props.initialValues,
  (v) => Object.assign(form, v),
)
watch(
  () => props.initialRegistered,
  (v) => (registered.value = v),
)
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription class="sr-only">Formulaire étudiant</DialogDescription>
      </DialogHeader>

      <FieldGroup>
        <Field>
          <FieldLabel>Nom</FieldLabel>
          <Input v-model="form.last_name" />
        </Field>
        <Field>
          <FieldLabel>Prénom</FieldLabel>
          <Input v-model="form.first_name" />
        </Field>
        <Field>
          <FieldLabel>Sexe</FieldLabel>
          <Select v-model="form.sex">
            <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="o in sexOptions" :key="o.value" :value="o.value">
                  {{ o.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Date de naissance</FieldLabel>
          <Input v-model="form.birthday" type="date" />
        </Field>
        <Field>
          <FieldLabel>Lieu de naissance</FieldLabel>
          <Input v-model="form.birthplace" />
        </Field>
        <Field>
          <FieldLabel>Adresse</FieldLabel>
          <Input v-model="form.address" />
        </Field>
        <Field>
          <FieldLabel>Téléphone</FieldLabel>
          <Input v-model="form.phone" />
        </Field>
        <Field v-if="editing">
          <FieldLabel>Inscription</FieldLabel>
          <Toggle :model-value="registered" @update:model-value="(v) => (registered = !!v)">
            {{ registered ? 'Inscrit' : 'Non inscrit' }}
          </Toggle>
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button variant="secondary" emphasis="compact" @click="emit('update:open', false)">
          Annuler
        </Button>
        <Button :disabled="saving" @click="emit('save', { ...form }, registered)">Enregistrer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
