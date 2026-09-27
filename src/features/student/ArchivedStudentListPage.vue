<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'
import { ArrowLeftIcon, ChevronLeftIcon, ChevronRightIcon } from '@lucide/vue'
import { Badge } from '@/design-system/ui/badge'
import { Input } from '@/design-system/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/design-system/ui/pagination'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select'
import { TableRowsSkeleton } from '@/design-system/ui/skeleton'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { LEVELS, useContextStore, type Level } from '@/features/academic-year'
import { formatAcademicYear, formatNumber } from '@/shared/utils/format'
import { useArchivedStudentsQuery } from './student.queries'
import { ACADEMIC_STATUS_VARIANTS, STUDENT_STATE_LABELS, type ArchivedStudentFilters } from './student.types'

const context = useContextStore()

const columns = ['N°', 'Étudiant', 'Dernier niveau', 'Année', 'Situation']

const search = reactive({ name: '', level: 'all' as Level | 'all' })
const page = ref(1)
watch(search, () => (page.value = 1))

// Le back n'est appelé qu'après 300 ms sans changement (frappe, niveau ou page).
const filters = refDebounced(
  computed<ArchivedStudentFilters>(() => ({ ...search, page: page.value })),
  300,
)

const { data, isPending, isPlaceholderData } = useArchivedStudentsQuery(filters)
const students = computed(() => data.value?.data ?? [])
const meta = computed(() => data.value?.meta)
</script>

<template>
  <RouterLink
    :to="{ name: 'students' }"
    class="mb-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground no-underline hover:text-foreground"
  >
    <ArrowLeftIcon class="size-3.5" /> Étudiants — {{ context.level }}
  </RouterLink>

  <div class="mb-4 flex flex-wrap items-baseline gap-3">
    <h1 class="font-heading text-2xl font-extrabold">Étudiants archivés</h1>
    <span v-if="meta" class="text-[13px] font-bold text-muted-foreground tabular-nums">
      {{ formatNumber(meta.total) }} étudiant{{ meta.total > 1 ? 's' : '' }}
    </span>
  </div>

  <div class="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
    <Input v-model="search.name" type="search" placeholder="Rechercher par nom ou prénom…" aria-label="Nom ou prénom" />
    <Select v-model="search.level">
      <SelectTrigger class="w-full" aria-label="Dernier niveau"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="all">Dernier niveau : tous</SelectItem>
          <SelectItem v-for="l in LEVELS" :key="l.value" :value="l.value">Dernier niveau : {{ l.value }}</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>

  <Table>
    <TableHeader>
      <TableRow>
        <TableHead v-for="col in columns" :key="col" class="h-9.5 text-[11px] tracking-wider">{{ col }}</TableHead>
      </TableRow>
    </TableHeader>
    <!-- Les anciennes lignes restent affichées, estompées, pendant le chargement de la suivante. -->
    <TableBody :class="{ 'opacity-45': isPlaceholderData }" class="transition-opacity">
      <TableRowsSkeleton
        v-if="isPending"
        :rows="5"
        :columns="5"
        :cell-class="['h-4 w-10', 'h-4 w-40', 'h-4 w-8', 'h-4 w-20', 'h-5 w-26']"
      />
      <template v-else>
        <TableEmpty v-if="students.length === 0" :colspan="5">
          <p class="text-center text-sm font-bold">Aucun étudiant archivé trouvé.</p>
          <p class="text-center text-sm font-semibold text-muted-foreground">
            Vérifiez l'orthographe ou repassez sur « Dernier niveau : tous ».
          </p>
        </TableEmpty>
        <!-- Lignes non cliquables : la fiche et le bulletin renvoient 404 pour un archivé. -->
        <TableRow v-for="s in students" :key="s.id" class="border-b border-foreground/12 hover:bg-primary/5">
          <TableCell class="w-px py-2.25 font-semibold text-muted-foreground">{{ s.id }}</TableCell>
          <TableCell class="py-2.25"
            ><span class="font-bold">{{ s.last_name }}</span> {{ s.first_name }}</TableCell
          >
          <TableCell class="py-2.25 font-bold">{{ s.class }}</TableCell>
          <TableCell class="py-2.25">{{ formatAcademicYear(s.class_year) }}</TableCell>
          <TableCell class="py-2.25">
            <Badge :variant="ACADEMIC_STATUS_VARIANTS[s.state]">{{ STUDENT_STATE_LABELS[s.state] }}</Badge>
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>

  <div v-if="meta && meta.total > 0" class="mt-4 flex flex-wrap items-center justify-between gap-3">
    <span class="text-[13px] font-semibold text-muted-foreground tabular-nums">
      <b class="text-foreground">{{ formatNumber(meta.from ?? 0) }}–{{ formatNumber(meta.to ?? 0) }}</b>
      sur {{ formatNumber(meta.total) }}
    </span>
    <Pagination
      v-if="meta.last_page > 1"
      v-model:page="page"
      :total="meta.total"
      :items-per-page="meta.per_page"
      :sibling-count="1"
      show-edges
      class="mx-0 w-auto"
    >
      <PaginationContent v-slot="{ items }" class="gap-1.5">
        <PaginationPrevious aria-label="Page précédente"><ChevronLeftIcon /></PaginationPrevious>
        <template v-for="(item, index) in items" :key="index">
          <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">
            {{ item.value }}
          </PaginationItem>
          <PaginationEllipsis v-else :index="index" />
        </template>
        <PaginationNext aria-label="Page suivante"><ChevronRightIcon /></PaginationNext>
      </PaginationContent>
    </Pagination>
  </div>
</template>
