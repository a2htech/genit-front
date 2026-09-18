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
import { Toggle } from '@/design-system/ui/toggle'
import { apiErrorMessage } from '@/shared/api/errors'
import { useCreateStudentMutation, useUpdateStudentMutation } from './student.queries'
import { SEX_LABELS, type Student, type StudentFormValues, type Sex } from './student.types'

/** `student` null = création (toujours en L1) ; sinon édition de cet étudiant. */
const props = defineProps<{ student: Student | null }>()
const open = defineModel<boolean>('open', { required: true })

const sexOptions = (Object.keys(SEX_LABELS) as Sex[]).map((value) => ({ value, label: SEX_LABELS[value] }))

const emptyForm: StudentFormValues = {
  first_name: '',
  last_name: '',
  sex: 'M',
  birthday: '',
  birthplace: '',
  address: '',
  phone: '',
}

function toFormValues(s: Student): StudentFormValues {
  return {
    first_name: s.first_name,
    last_name: s.last_name ?? '',
    sex: s.sex,
    // <input type="date"> attend YYYY-MM-DD ; l'API renvoie un datetime ISO complet.
    birthday: s.birthday.slice(0, 10),
    birthplace: s.birthplace ?? '',
    address: s.address ?? '',
    phone: s.phone ?? '',
  }
}

const form = reactive<StudentFormValues>({ ...emptyForm })
const registered = ref(true)
const errorMessage = ref<string | null>(null)

const editing = computed(() => props.student !== null)
const title = computed(() => (editing.value ? "Modifier l'étudiant" : 'Nouvel étudiant (L1)'))

watch(
  open,
  (isOpen) => {
    if (!isOpen) return
    errorMessage.value = null
    Object.assign(form, props.student ? toFormValues(props.student) : emptyForm)
    registered.value = props.student?.registered ?? true
  },
  { immediate: true },
)

const createMutation = useCreateStudentMutation()
const updateMutation = useUpdateStudentMutation()
const saving = computed(() => createMutation.isPending.value || updateMutation.isPending.value)

async function save() {
  errorMessage.value = null
  try {
    if (props.student) {
      // `phone` est `required` (pas `sometimes`) côté back : le payload part toujours complet.
      await updateMutation.mutateAsync({
        id: props.student.id,
        payload: { ...form, registered: registered.value },
      })
    } else {
      await createMutation.mutateAsync({ ...form })
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
        <DialogDescription class="sr-only">Formulaire étudiant</DialogDescription>
      </DialogHeader>

      <Alert v-if="errorMessage" variant="destructive">{{ errorMessage }}</Alert>

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
        <Button variant="secondary" emphasis="compact" @click="open = false">Annuler</Button>
        <Button :disabled="saving" @click="save">Enregistrer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
