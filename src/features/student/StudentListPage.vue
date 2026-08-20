<script setup lang="ts">
import { computed, ref } from 'vue'
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
import {
  useCreateEtudiantMutation,
  useDeleteEtudiantMutation,
  useEtudiantsQuery,
  useUpdateEtudiantMutation,
} from './student.queries'
import StudentFormModal from './StudentFormModal.vue'
import type { Etudiant, EtudiantFormValues } from './student.types'

const router = useRouter()
const context = useContextStore()

const search = ref('')
const page = ref(1)
function onSearchInput() {
  page.value = 1
}

const { data, isPending } = useEtudiantsQuery(search, page)
const etudiants = computed(() => data.value?.data ?? [])
const totalPages = computed(() =>
  data.value ? Math.max(1, Math.ceil(data.value.meta.total / data.value.meta.perPage)) : 1,
)
const pageNumbers = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))

const createMutation = useCreateEtudiantMutation()
const updateMutation = useUpdateEtudiantMutation()
const deleteMutation = useDeleteEtudiantMutation()

function statutTone(statut: Etudiant['statut']) {
  return statut === 'Inscrit' ? 'success' : 'warning'
}

const emptyForm: EtudiantFormValues = {
  matricule: '',
  nom: '',
  prenom: '',
  dateNaissance: '',
  statut: 'Inscrit',
  niveau: context.niveau ?? 'L1',
}
const modalOpen = ref(false)
const modalTitle = ref('')
const editingId = ref<string | null>(null)
const formValues = ref<EtudiantFormValues>({ ...emptyForm })

function openNew() {
  editingId.value = null
  modalTitle.value = 'Nouvel étudiant'
  formValues.value = { ...emptyForm, niveau: context.niveau ?? 'L1' }
  modalOpen.value = true
}

function openEdit(e: Etudiant) {
  editingId.value = e.id
  modalTitle.value = "Modifier l'étudiant"
  formValues.value = {
    matricule: e.matricule,
    nom: e.nom,
    prenom: e.prenom,
    dateNaissance: e.dateNaissance,
    statut: e.statut,
    niveau: e.niveau,
  }
  modalOpen.value = true
}

async function save(values: EtudiantFormValues) {
  if (editingId.value) {
    await updateMutation.mutateAsync({ id: editingId.value, payload: values })
  } else {
    await createMutation.mutateAsync(values)
  }
  modalOpen.value = false
}

const deleteTarget = ref<Etudiant | null>(null)

async function confirmDelete() {
  if (!deleteTarget.value) return
  await deleteMutation.mutateAsync(deleteTarget.value.id)
  deleteTarget.value = null
}

function openBulletin(e: Etudiant) {
  router.push({ name: 'transcript', params: { studentId: e.id } })
}
</script>

<template>
  <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
    <h1 class="font-heading text-2xl font-extrabold">Étudiants — {{ context.niveau }}</h1>
    <Button @click="openNew">+ Nouvel étudiant</Button>
  </div>

  <Input
    v-model="search"
    placeholder="Rechercher un étudiant (nom, prénom, matricule)…"
    class="mb-4.5"
    @input="onSearchInput"
  />

  <Spinner v-if="isPending && !data" class="mx-auto mt-12 size-8" />
  <template v-else>
    <Empty v-if="etudiants.length === 0">
      <EmptyTitle>Aucun étudiant trouvé</EmptyTitle>
      <EmptyDescription>Essayez une autre recherche ou ajoutez un nouvel étudiant.</EmptyDescription>
    </Empty>
    <template v-else>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Matricule</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>Prénom</TableHead>
            <TableHead>Naissance</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="e in etudiants"
            :key="e.id"
            class="cursor-pointer"
            @click="openBulletin(e)"
          >
            <TableCell class="font-bold">{{ e.matricule }}</TableCell>
            <TableCell class="underline">{{ e.nom }}</TableCell>
            <TableCell>{{ e.prenom }}</TableCell>
            <TableCell>{{ e.dateNaissance }}</TableCell>
            <TableCell><Badge :variant="statutTone(e.statut)">{{ e.statut }}</Badge></TableCell>
            <TableCell class="text-right" @click.stop>
              <div class="flex justify-end gap-1.5">
                <Button emphasis="compact" size="sm" @click="openEdit(e)">Éditer</Button>
                <Button variant="destructive" emphasis="compact" size="sm" @click="deleteTarget = e">
                  Suppr.
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Pagination
        v-if="totalPages > 1"
        v-model:page="page"
        :total="data?.meta.total ?? 0"
        :items-per-page="data?.meta.perPage ?? 1"
        class="mt-4.5"
      >
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
    :saving="createMutation.isPending.value || updateMutation.isPending.value"
    @save="save"
  />

  <AlertDialog :open="!!deleteTarget" @update:open="(v) => !v && (deleteTarget = null)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Supprimer cet étudiant ?</AlertDialogTitle>
        <AlertDialogDescription>
          {{ deleteTarget?.prenom }} {{ deleteTarget?.nom }} sera définitivement supprimé(e). Cette
          action est irréversible.
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
