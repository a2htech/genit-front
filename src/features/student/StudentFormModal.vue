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
import { NIVEAUX } from '@/features/academic-year'
import type { EtudiantFormValues, StatutEtudiant } from './student.types'

const props = defineProps<{
  open: boolean
  title: string
  initialValues: EtudiantFormValues
  saving?: boolean
}>()

const emit = defineEmits<{ save: [values: EtudiantFormValues]; 'update:open': [open: boolean] }>()

const statutOptions: { value: StatutEtudiant; label: string }[] = [
  { value: 'Inscrit', label: 'Inscrit' },
  { value: 'Non inscrit', label: 'Non inscrit' },
]

const form = reactive<EtudiantFormValues>({ ...props.initialValues })
watch(
  () => props.initialValues,
  (v) => Object.assign(form, v),
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
          <FieldLabel>Matricule</FieldLabel>
          <Input v-model="form.matricule" />
        </Field>
        <Field>
          <FieldLabel>Nom</FieldLabel>
          <Input v-model="form.nom" />
        </Field>
        <Field>
          <FieldLabel>Prénom</FieldLabel>
          <Input v-model="form.prenom" />
        </Field>
        <Field>
          <FieldLabel>Date de naissance</FieldLabel>
          <Input v-model="form.dateNaissance" placeholder="JJ/MM/AAAA" />
        </Field>
        <Field>
          <FieldLabel>Statut</FieldLabel>
          <Select v-model="form.statut">
            <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="o in statutOptions" :key="o.value" :value="o.value">
                  {{ o.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Niveau</FieldLabel>
          <Select v-model="form.niveau">
            <SelectTrigger class="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="n in NIVEAUX" :key="n.value" :value="n.value">
                  {{ n.value }} — {{ n.label }}
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
        <Button :disabled="saving" @click="emit('save', { ...form })">Enregistrer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
