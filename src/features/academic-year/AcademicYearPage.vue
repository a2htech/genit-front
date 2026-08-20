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
import { Empty, EmptyTitle } from '@/design-system/ui/empty'
import { Field, FieldLabel } from '@/design-system/ui/field'
import { Input } from '@/design-system/ui/input'
import { Spinner } from '@/design-system/ui/spinner'
import { useAnneesUniversitairesQuery, useBasculerAnneeMutation } from './academic-year.queries'
import { useContextStore } from './context.store'

const context = useContextStore()
const { data: annees, isPending } = useAnneesUniversitairesQuery()
const basculerMutation = useBasculerAnneeMutation()

const anneeActive = computed(() => annees.value?.find((a) => a.statut === 'active') ?? null)
const historique = computed(
  () => [...(annees.value?.filter((a) => a.statut === 'archivee') ?? [])].reverse(),
)

function nextAnneeLibelle(libelle: string): string {
  const [start, end] = libelle.split('-').map(Number)
  return `${(start ?? 0) + 1}-${(end ?? 0) + 1}`
}

const nextYearLabel = computed(() =>
  anneeActive.value ? nextAnneeLibelle(anneeActive.value.libelle) : '',
)

const basculeModalOpen = ref(false)
const basculeConfirmText = ref('')
const basculeConfirmValid = computed(() => basculeConfirmText.value === nextYearLabel.value)

function openBasculeConfirm() {
  basculeConfirmText.value = ''
  basculeModalOpen.value = true
}

async function confirmBascule() {
  if (!basculeConfirmValid.value) return
  const nouvelleAnnee = await basculerMutation.mutateAsync()
  context.setAnnee(Number(nouvelleAnnee.id))
  basculeModalOpen.value = false
}
</script>

<template>
  <Spinner v-if="isPending" class="mx-auto mt-32 size-8" />
  <div v-else>
    <h1 class="font-heading mb-5 text-2xl font-extrabold">Année universitaire</h1>

    <Card class="mb-6 flex-row flex-wrap items-center justify-between gap-4 px-5">
      <div>
        <div class="text-xs font-bold tracking-wide text-muted-foreground uppercase">Année active</div>
        <div class="font-heading text-2xl font-extrabold">{{ anneeActive?.libelle }}</div>
      </div>
      <Button variant="destructive" @click="openBasculeConfirm">
        Basculer vers l'année suivante
      </Button>
    </Card>

    <div class="font-heading mb-2.5 text-sm font-extrabold uppercase">Historique</div>
    <Empty v-if="historique.length === 0">
      <EmptyTitle>Aucune année archivée</EmptyTitle>
    </Empty>
    <div v-else class="border-2 border-border bg-card">
      <div
        v-for="a in historique"
        :key="a.id"
        class="flex justify-between border-b-2 border-border px-4.5 py-3.5 last:border-b-0"
      >
        <div class="text-sm font-bold">{{ a.libelle }}</div>
        <div class="text-xs font-semibold text-muted-foreground">Archivée</div>
      </div>
    </div>

    <Dialog v-model:open="basculeModalOpen">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Basculer vers {{ nextYearLabel }} ?</DialogTitle>
          <DialogDescription class="sr-only">
            Confirmer la bascule vers l'année universitaire suivante.
          </DialogDescription>
        </DialogHeader>

        <div class="border-2 border-border bg-muted p-3.5 text-sm leading-relaxed">
          Cette action va créer l'année <strong>{{ nextYearLabel }}</strong>, réinitialiser les
          inscriptions de niveau et archiver les notes de {{ anneeActive?.libelle }}.
          <strong>Cette action est irréversible.</strong>
        </div>

        <Field>
          <FieldLabel>Tapez « {{ nextYearLabel }} » pour confirmer</FieldLabel>
          <Input v-model="basculeConfirmText" />
        </Field>

        <DialogFooter>
          <Button variant="secondary" emphasis="compact" @click="basculeModalOpen = false">
            Annuler
          </Button>
          <Button
            variant="destructive"
            :disabled="!basculeConfirmValid || basculerMutation.isPending.value"
            @click="confirmBascule"
          >
            Confirmer la bascule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
