<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ChevronDownIcon, ChevronRightIcon } from '@lucide/vue'
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
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select'
import { Spinner } from '@/design-system/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { useContextStore } from '@/features/academic-year'
import {
  useCreateMatiereMutation,
  useDeleteMatiereMutation,
  useMatieresQuery,
  useUnitesEnseignementQuery,
  useUpdateMatiereMutation,
} from './teaching-unit.queries'
import SubjectFormModal from './SubjectFormModal.vue'
import type { Matiere, MatiereFormValues } from './teaching-unit.types'

const context = useContextStore()
const semestre = ref<'S1' | 'S2'>('S1')

const { data: ues, isPending: uesPending } = useUnitesEnseignementQuery()
const { data: matieres, isPending: matieresPending } = useMatieresQuery()
const isPending = computed(() => uesPending.value || matieresPending.value)

const createMutation = useCreateMatiereMutation()
const updateMutation = useUpdateMatiereMutation()
const deleteMutation = useDeleteMatiereMutation()

const uesDuSemestre = computed(() => (ues.value ?? []).filter((u) => u.semestre === semestre.value))

const expandedUe = reactive<Record<string, boolean>>({})
const attachValue = reactive<Record<string, string>>({})

function toggleExpand(ueId: string) {
  expandedUe[ueId] = !expandedUe[ueId]
}

function matieresDe(ueId: string): Matiere[] {
  return (matieres.value ?? []).filter((m) => m.ueId === ueId)
}

function disponiblesPour(ueId: string): Matiere[] {
  return (matieres.value ?? []).filter((m) => m.ueId !== ueId)
}

function attacher(ueId: string, matiereId: string) {
  if (!matiereId) return
  updateMutation.mutate({ id: matiereId, payload: { ueId } })
  attachValue[ueId] = ''
}

function detacher(matiere: Matiere) {
  updateMutation.mutate({ id: matiere.id, payload: { ueId: null } })
}

const emptyForm: MatiereFormValues = { code: '', intitule: '', coefficient: 1, ueId: '', enseignant: '' }
const modalOpen = ref(false)
const modalTitle = ref('')
const editingId = ref<string | null>(null)
const formValues = ref<MatiereFormValues>({ ...emptyForm })

function openNewMatiere(ueId: string) {
  editingId.value = null
  modalTitle.value = 'Nouvelle matière'
  formValues.value = { ...emptyForm, ueId }
  modalOpen.value = true
}

function openEditMatiere(m: Matiere) {
  editingId.value = m.id
  modalTitle.value = 'Modifier la matière'
  formValues.value = { code: m.code, intitule: m.intitule, coefficient: m.coefficient, ueId: m.ueId ?? '', enseignant: m.enseignant }
  modalOpen.value = true
}

async function saveMatiere(values: MatiereFormValues) {
  if (editingId.value) {
    await updateMutation.mutateAsync({ id: editingId.value, payload: values })
  } else {
    await createMutation.mutateAsync(values)
  }
  modalOpen.value = false
}

const deleteTarget = ref<Matiere | null>(null)

async function confirmDelete() {
  if (!deleteTarget.value) return
  await deleteMutation.mutateAsync(deleteTarget.value.id)
  deleteTarget.value = null
}
</script>

<template>
  <Spinner v-if="isPending" class="mx-auto mt-32 size-8" />
  <div v-else>
    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-heading text-2xl font-extrabold">
        Unités d'enseignement — {{ context.niveau }} · Semestre {{ semestre.slice(1) }}
      </h1>
      <ToggleGroup v-model="semestre" type="single" variant="outline">
        <ToggleGroupItem value="S1">Semestre 1</ToggleGroupItem>
        <ToggleGroupItem value="S2">Semestre 2</ToggleGroupItem>
      </ToggleGroup>
    </div>

    <div v-for="ue in uesDuSemestre" :key="ue.id" class="mb-4.5 border-2 border-border bg-card shadow-brutal-md">
      <div class="flex cursor-pointer items-center gap-4 px-5 py-4.5" @click="toggleExpand(ue.id)">
        <component :is="expandedUe[ue.id] ? ChevronDownIcon : ChevronRightIcon" class="size-5 shrink-0" />
        <div class="font-heading w-27.5 text-sm font-extrabold">{{ ue.code }}</div>
        <div class="flex-1 text-[15px] font-semibold">{{ ue.intitule }}</div>
        <Badge variant="accent">{{ ue.credits }} crédits</Badge>
        <div class="w-32.5 text-right text-sm font-semibold text-muted-foreground">
          {{ matieresDe(ue.id).length }} matière{{ matieresDe(ue.id).length > 1 ? 's' : '' }}
        </div>
      </div>

      <div v-if="expandedUe[ue.id]" class="border-t-2 border-border bg-muted px-5 py-4.5 pl-14">
        <div
          v-for="mat in matieresDe(ue.id)"
          :key="mat.id"
          class="flex items-center gap-3 border-b border-border/30 py-2.5 last:border-b-0"
        >
          <div class="h-5.5 w-1 bg-foreground" />
          <div class="w-25 text-sm font-bold">{{ mat.code }}</div>
          <div class="flex-1 text-sm">{{ mat.intitule }}</div>
          <div class="w-20 text-xs text-muted-foreground">coef. {{ mat.coefficient }}</div>
          <div class="flex gap-1.5">
            <Button emphasis="compact" size="sm" @click="openEditMatiere(mat)">Éditer</Button>
            <Button variant="secondary" emphasis="compact" size="sm" @click="detacher(mat)">Détacher</Button>
            <Button variant="destructive" emphasis="compact" size="sm" @click="deleteTarget = mat">Suppr.</Button>
          </div>
        </div>
        <div v-if="matieresDe(ue.id).length === 0" class="py-2.5 text-sm text-muted-foreground">
          Aucune matière rattachée.
        </div>

        <div class="mt-3.5 flex flex-wrap items-center gap-2.5">
          <Select
            v-if="disponiblesPour(ue.id).length > 0"
            :model-value="attachValue[ue.id] || undefined"
            @update:model-value="(v) => v && attacher(ue.id, String(v))"
          >
            <SelectTrigger size="sm"><SelectValue placeholder="+ Rattacher une matière existante…" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="m in disponiblesPour(ue.id)" :key="m.id" :value="m.id">
                  {{ m.intitule }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button emphasis="compact" size="sm" @click="openNewMatiere(ue.id)">+ Nouvelle matière</Button>
        </div>
      </div>
    </div>

    <SubjectFormModal
      v-model:open="modalOpen"
      :title="modalTitle"
      :initial-values="formValues"
      :ue-options="uesDuSemestre.map((u) => ({ value: u.id, label: `${u.code} — ${u.intitule}` }))"
      :saving="createMutation.isPending.value || updateMutation.isPending.value"
      @save="saveMatiere"
    />

    <AlertDialog :open="!!deleteTarget" @update:open="(v) => !v && (deleteTarget = null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer cette matière ?</AlertDialogTitle>
          <AlertDialogDescription>
            {{ deleteTarget?.intitule }} sera définitivement supprimée.
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
  </div>
</template>
