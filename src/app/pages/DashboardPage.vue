<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Button } from '@/design-system/ui/button'
import { Card } from '@/design-system/ui/card'
import { StatCardSkeleton } from '@/design-system/ui/skeleton'
import { useContextStore, useCurrentAcademicYearQuery } from '@/features/academic-year'
import { useStudentsQuery } from '@/features/student'
import { useSubjectsQuery, useTeachingUnitsQuery } from '@/features/teaching-unit'

const router = useRouter()
const context = useContextStore()

const { data: currentYear } = useCurrentAcademicYearQuery()
const { data: students, isPending: studentsPending } = useStudentsQuery()
const { data: teachingUnits, isPending: teachingUnitsPending } = useTeachingUnitsQuery()
const { data: subjects, isPending: subjectsPending } = useSubjectsQuery()
</script>

<template>
  <div>
    <h1 class="font-heading mb-5 text-center text-2xl font-extrabold">
      Tableau de bord — {{ context.level }} · {{ currentYear?.year }}
    </h1>

    <div class="mb-7 grid grid-cols-1 gap-4.5 sm:grid-cols-3">
      <StatCardSkeleton v-if="studentsPending" label="Étudiants" />
      <Card v-else class="px-5">
        <div class="text-xs font-bold tracking-wide text-muted-foreground uppercase">Étudiants</div>
        <div class="font-heading mt-1.5 text-4xl font-extrabold">{{ students?.length ?? 0 }}</div>
      </Card>

      <StatCardSkeleton v-if="teachingUnitsPending" label="Unités d'enseignement" />
      <Card v-else class="px-5">
        <div class="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Unités d'enseignement
        </div>
        <div class="font-heading mt-1.5 text-4xl font-extrabold">{{ teachingUnits?.length ?? 0 }}</div>
      </Card>

      <StatCardSkeleton v-if="subjectsPending" label="Matières" />
      <Card v-else class="px-5">
        <div class="text-xs font-bold tracking-wide text-muted-foreground uppercase">Matières</div>
        <div class="font-heading mt-1.5 text-4xl font-extrabold">{{ subjects?.length ?? 0 }}</div>
      </Card>
    </div>

    <div class="flex flex-wrap gap-3.5">
      <Button variant="secondary" @click="router.push({ name: 'scores' })">Saisir des notes</Button>
      <Button variant="secondary" @click="router.push({ name: 'students' })">Gérer les étudiants</Button>
      <Button variant="secondary" @click="router.push({ name: 'decisions' })">Voir les résultats</Button>
    </div>
  </div>
</template>
