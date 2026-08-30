<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/design-system/ui/button'
import { Card } from '@/design-system/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/design-system/ui/dialog'
import { Field, FieldLabel } from '@/design-system/ui/field'
import { Input } from '@/design-system/ui/input'
import { Spinner } from '@/design-system/ui/spinner'
import { useCreateAcademicYearMutation, useCurrentAcademicYearQuery } from './academic-year.queries'

const { data: currentYear, isPending } = useCurrentAcademicYearQuery()
const createMutation = useCreateAcademicYearMutation()

const nextYear = computed(() => (currentYear.value ? currentYear.value.year + 1 : null))

const switchModalOpen = ref(false)
const switchConfirmText = ref('')
const switchConfirmValid = computed(() => switchConfirmText.value === String(nextYear.value))

function openSwitchConfirm() {
  switchConfirmText.value = ''
  switchModalOpen.value = true
}

async function confirmSwitch() {
  if (!switchConfirmValid.value || nextYear.value === null) return
  await createMutation.mutateAsync(nextYear.value)
  switchModalOpen.value = false
}
</script>

<template>
  <Spinner v-if="isPending" class="mx-auto mt-32 size-8" />
  <div v-else>
    <h1 class="font-heading mb-5 text-2xl font-extrabold">Année universitaire</h1>

    <Card class="mb-6 flex-row flex-wrap items-center justify-between gap-4 px-5">
      <div>
        <div class="text-xs font-bold tracking-wide text-muted-foreground uppercase">Année active</div>
        <div class="font-heading text-2xl font-extrabold">{{ currentYear?.year }}</div>
      </div>
      <Button variant="destructive" @click="openSwitchConfirm">
        Basculer vers l'année suivante
      </Button>
    </Card>

    <div class="border-2 border-border bg-muted p-3.5 text-sm leading-relaxed text-muted-foreground">
      L'historique des années archivées n'est pas encore disponible côté serveur.
    </div>

    <Dialog v-model:open="switchModalOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Basculer vers {{ nextYear }} ?</DialogTitle>
          <DialogDescription class="sr-only">
            Confirmer la bascule vers l'année universitaire suivante.
          </DialogDescription>
        </DialogHeader>

        <div class="border-2 border-border bg-muted p-3.5 text-sm leading-relaxed">
          Cette action va créer l'année <strong>{{ nextYear }}</strong> et la définir comme année
          courante pour tout le monde. <strong>Cette action est irréversible.</strong>
        </div>

        <Field>
          <FieldLabel>Tapez « {{ nextYear }} » pour confirmer</FieldLabel>
          <Input v-model="switchConfirmText" />
        </Field>

        <DialogFooter>
          <Button variant="secondary" emphasis="compact" @click="switchModalOpen = false">
            Annuler
          </Button>
          <Button
            variant="destructive"
            :disabled="!switchConfirmValid || createMutation.isPending.value"
            @click="confirmSwitch"
          >
            Confirmer la bascule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
