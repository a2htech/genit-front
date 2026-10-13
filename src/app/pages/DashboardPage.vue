<script setup lang="ts">
import { computed } from 'vue'
import {
  AlertTriangleIcon,
  ClipboardCheckIcon,
  HourglassIcon,
  InfoIcon,
  LayersIcon,
  NotebookTextIcon,
  RotateCcwIcon,
  TrendingUpIcon,
  UsersIcon,
} from '@lucide/vue'
import { Alert, AlertDescription, AlertTitle } from '@/design-system/ui/alert'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Card } from '@/design-system/ui/card'
import { BarChart, StackedBar } from '@/design-system/ui/chart'
import { Skeleton, StatCardSkeleton } from '@/design-system/ui/skeleton'
import { StatTile } from '@/design-system/ui/stat-tile'
import { LEVELS } from '@/features/academic-year'
import { usePermissions } from '@/features/auth'
import { isFullDashboard, useDashboardQuery } from '@/features/dashboard'
import { ACADEMIC_STATUS_CODES, ACADEMIC_STATUS_LABELS, ACADEMIC_STATUS_VARIANTS } from '@/features/student'
import { formatNumber } from '@/shared/utils/format'

const { data, isPending } = useDashboardQuery()
const { can, hasAccess } = usePermissions()

const full = computed(() => (data.value && isFullDashboard(data.value) ? data.value : null))

const averageScore = computed(() => full.value?.scores.averageScore ?? null)

const studentsByClass = computed(() =>
  LEVELS.map((level) => ({ label: level.value, value: data.value?.students.byClass[level.value] ?? 0 })),
)

const statusSegments = computed(() => {
  const byStatus = full.value?.annualResults.byStatus
  if (!byStatus) return []
  return ACADEMIC_STATUS_CODES.map((code) => ({
    key: code,
    label: ACADEMIC_STATUS_LABELS[code],
    value: byStatus[code] ?? 0,
    variant: ACADEMIC_STATUS_VARIANTS[code],
  }))
})
</script>

<template>
  <div>
    <div class="mb-7 flex flex-wrap items-center justify-center gap-2.5">
      <h1 class="text-center font-heading text-2xl font-extrabold">Tableau de bord</h1>
      <Badge v-if="data?.academicYear" variant="outline">Année {{ data.academicYear.year }}</Badge>
    </div>

    <Alert v-if="!hasAccess" class="mb-6">
      <InfoIcon aria-hidden="true" />
      <AlertTitle>Votre compte n'a pas encore d'accès</AlertTitle>
      <AlertDescription>
        Les compteurs ci-dessous sont publics. Pour saisir des notes ou consulter les dossiers, demandez à
        l'administration de vous attribuer un rôle.
      </AlertDescription>
    </Alert>

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

    <template v-if="full">
      <div class="mb-6 grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-5">
        <StatTile label="Notes saisies" :value="formatNumber(full.scores.totalEntered)" :icon="ClipboardCheckIcon" />
        <StatTile
          label="Moyenne générale"
          :value="averageScore === null ? '—' : `${averageScore.toFixed(1)}/20`"
          :icon="TrendingUpIcon"
          :progress="averageScore === null ? undefined : (averageScore / 20) * 100"
        />
        <StatTile
          label="Taux de redoublement"
          :value="`${Math.round(full.scores.retakeRate * 100)}%`"
          :icon="RotateCcwIcon"
          :progress="full.scores.retakeRate * 100"
        />
        <StatTile
          label="Résultats en attente"
          :value="formatNumber(full.annualResults.pending)"
          :icon="HourglassIcon"
          :variant="full.annualResults.pending > 0 ? 'warning' : 'default'"
          :hint="full.annualResults.pending > 0 ? 'à calculer' : 'à jour'"
        />
        <StatTile
          label="Cumuls expirés"
          :value="formatNumber(full.annualResults.expiredCumul)"
          :icon="AlertTriangleIcon"
          variant="warning"
          :hint="full.annualResults.expiredCumul > 0 ? 'à régulariser' : undefined"
        />
      </div>

      <Card class="mb-7 px-5">
        <div class="mb-4">
          <div class="font-heading text-lg font-extrabold">Résultats annuels par statut</div>
          <div class="text-sm text-muted-foreground">
            {{ formatNumber(full.annualResults.calculated) }} résultats calculés.
          </div>
        </div>
        <StackedBar :segments="statusSegments" />
      </Card>
    </template>

    <div class="flex flex-wrap gap-3.5">
      <Button v-if="can('scores.manage-own')" variant="secondary" as-child>
        <RouterLink :to="{ name: 'scores' }">Saisir des notes</RouterLink>
      </Button>
      <Button v-if="can('students.view')" variant="secondary" as-child>
        <RouterLink :to="{ name: 'students' }">Gérer les étudiants</RouterLink>
      </Button>
      <Button v-if="can('results.view')" variant="secondary" as-child>
        <RouterLink :to="{ name: 'decisions' }">Voir les résultats</RouterLink>
      </Button>
    </div>
  </div>
</template>
