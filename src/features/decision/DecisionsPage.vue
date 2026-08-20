<script setup lang="ts">
import { computed, ref } from 'vue'
import { Badge } from '@/design-system/ui/badge'
import { Empty, EmptyTitle } from '@/design-system/ui/empty'
import { Spinner } from '@/design-system/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { useContextStore } from '@/features/academic-year'
import { useResultatsQuery } from './decision.queries'
import type { DecisionCode } from './decision.types'

const context = useContextStore()
const { data, isPending } = useResultatsQuery()

const filter = ref<DecisionCode | 'all'>('all')
const filterDefs: { key: DecisionCode | 'all'; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'admis', label: 'Admis' },
  { key: 'dettes', label: 'Avec dettes' },
  { key: 'redouble', label: 'Redoublants' },
]

const rows = computed(
  () => data.value?.rows.filter((r) => filter.value === 'all' || r.decisionCode === filter.value) ?? [],
)

function decisionTone(code: DecisionCode) {
  if (code === 'admis') return 'success'
  if (code === 'dettes') return 'warning'
  if (code === 'redouble') return 'destructive'
  return 'outline'
}
</script>

<template>
  <Spinner v-if="isPending" class="mx-auto mt-32 size-8" />
  <div v-else-if="data">
    <h1 class="font-heading mb-5 text-2xl font-extrabold">
      Résultats — {{ context.niveau }} · {{ context.anneeLibelle }}
    </h1>

    <div class="mb-5.5 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="border-2 border-border bg-success p-4 text-success-foreground shadow-brutal-md">
        <div class="text-xs font-extrabold uppercase">Admis</div>
        <div class="font-heading text-3xl font-extrabold">{{ data.stats.admis }}</div>
      </div>
      <div class="border-2 border-border bg-warning p-4 text-warning-foreground shadow-brutal-md">
        <div class="text-xs font-extrabold uppercase">Admis avec dettes</div>
        <div class="font-heading text-3xl font-extrabold">{{ data.stats.dettes }}</div>
      </div>
      <div class="border-2 border-border bg-destructive p-4 text-destructive-foreground shadow-brutal-md">
        <div class="text-xs font-extrabold uppercase">Redoublants</div>
        <div class="font-heading text-3xl font-extrabold">{{ data.stats.redouble }}</div>
      </div>
    </div>

    <ToggleGroup v-model="filter" type="single" variant="outline" class="mb-4">
      <ToggleGroupItem v-for="f in filterDefs" :key="f.key" :value="f.key" size="sm">
        {{ f.label }}
      </ToggleGroupItem>
    </ToggleGroup>

    <Empty v-if="rows.length === 0">
      <EmptyTitle>Aucun étudiant dans ce filtre</EmptyTitle>
    </Empty>
    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>Étudiant</TableHead>
          <TableHead>Décision</TableHead>
          <TableHead>Crédits acquis</TableHead>
          <TableHead>Dettes (niveaux antérieurs)</TableHead>
          <TableHead>Matières à repasser</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="r in rows" :key="r.etudiantId">
          <TableCell class="font-bold">{{ r.nomComplet }}</TableCell>
          <TableCell><Badge :variant="decisionTone(r.decisionCode)">{{ r.decisionLabel }}</Badge></TableCell>
          <TableCell>{{ r.ects }} / {{ data.creditsTotal }}</TableCell>
          <TableCell>
            <div class="flex flex-wrap gap-1.5">
              <Badge v-for="d in r.dettes" :key="d" variant="warning">{{ d }}</Badge>
              <span v-if="r.dettes.length === 0" class="text-xs opacity-50">—</span>
            </div>
          </TableCell>
          <TableCell>
            <div class="flex flex-wrap gap-1.5">
              <Badge v-for="m in r.matieresARepasser" :key="m" variant="destructive">{{ m }}</Badge>
              <span v-if="r.matieresARepasser.length === 0" class="text-xs opacity-50">—</span>
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
