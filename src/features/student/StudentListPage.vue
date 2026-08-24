<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/design-system/ui/alert-dialog'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Empty, EmptyDescription, EmptyTitle } from '@/design-system/ui/empty'
import { Input } from '@/design-system/ui/input'
import { Pagination, PaginationContent, PaginationItem } from '@/design-system/ui/pagination'
import { Spinner } from '@/design-system/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { useContextStore } from '@/features/academic-year'
import { toApiError } from '@/shared/api/errors'
import { formatDate } from '@/shared/utils/format'
import {
  useCreateStudentMutation,
  useDeleteStudentMutation,
  useStudentsQuery,
  useUpdateStudentMutation,
} from './student.queries'
import StudentFormModal from './StudentFormModal.vue'
import type { Student, StudentFormValues } from './student.types'

const router = useRouter()
const context = useContextStore()

const PAGE_SIZE = 10
const search = ref('')
const page = ref(1)
const errorMessage = ref<string | null>(null)
watch(search, () => (page.value = 1))

const { data, isPending } = useStudentsQuery()

const filtered = computed(() => {
  const term = search.value.toLowerCase().trim()
  const list = data.value ?? []
  if (!term) return list
  return list.filter((s) => `${s.first_name} ${s.last_name ?? ''} ${s.id}`.toLowerCase().includes(term))
})
const total = computed(() => filtered.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
const students = computed(() => filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE))

const createMutation = useCreateStudentMutation()
const updateMutation = useUpdateStudentMutation()
const deleteMutation = useDeleteStudentMutation()

function registeredTone(registered: boolean) {
  return registered ? 'success' : 'warning'
}

const emptyForm: StudentFormValues = {
  first_name: '',
  last_name: '',
  sex: 'M',
  birthday: '',
  birthplace: '',
  address: '',
  phone: '',
}
const modalOpen = ref(false)
const modalTitle = ref('')
const editingId = ref<number | null>(null)
const editingRegistered = ref(true)
const formValues = ref<StudentFormValues>({ ...emptyForm })

function openNew() {
  editingId.value = null
  modalTitle.value = 'Nouvel étudiant (L1)'
  formValues.value = { ...emptyForm }
  modalOpen.value = true
}

function openEdit(s: Student) {
  editingId.value = s.id
  modalTitle.value = "Modifier l'étudiant"
  editingRegistered.value = s.registered
  formValues.value = {
    first_name: s.first_name,
    last_name: s.last_name ?? '',
    sex: s.sex,
    // <input type="date"> attend YYYY-MM-DD ; l'API renvoie un datetime ISO complet.
    birthday: s.birthday.slice(0, 10),
    birthplace: s.birthplace ?? '',
    address: s.address ?? '',
    phone: s.phone ?? '',
  }
  modalOpen.value = true
}

async function save(values: StudentFormValues, registered: boolean) {
  errorMessage.value = null
  try {
    if (editingId.value) {
      await updateMutation.mutateAsync({ id: editingId.value, payload: { ...values, registered } })
    } else {
      await createMutation.mutateAsync(values)
    }
  } catch (e) {
    errorMessage.value = toApiError(e).message
    return
  }
  modalOpen.value = false
}

const deleteTarget = ref<Student | null>(null)
// AlertDialogAction closes the dialog (nulling deleteTarget via @update:open) in the
// same click before this handler runs, so the id to delete is captured separately.
let deleteTargetId: number | null = null

function askDelete(s: Student) {
  deleteTarget.value = s
  deleteTargetId = s.id
}

async function confirmDelete() {
  if (deleteTargetId === null) return
  const id = deleteTargetId
  deleteTargetId = null
  errorMessage.value = null
  try {
    await deleteMutation.mutateAsync(id)
  } catch (e) {
    errorMessage.value = toApiError(e).message
    return
  }
  deleteTarget.value = null
}

function openTranscript(s: Student) {
  router.push({ name: 'transcript', params: { studentId: String(s.id) } })
}
</script>

<template>
  <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
    <h1 class="font-heading text-2xl font-extrabold">Étudiants — {{ context.level }}</h1>
    <Button @click="openNew">+ Nouvel étudiant</Button>
  </div>

  <Input v-model="search" placeholder="Rechercher un étudiant (nom, prénom)…" class="mb-4.5" />

  <div v-if="errorMessage" class="mb-4 border-2 border-destructive bg-destructive/10 p-3 text-sm font-semibold text-destructive">
    {{ errorMessage }}
  </div>

  <Spinner v-if="isPending && !data" class="mx-auto mt-12 size-8" />
  <template v-else>
    <Empty v-if="students.length === 0">
      <EmptyTitle>Aucun étudiant trouvé</EmptyTitle>
      <EmptyDescription>Essayez une autre recherche ou ajoutez un nouvel étudiant.</EmptyDescription>
    </Empty>
    <template v-else>
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
          <TableRow v-for="s in students" :key="s.id" class="cursor-pointer" @click="openTranscript(s)">
            <TableCell class="font-bold">{{ s.id }}</TableCell>
            <TableCell class="underline">{{ s.last_name }}</TableCell>
            <TableCell>{{ s.first_name }}</TableCell>
            <TableCell>{{ formatDate(s.birthday) }}</TableCell>
            <TableCell>
              <Badge :variant="registeredTone(s.registered)">
                {{ s.registered ? 'Inscrit' : 'Non inscrit' }}
              </Badge>
            </TableCell>
            <TableCell class="text-right" @click.stop>
              <div class="flex justify-end gap-1.5">
                <Button emphasis="compact" size="sm" @click="openEdit(s)">Éditer</Button>
                <Button variant="destructive" emphasis="compact" size="sm" @click="askDelete(s)">
                  Suppr.
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Pagination v-if="totalPages > 1" v-model:page="page" :total="total" :items-per-page="PAGE_SIZE" class="mt-4.5">
        <PaginationContent>
          <PaginationItem v-for="p in pageNumbers" :key="p" :value="p" :is-active="p === page">
            {{ p }}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </template>
  </template>

  <StudentFormModal
    v-model:open="modalOpen"
    :title="modalTitle"
    :initial-values="formValues"
    :editing="editingId !== null"
    :initial-registered="editingRegistered"
    :saving="createMutation.isPending.value || updateMutation.isPending.value"
    @save="save"
  />

  <AlertDialog :open="!!deleteTarget" @update:open="(v) => !v && (deleteTarget = null)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Supprimer cet étudiant ?</AlertDialogTitle>
        <AlertDialogDescription>
          {{ deleteTarget?.first_name }} {{ deleteTarget?.last_name }} sera définitivement
          supprimé(e). Cette action est irréversible.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="deleteTarget = null">Annuler</AlertDialogCancel>
        <AlertDialogAction variant="destructive" :disabled="deleteMutation.isPending.value" @click="confirmDelete">
          Supprimer
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
