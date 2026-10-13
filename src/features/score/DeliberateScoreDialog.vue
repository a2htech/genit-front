<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from 'vue'
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
import { Field, FieldDescription, FieldError, FieldLabel } from '@/design-system/ui/field'
import { Input } from '@/design-system/ui/input'
import { Skeleton } from '@/design-system/ui/skeleton'
import { apiErrorMessage } from '@/shared/api/errors'
import { formatScore } from '@/shared/utils/format'
import { useCurrentYearRetakeScoreQuery, useDeliberateScoreMutation } from './score.queries'
import { isDeliberated, type DeliberationTarget } from './score.types'

const props = defineProps<{ target: DeliberationTarget | null }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ deliberated: [] }>()

const { data: score, isPending, error: loadError } = useCurrentYearRetakeScoreQuery(toRef(props, 'target'))
const mutation = useDeliberateScoreMutation()

const draft = ref<string | number>('')
const errorMessage = ref<string | null>(null)

// Repart de la note enregistrée à chaque ouverture et à chaque chargement ; le champ n'existe
// qu'une fois la note chargée, l'autofocus du dialog l'a donc souvent manqué.
watch([open, () => score.value?.id], async () => {
  if (!open.value) return
  errorMessage.value = null
  draft.value = score.value && isDeliberated(score.value) ? (score.value.score ?? '') : ''
  await nextTick()
  document.getElementById('deliberated-score')?.focus()
})

const value = computed(() => (draft.value === '' ? null : Number(draft.value)))
const isOutOfRange = computed(
  () => value.value !== null && (!Number.isFinite(value.value) || value.value < 0 || value.value > 20),
)
const canSubmit = computed(
  () => value.value !== null && !isOutOfRange.value && value.value !== score.value?.score && !mutation.isPending.value,
)

async function deliberate(newScore: number) {
  if (!score.value) return
  errorMessage.value = null
  try {
    await mutation.mutateAsync({ id: score.value.id, score: newScore })
  } catch (e) {
    errorMessage.value = apiErrorMessage(e)
    return
  }
  emit('deliberated')
  open.value = false
}

function submit() {
  if (canSubmit.value) deliberate(value.value!)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Délibérer la note</DialogTitle>
        <DialogDescription>{{ target?.subjectName }} · session de rattrapage</DialogDescription>
      </DialogHeader>

      <Alert v-if="errorMessage" variant="destructive">{{ errorMessage }}</Alert>

      <div v-if="isPending" class="grid grid-cols-2 gap-4">
        <Skeleton class="h-18" />
        <Skeleton class="h-18" />
      </div>
      <Alert v-else-if="loadError" variant="destructive">{{ apiErrorMessage(loadError) }}</Alert>
      <Alert v-else-if="!score" variant="warning">
        Ce rattrapage date d'une année précédente : seules les notes de l'année en cours peuvent être délibérées.
      </Alert>
      <form v-else id="deliberate-score-form" novalidate class="grid gap-3" @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel for="original-score">Note obtenue</FieldLabel>
            <Input
              id="original-score"
              :model-value="formatScore(score.original)"
              readonly
              tabindex="-1"
              class="border-dashed text-center font-bold"
            />
          </Field>
          <Field>
            <FieldLabel for="deliberated-score">Note délibérée</FieldLabel>
            <Input
              id="deliberated-score"
              v-model="draft"
              type="number"
              :min="0"
              :max="20"
              :step="0.5"
              class="text-center font-bold"
              :aria-invalid="isOutOfRange"
              aria-describedby="deliberated-score-hint"
            />
          </Field>
        </div>
        <FieldError v-if="isOutOfRange">La note doit être comprise entre 0 et 20.</FieldError>
        <FieldDescription id="deliberated-score-hint">
          La note obtenue reste enregistrée et s'affiche barrée sur le bulletin.
        </FieldDescription>
        <Button
          v-if="isDeliberated(score)"
          type="button"
          variant="link"
          emphasis="compact"
          class="justify-self-start"
          :disabled="mutation.isPending.value"
          @click="deliberate(score.original!)"
        >
          Rétablir la note obtenue
        </Button>
      </form>

      <!-- Libellé fixe pendant l'envoi : un « Délibération… » plus long décalait le pied de la modale. -->
      <DialogFooter>
        <Button variant="secondary" emphasis="compact" @click="open = false">Annuler</Button>
        <Button v-if="score" type="submit" form="deliberate-score-form" :disabled="!canSubmit">Délibérer</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
