<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { IdCardIcon } from '@lucide/vue'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Input } from '@/design-system/ui/input'
import { Pagination, PaginationContent, PaginationItem } from '@/design-system/ui/pagination'
import { TableRowsSkeleton } from '@/design-system/ui/skeleton'
import { Table, TableBody, TableCell, TableEmpty, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { useContextStore } from '@/features/academic-year'
import { formatDate } from '@/shared/utils/format'
import { useFilteredStudents } from './student.queries'
import StudentFormModal from './StudentFormModal.vue'
import { studentFullName, type Student } from './student.types'

const router = useRouter()
const context = useContextStore()

const PAGE_SIZE = 10
const search = ref('')
const page = ref(1)
watch(search, () => (page.value = 1))

const { data, isPending, filtered } = useFilteredStudents(search)
const total = computed(() => filtered.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
const students = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

// La liste navigue et crée ; éditer et supprimer vivent sur la fiche, au vu de qui est visé.
const formOpen = ref(false)

// Le bulletin reprend la recherche pour parcourir les étudiants dans l'ordre de ce tableau.
function openTranscript(s: Student) {
  const term = search.value.trim()
  router.push({ name: 'transcript', params: { studentId: String(s.id) }, query: term ? { search: term } : {} })
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
        <TableHead>#</TableHead>
        <TableHead>Nom</TableHead>
        <TableHead>Prénom</TableHead>
        <TableHead>Naissance</TableHead>
        <TableHead>Statut</TableHead>
        <TableHead class="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRowsSkeleton
        v-if="isPending && !data"
        :rows="5"
        :columns="6"
        :cell-class="['h-4 w-6', 'h-4 w-28', 'h-4 w-24', 'h-4 w-20', 'h-5 w-18', 'ml-auto h-4 w-24']"
      />
      <template v-else>
        <TableEmpty v-if="students.length === 0" :colspan="6">
          <div class="text-center text-sm font-semibold text-muted-foreground">
            Aucun étudiant trouvé — essayez une autre recherche ou ajoutez un nouvel étudiant.
          </div>
        </TableEmpty>
        <TableRow v-for="s in students" :key="s.id" interactive @click="openTranscript(s)">
          <TableCell class="font-bold">{{ s.id }}</TableCell>
          <TableCell class="underline">{{ s.last_name }}</TableCell>
          <TableCell>{{ s.first_name }}</TableCell>
          <TableCell>{{ formatDate(s.birthday) }}</TableCell>
          <TableCell>
            <Badge :variant="s.registered ? 'success' : 'warning'">
              {{ s.registered ? 'Inscrit' : 'Non inscrit' }}
            </Badge>
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

  <StudentFormModal v-model:open="formOpen" :student="null" />
</template>
