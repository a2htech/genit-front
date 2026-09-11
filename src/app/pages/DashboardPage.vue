<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  AlertTriangleIcon,
  ClipboardCheckIcon,
  HourglassIcon,
  LayersIcon,
  NotebookTextIcon,
  RotateCcwIcon,
  TrendingUpIcon,
  UsersIcon,
} from '@lucide/vue'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Card } from '@/design-system/ui/card'
import { BarChart, StackedBar } from '@/design-system/ui/chart'
import { Skeleton, StatCardSkeleton } from '@/design-system/ui/skeleton'
import { StatTile } from '@/design-system/ui/stat-tile'
import { LEVELS } from '@/features/academic-year'
import { isAdminDashboard, useDashboardQuery } from '@/features/dashboard'
import { ACADEMIC_STATUS_LABELS, type AcademicStatusCode } from '@/features/student'
import type { BadgeVariants } from '@/design-system/ui/badge'

const router = useRouter()
const { data, isPending } = useDashboardQuery()

const admin = computed(() => (data.value && isAdminDashboard(data.value) ? data.value : null))

const studentsByClass = computed(() =>
  LEVELS.map((level) => ({ label: level.value, value: data.value?.students.byClass[level.value] ?? 0 })),
)

const STATUS_ORDER: AcademicStatusCode[] = ['P', 'C', 'R', 'T']
const STATUS_VARIANT: Record<AcademicStatusCode, BadgeVariants['variant']> = {
  P: 'success',
  C: 'warning',
  R: 'destructive',
  T: 'accent',
}

const statusSegments = computed(() => {
  const byStatus = admin.value?.annualResults.byStatus
  if (!byStatus) return []
  return STATUS_ORDER.map((code) => ({
    key: code,
    label: ACADEMIC_STATUS_LABELS[code],
    value: byStatus[code] ?? 0,
    variant: STATUS_VARIANT[code],
  }))
})

function formatNumber(value: number): string {
  return value.toLocaleString('fr-FR')
}
</script>

<template>
  <div>
    <div class="mb-7 flex flex-wrap items-center justify-center gap-2.5">
      <h1 class="text-center font-heading text-2xl font-extrabold">Tableau de bord</h1>
      <Badge v-if="data" variant="outline">Année {{ data.academicYear.year }}</Badge>
    </div>

    <div class="mb-6 grid grid-cols-1 gap-4.5 sm:grid-cols-3">
      <template v-if="isPending">
        <StatCardSkeleton label="Étudiants" />
        <StatCardSkeleton label="Unités d'enseignement" />
        <StatCardSkeleton label="Matières" />
      </template>
      <template v-else-if="data">
        <StatTile label="Étudiants" :value="formatNumber(data.students.total)" :icon="UsersIcon" />
        <StatTile label="Unités d'enseignement" :value="formatNumber(data.catalog.teachingUnits)" :icon="LayersIcon" />
        <StatTile label="Matières" :value="formatNumber(data.catalog.subjects)" :icon="NotebookTextIcon" />
      </template>
    </div>

    <Card class="mb-6 px-5">
      <div class="mb-4">
        <div class="font-heading text-lg font-extrabold">Étudiants par niveau</div>
        <div class="text-sm text-muted-foreground">Répartition des effectifs sur l'année en cours.</div>
      </div>
      <Skeleton v-if="isPending" class="h-31 w-full" />
      <BarChart v-else :data="studentsByClass" />
    </Card>

    <template v-if="admin">
      <div class="mb-6 grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Notes saisies" :value="formatNumber(admin.scores.totalEntered)" :icon="ClipboardCheckIcon" />
        <StatTile
          label="Moyenne générale"
          :value="`${admin.scores.averageScore.toFixed(1)}/20`"
          :icon="TrendingUpIcon"
          :progress="(admin.scores.averageScore / 20) * 100"
        />
        <StatTile
          label="Taux de redoublement"
          :value="`${Math.round(admin.scores.retakeRate * 100)}%`"
          :icon="RotateCcwIcon"
          :progress="admin.scores.retakeRate * 100"
        />
        <StatTile
          label="Résultats en attente"
          :value="formatNumber(admin.annualResults.pending)"
          :icon="HourglassIcon"
          :variant="admin.annualResults.pending > 0 ? 'warning' : 'default'"
          :hint="admin.annualResults.pending > 0 ? 'à calculer' : 'à jour'"
        />
        <StatTile
          label="Cumuls expirés"
          :value="formatNumber(admin.annualResults.expiredCumul)"
          :icon="AlertTriangleIcon"
          variant="warning"
          :hint="admin.annualResults.expiredCumul > 0 ? 'à régulariser' : undefined"
        />
      </div>

      <Card class="mb-7 px-5">
        <div class="mb-4">
          <div class="font-heading text-lg font-extrabold">Résultats annuels par statut</div>
          <div class="text-sm text-muted-foreground">
            {{ formatNumber(admin.annualResults.calculated) }} résultats calculés.
          </div>
        </div>
        <StackedBar :segments="statusSegments" />
      </Card>
    </template>

    <div class="flex flex-wrap gap-3.5">
      <Button variant="secondary" @click="router.push({ name: 'scores' })">Saisir des notes</Button>
      <Button variant="secondary" @click="router.push({ name: 'students' })">Gérer les étudiants</Button>
      <Button variant="secondary" @click="router.push({ name: 'decisions' })">Voir les résultats</Button>
    </div>
  </div>
</template>
