<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/design-system/ui/button'
import { Input } from '@/design-system/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/design-system/ui/select'
import { Spinner } from '@/design-system/ui/spinner'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/design-system/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { useContextStore } from '@/features/academic-year'
import { useMatieresQuery } from '@/features/teaching-unit'
import { isNoteEchouee } from '@/shared/utils/format'
import { useNotesQuery, useUpsertNoteMutation, useValiderSaisieMutation } from './score.queries'
import type { SessionExamen } from './score.types'

const router = useRouter()
const context = useContextStore()

const { data: matieres, isPending: matieresPending } = useMatieresQuery()
const matiereId = ref<string | null>(null)
watchEffect(() => {
  if (!matiereId.value && matieres.value && matieres.value.length > 0) {
    matiereId.value = matieres.value[0]!.id
  }
})

const session = ref<SessionExamen>('normale')
const { data: rows, isPending: notesPending } = useNotesQuery(matiereId, session)
const upsertMutation = useUpsertNoteMutation(matiereId, session)
const validerMutation = useValiderSaisieMutation()

const matiereCourante = computed(() => matieres.value?.find((m) => m.id === matiereId.value) ?? null)
const matiereLabel = computed(() =>
  matiereCourante.value ? `${matiereCourante.value.intitule} · coef. ${matiereCourante.value.coefficient}` : '',
)

const progressLabel = computed(() => {
  const total = rows.value?.length ?? 0
  const filled = rows.value?.filter((r) => typeof r.valeur === 'number').length ?? 0
  return `${filled}/${total}`
})

function onNoteInput(etudiantId: string, raw: string | number) {
  const valeur = raw === '' ? null : Number(raw)
  if (!matiereId.value) return
  upsertMutation.mutate({ matiereId: matiereId.value, session: session.value, etudiantId, valeur })
}

function onKeydown(e: KeyboardEvent, index: number) {
  if (e.key === 'Enter') {
    e.preventDefault()
    const next = document.getElementById(`grade-input-${index + 1}`)
    next?.focus()
  }
}

async function validate() {
  if (!matiereId.value) return
  await validerMutation.mutateAsync({ matiereId: matiereId.value, session: session.value })
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <Spinner v-if="matieresPending" class="mx-auto mt-32 size-8" />
  <div v-else>
    <h1 class="font-heading mb-5 text-2xl font-extrabold">Saisie des notes — {{ context.niveau }}</h1>

    <div class="mb-5.5 flex flex-wrap gap-4">
      <div>
        <div class="mb-1.5 text-xs font-bold tracking-wide uppercase">Matière</div>
        <Select :model-value="matiereId ?? undefined" @update:model-value="(v) => (matiereId = String(v))">
          <SelectTrigger class="min-w-65"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem v-for="m in matieres ?? []" :key="m.id" :value="m.id">
                {{ m.code }} — {{ m.intitule }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <div class="mb-1.5 text-xs font-bold tracking-wide uppercase">Session</div>
        <ToggleGroup v-model="session" type="single" variant="outline">
          <ToggleGroupItem value="normale">Normale</ToggleGroupItem>
          <ToggleGroupItem value="rattrapage">Rattrapage</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>

    <div class="mb-2.5 flex items-center justify-between">
      <div class="text-sm font-bold">{{ matiereLabel }}</div>
      <div class="font-heading bg-primary px-3.5 py-1.5 text-sm font-extrabold text-primary-foreground">
        {{ progressLabel }} saisies
      </div>
    </div>

    <Spinner v-if="notesPending" class="mx-auto my-8 size-8" />
    <Table v-else class="mb-24">
      <TableHeader>
        <TableRow>
          <TableHead>Matricule</TableHead>
          <TableHead>Étudiant</TableHead>
          <TableHead class="w-40">Note / 20</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="(row, index) in rows ?? []" :key="row.etudiantId">
          <TableCell class="font-bold">{{ row.matricule }}</TableCell>
          <TableCell>{{ row.nomComplet }}</TableCell>
          <TableCell>
            <Input
              :id="`grade-input-${index}`"
              type="number"
              :min="0"
              :max="20"
              :step="0.5"
              placeholder="—"
              class="text-center font-bold"
              :class="isNoteEchouee(row.valeur) ? 'text-destructive' : ''"
              :model-value="row.valeur ?? ''"
              @update:model-value="(v) => onNoteInput(row.etudiantId, v ?? '')"
              @keydown="(e: KeyboardEvent) => onKeydown(e, index)"
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <div class="fixed inset-x-0 bottom-0 z-30 flex justify-end bg-foreground px-6 py-4">
      <Button
        variant="success"
        class="border-background shadow-[4px_4px_0_0_var(--background)] hover:shadow-[2px_2px_0_0_var(--background)]"
        @click="validate"
      >
        Valider les notes
      </Button>
    </div>
  </div>
</template>
