<script setup lang="ts">
import { ref, watch } from 'vue'
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
import { toApiError } from '@/shared/api/errors'
import { useDeleteStudentMutation } from './student.queries'
import type { Student } from './student.types'

const props = defineProps<{ student: Student | null }>()

const emit = defineEmits<{
  deleted: []
  'update:student': [student: Student | null]
}>()

const errorMessage = ref<string | null>(null)
const deleteMutation = useDeleteStudentMutation()

// AlertDialogAction ferme le dialog (nullifie `student`) dans le même clic, avant que
// confirmDelete ne tourne : l'étudiant visé est donc gardé hors du flux réactif.
let target: Student | null = null
watch(
  () => props.student,
  (s) => {
    if (s) target = s
  },
)

function dismiss() {
  errorMessage.value = null
  emit('update:student', null)
}

async function confirmDelete() {
  if (!target) return
  const student = target
  target = null
  try {
    await deleteMutation.mutateAsync(student.id)
  } catch (e) {
    errorMessage.value = toApiError(e).message
    emit('update:student', student) // rouvre le dialog, seul endroit où l'erreur est visible
    return
  }
  emit('deleted')
  emit('update:student', null)
}
</script>

<template>
  <AlertDialog :open="!!student" @update:open="(v) => !v && dismiss()">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Supprimer cet étudiant ?</AlertDialogTitle>
        <AlertDialogDescription>
          {{ student?.first_name }} {{ student?.last_name }} sera définitivement supprimé(e). Cette action est
          irréversible.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div
        v-if="errorMessage"
        class="border-2 border-destructive bg-destructive/10 p-3 text-sm font-semibold text-destructive"
      >
        {{ errorMessage }}
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel @click="dismiss">Annuler</AlertDialogCancel>
        <AlertDialogAction variant="destructive" :disabled="deleteMutation.isPending.value" @click="confirmDelete">
          Supprimer
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
