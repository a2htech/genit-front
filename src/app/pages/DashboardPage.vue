<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/design-system/ui/button'
import { Card } from '@/design-system/ui/card'
import { Progress } from '@/design-system/ui/progress'
import { Spinner } from '@/design-system/ui/spinner'
import { useContextStore } from '@/features/academic-year'
import { useEtudiantsCountQuery } from '@/features/student'
import { useMatieresQuery, useUnitesEnseignementQuery } from '@/features/teaching-unit'
import { useSaisieProgressQuery } from '@/features/score'

const router = useRouter()
const context = useContextStore()

const { data: nbStudents, isPending: studentsPending } = useEtudiantsCountQuery()
const { data: ues, isPending: uesPending } = useUnitesEnseignementQuery()
const { data: matieres, isPending: matieresPending } = useMatieresQuery()
const { data: progress, isPending: progressPending } = useSaisieProgressQuery()

const isPending = computed(
  () => studentsPending.value || uesPending.value || matieresPending.value || progressPending.value,
)

const pct = computed(() => {
  if (!progress.value || progress.value.total === 0) return 0
  return Math.round((progress.value.filled / progress.value.total) * 100)
})
</script>

<template>
  <Spinner v-if="isPending" class="mx-auto mt-32 size-8" />
  <div v-else>
    <h1 class="font-heading mb-5 text-center text-2xl font-extrabold">
      Tableau de bord — {{ context.niveau }} · {{ context.anneeLibelle }}
    </h1>

    <div class="mb-7 grid grid-cols-1 gap-4.5 sm:grid-cols-3">
      <Card class="px-5">
        <div class="text-xs font-bold tracking-wide text-muted-foreground uppercase">Étudiants</div>
        <div class="font-heading mt-1.5 text-4xl font-extrabold">{{ nbStudents }}</div>
      </Card>
      <Card class="px-5">
        <div class="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Unités d'enseignement
        </div>
        <div class="font-heading mt-1.5 text-4xl font-extrabold">{{ ues?.length ?? 0 }}</div>
      </Card>
      <Card class="px-5">
        <div class="text-xs font-bold tracking-wide text-muted-foreground uppercase">Matières</div>
        <div class="font-heading mt-1.5 text-4xl font-extrabold">{{ matieres?.length ?? 0 }}</div>
      </Card>
    </div>

    <Card class="mb-7 px-6">
      <div class="mb-3.5 flex items-baseline justify-between">
        <div class="font-heading text-base font-extrabold">Taux de saisie des notes</div>
        <div class="text-sm font-bold">{{ progress?.filled }} / {{ progress?.total }} saisies</div>
      </div>
      <div class="flex items-stretch gap-3.5">
        <Progress :model-value="pct" class="h-9 flex-1" />
        <div
          class="font-heading flex min-w-19 items-center justify-center bg-primary text-lg font-extrabold text-primary-foreground"
        >
          {{ pct }}%
        </div>
      </div>
    </Card>

    <div class="flex flex-wrap gap-3.5">
      <Button variant="secondary" @click="router.push({ name: 'scores' })">Saisir des notes</Button>
      <Button variant="secondary" @click="router.push({ name: 'students' })">Gérer les étudiants</Button>
      <Button variant="secondary" @click="router.push({ name: 'decisions' })">Voir les résultats</Button>
    </div>
  </div>
</template>
