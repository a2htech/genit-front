<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArchiveIcon,
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
  IdCardIcon,
  XIcon,
} from '@lucide/vue'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Input } from '@/design-system/ui/input'
import { Pagination, PaginationContent, PaginationItem } from '@/design-system/ui/pagination'
import { TableRowsSkeleton } from '@/design-system/ui/skeleton'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { useContextStore } from '@/features/academic-year'
import { useAuthStore } from '@/features/auth'
import { formatDate } from '@/shared/utils/format'
import { useFilteredStudents } from './student.queries'
import StudentFormModal from './StudentFormModal.vue'
import {
  ACADEMIC_STATUS_VARIANTS,
  DEFAULT_STUDENT_SORT,
  STUDENT_STATE_LABELS,
  studentFullName,
  type Student,
  type StudentSort,
  type StudentSortKey,
} from './student.types'

const router = useRouter()
const context = useContextStore()
const auth = useAuthStore()

const PAGE_SIZE = 10
const search = ref('')
const page = ref(1)
watch(search, () => (page.value = 1))

const sort = ref<StudentSort>({ ...DEFAULT_STUDENT_SORT })
watch(sort, () => (page.value = 1))

const columns: { key: StudentSortKey; label: string }[] = [
  { key: 'id', label: '#' },
  { key: 'name', label: 'Étudiant' },
  { key: 'birthday', label: 'Naissance' },
  { key: 'state', label: 'Situation' },
  { key: 'registered', label: 'Inscrit' },
]

function toggleSort(key: StudentSortKey) {
  const dir = sort.value.key === key && sort.value.dir === 'asc' ? 'desc' : 'asc'
  sort.value = { key, dir }
}

function sortIcon(key: StudentSortKey) {
  if (sort.value.key !== key) return ChevronsUpDownIcon
  return sort.value.dir === 'asc' ? ChevronUpIcon : ChevronDownIcon
}

function ariaSort(key: StudentSortKey) {
  if (sort.value.key !== key) return 'none'
  return sort.value.dir === 'asc' ? 'ascending' : 'descending'
}

const { data, isPending, filtered } = useFilteredStudents(search, sort)
const total = computed(() => filtered.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
const students = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

// La liste navigue et crée ; éditer et supprimer vivent sur la fiche, au vu de qui est visé.
const formOpen = ref(false)

// Le bulletin reprend la recherche pour parcourir les étudiants dans l'ordre de ce tableau.
function openTranscript(s: Student) {
  const term = search.value.trim()
  router.push({
    name: 'transcript',
    params: { studentId: String(s.id) },
    query: { ...(term ? { search: term } : {}), sort: sort.value.key, dir: sort.value.dir },
  })
}

function openDetail(s: Student) {
  router.push({ name: 'student-detail', params: { studentId: String(s.id) } })
}
</script>

<template>
  <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
    <h1 class="font-heading text-2xl font-extrabold">Étudiants — {{ context.level }}</h1>
    <Button @click="formOpen = true">+ Nouvel étudiant</Button>
  </div>

  <Input v-model="search" placeholder="Rechercher un étudiant (nom, prénom)…" class="mb-4.5" />

  <Table>
    <TableHeader>
      <TableRow>
        <TableHead v-for="col in columns" :key="col.key" :aria-sort="ariaSort(col.key)" class="p-0">
          <button
            type="button"
            class="flex h-11 w-full cursor-pointer items-center gap-1.5 px-3.5 text-left uppercase transition-colors hover:bg-foreground/15 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none focus-visible:ring-inset"
            @click="toggleSort(col.key)"
          >
            {{ col.label }}
            <component :is="sortIcon(col.key)" class="size-3.5 shrink-0" aria-hidden="true" />
          </button>
        </TableHead>
        <TableHead class="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRowsSkeleton
        v-if="isPending && !data"
        :rows="5"
        :columns="6"
        :cell-class="['h-4 w-6', 'h-4 w-40', 'h-4 w-20', 'h-5 w-26', 'h-4 w-5', 'ml-auto h-4 w-24']"
      />
      <template v-else>
        <TableEmpty v-if="students.length === 0" :colspan="6">
          <div class="text-center text-sm font-semibold text-muted-foreground">
            Aucun étudiant trouvé — essayez une autre recherche ou ajoutez un nouvel étudiant.
          </div>
        </TableEmpty>
        <TableRow v-for="s in students" :key="s.id" interactive @click="openTranscript(s)">
          <TableCell class="font-bold">{{ s.id }}</TableCell>
          <TableCell>
            <span class="underline"
              ><span class="font-bold">{{ s.last_name }}</span> {{ s.first_name }}</span
            >
          </TableCell>
          <TableCell>{{ formatDate(s.birthday) }}</TableCell>
          <TableCell>
            <Badge :variant="ACADEMIC_STATUS_VARIANTS[s.state]">{{ STUDENT_STATE_LABELS[s.state] }}</Badge>
          </TableCell>
          <TableCell>
            <!-- Icône plutôt qu'un badge : le non-inscrit doit sauter aux yeux sans concurrencer le badge Situation. -->
            <span class="sr-only">{{ s.registered ? 'Inscrit' : 'Non inscrit' }}</span>
            <CheckIcon v-if="s.registered" class="size-5 stroke-3 text-success" aria-hidden="true" />
            <XIcon v-else class="size-5 stroke-3 text-destructive" aria-hidden="true" />
          </TableCell>
          <TableCell class="text-right" @click.stop>
            <!-- aria-label repris du libellé visible : le nom accessible doit le contenir (WCAG Label in Name). -->
            <Button
              variant="outline"
              emphasis="compact"
              size="sm"
              :aria-label="`Infos de ${studentFullName(s)}`"
              @click="openDetail(s)"
            >
              <IdCardIcon class="size-3.5" aria-hidden="true" />
              Infos
            </Button>
          </TableCell>
        </TableRow>
      </template>
    </TableBody>
  </Table>

  <Pagination v-if="totalPages > 1" v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" class="mt-4.5">
    <PaginationContent>
      <PaginationItem v-for="p in pageNumbers" :key="p" :value="p" :is-active="p === page">
        {{ p }}
      </PaginationItem>
    </PaginationContent>
  </Pagination>

  <div v-if="auth.isAdmin" class="mt-4.5 flex justify-end">
    <RouterLink
      :to="{ name: 'archived-students' }"
      class="inline-flex items-center gap-1.5 py-1.5 text-sm font-bold text-foreground underline decoration-2 underline-offset-3 hover:decoration-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <ArchiveIcon class="size-4 stroke-[2.5]" aria-hidden="true" />
      Voir les étudiants archivés
      <ArrowRightIcon class="size-3.5 stroke-[2.5]" aria-hidden="true" />
    </RouterLink>
  </div>

  <StudentFormModal v-model:open="formOpen" :student="null" />
</template>
