<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Alert } from '@/design-system/ui/alert'
import { Badge } from '@/design-system/ui/badge'
import { Button } from '@/design-system/ui/button'
import { Checkbox } from '@/design-system/ui/checkbox'
import { ConfirmDialog } from '@/design-system/ui/confirm-dialog'
import { Empty, EmptyDescription, EmptyTitle } from '@/design-system/ui/empty'
import { Input } from '@/design-system/ui/input'
import { Skeleton } from '@/design-system/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { LEVELS, useContextStore, type Level } from '@/features/academic-year'
import { teacherLabel, useTeachingUnitsQuery, type Subject } from '@/features/teaching-unit'
import { apiErrorMessage } from '@/shared/api/errors'
import { useAssignSubjectsMutation, useUsersQuery } from './user.queries'
import { canTeach, ROLE_LABELS } from './user.types'

const context = useContextStore()
const { data: users, isPending } = useUsersQuery()
const assignMutation = useAssignSubjectsMutation()
const errorMessage = ref<string | null>(null)

const search = ref('')
const teachersOnly = ref(true)
const filteredUsers = computed(() => {
  const term = search.value.trim().toLowerCase()
  return (users.value ?? []).filter(
    (u) => (!teachersOnly.value || canTeach(u)) && (u.email ?? '').toLowerCase().includes(term),
  )
})

const selectedId = ref<string | null>(null)
const selectedUser = computed(() => users.value?.find((u) => u.clerk_id === selectedId.value) ?? null)

// Le niveau du panneau est local : affecter une matière de M1 ne change pas le niveau consulté.
const level = ref<Level>(context.level!)
const { data: teachingUnits, isPending: unitsPending } = useTeachingUnitsQuery(level)

/** Ids cochés, tous niveaux confondus : le PUT remplace la liste entière. */
const draft = ref<number[]>([])
const savedIds = computed(() => selectedUser.value?.subjects.map((s) => s.id) ?? [])
const isDirty = computed(
  () => draft.value.length !== savedIds.value.length || draft.value.some((id) => !savedIds.value.includes(id)),
)

function resetDraft() {
  draft.value = [...savedIds.value]
  errorMessage.value = null
}

watch(selectedId, resetDraft)

function toggle(subjectId: number, checked: boolean) {
  draft.value = checked ? [...draft.value, subjectId] : draft.value.filter((id) => id !== subjectId)
}

/** Ce que devient l'enseignant actuel de la matière si on enregistre ; `warning` quand on la lui reprend. */
function holderStatus(subject: Subject, checked: boolean): { label: string; warning: boolean } | null {
  if (subject.user_id === selectedId.value) return checked ? null : { label: 'Retirée', warning: false }
  if (!subject.user_id) return { label: 'Libre', warning: false }
  return checked
    ? { label: `Reprise à ${teacherLabel(subject)}`, warning: true }
    : { label: teacherLabel(subject), warning: false }
}

const units = computed(() =>
  [...(teachingUnits.value ?? [])]
    .sort((a, b) => a.semester - b.semester || a.code.localeCompare(b.code))
    .map((unit) => ({
      ...unit,
      rows: unit.subjects.map((subject) => {
        const checked = draft.value.includes(subject.id)
        return { subject, checked, holder: holderStatus(subject, checked) }
      }),
    })),
)

const pendingUserId = ref<string | null>(null)

function selectUser(clerkId: string) {
  if (clerkId === selectedId.value) return
  if (isDirty.value) pendingUserId.value = clerkId
  else selectedId.value = clerkId
}

function confirmUserChange() {
  selectedId.value = pendingUserId.value
  pendingUserId.value = null
}

async function save() {
  if (!selectedUser.value) return
  errorMessage.value = null
  try {
    await assignMutation.mutateAsync({ clerkId: selectedUser.value.clerk_id, subjectIds: draft.value })
  } catch (e) {
    errorMessage.value = apiErrorMessage(e)
  }
}
</script>

<template>
  <div>
    <h1 class="mb-1.5 font-heading text-2xl font-extrabold">Utilisateurs</h1>
    <p class="mb-5 text-sm text-muted-foreground">
      Les rôles se gèrent dans Clerk : un changement apparaît ici à la prochaine connexion de la personne.
    </p>

    <div class="flex flex-wrap items-start gap-5">
      <aside class="w-full border-2 border-border bg-card shadow-brutal-md md:w-80">
        <div class="space-y-2.5 border-b-2 border-border p-3">
          <Input
            v-model="search"
            type="search"
            placeholder="Rechercher par e-mail…"
            aria-label="Rechercher par e-mail"
          />
          <label class="flex items-center gap-2 text-xs font-semibold">
            <Checkbox v-model="teachersOnly" />
            Enseignants et coordinateurs seulement
          </label>
        </div>

        <div v-if="isPending" class="space-y-3 p-3.5">
          <Skeleton v-for="i in 5" :key="i" class="h-9 w-full" />
        </div>
        <p v-else-if="filteredUsers.length === 0" class="p-3.5 text-sm text-muted-foreground">
          Aucun utilisateur ne correspond à cette recherche.
        </p>
        <ul v-else>
          <li v-for="u in filteredUsers" :key="u.clerk_id" class="border-b border-border/15 last:border-b-0">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left transition-colors"
              :class="u.clerk_id === selectedId ? 'bg-accent' : 'hover:bg-muted'"
              :aria-current="u.clerk_id === selectedId"
              @click="selectUser(u.clerk_id)"
            >
              <span class="min-w-0">
                <span class="block truncate text-sm font-semibold">{{ u.email ?? u.clerk_id }}</span>
                <span class="text-xs text-foreground/70">{{ ROLE_LABELS[u.role] }}</span>
              </span>
              <Badge v-if="canTeach(u)">{{ u.subjects.length }}</Badge>
            </button>
          </li>
        </ul>
      </aside>

      <section class="min-w-0 flex-[999_1_560px]">
        <Empty v-if="!selectedUser" class="border-2 border-border bg-card">
          <EmptyTitle>Aucun utilisateur sélectionné</EmptyTitle>
          <EmptyDescription>Choisissez un enseignant à gauche pour gérer ses matières.</EmptyDescription>
        </Empty>

        <Empty v-else-if="!canTeach(selectedUser)" class="border-2 border-border bg-card">
          <EmptyTitle>{{ selectedUser.email }} — {{ ROLE_LABELS[selectedUser.role] }}</EmptyTitle>
          <EmptyDescription>
            Seuls les enseignants et les coordinateurs reçoivent des matières. Le rôle se change dans Clerk.
          </EmptyDescription>
        </Empty>

        <div v-else class="border-2 border-border bg-card shadow-brutal-md">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border px-5 py-4">
            <div>
              <h2 class="mb-1 font-heading text-lg font-extrabold">{{ selectedUser.email }}</h2>
              <div class="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Badge>{{ ROLE_LABELS[selectedUser.role] }}</Badge>
                {{ draft.length }} matière{{ draft.length > 1 ? 's' : '' }}, tous niveaux confondus
              </div>
            </div>
            <ToggleGroup
              :model-value="level"
              type="single"
              variant="segmented"
              size="sm"
              @update:model-value="(v) => v && (level = v as Level)"
            >
              <ToggleGroupItem v-for="l in LEVELS" :key="l.value" :value="l.value">{{ l.value }}</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Alert v-if="errorMessage" variant="destructive" class="m-5 mb-0">{{ errorMessage }}</Alert>

          <div class="px-5 pt-1 pb-4">
            <template v-if="unitsPending">
              <Skeleton v-for="i in 4" :key="i" class="mt-4 h-9 w-full" />
            </template>
            <p v-else-if="units.length === 0" class="py-4 text-sm text-muted-foreground">Aucune UE en {{ level }}.</p>
            <template v-for="unit in units" v-else :key="unit.id">
              <div class="border-b-2 border-border pt-4 pb-1 text-sm">
                <span class="text-xs font-bold text-muted-foreground">S{{ unit.semester }}</span> ·
                <span class="font-heading font-extrabold">{{ unit.code }}</span> ·
                <span class="font-semibold">{{ unit.name }}</span>
              </div>
              <p v-if="unit.rows.length === 0" class="py-2.5 pl-3 text-sm text-muted-foreground">
                Aucune matière rattachée.
              </p>
              <label
                v-for="row in unit.rows"
                :key="row.subject.id"
                class="flex cursor-pointer items-center gap-3 border-b border-border/15 py-2.5 pl-3"
              >
                <Checkbox :model-value="row.checked" @update:model-value="(v) => toggle(row.subject.id, v === true)" />
                <span class="flex-1 text-sm">{{ row.subject.name }}</span>
                <Badge v-if="row.holder?.warning" variant="warning">{{ row.holder.label }}</Badge>
                <span v-else-if="row.holder" class="text-xs text-muted-foreground">{{ row.holder.label }}</span>
              </label>
            </template>
          </div>

          <div
            v-if="isDirty"
            class="flex flex-wrap items-center justify-between gap-3 border-t-2 border-border bg-warning px-5 py-3"
          >
            <span class="text-sm font-bold">Modifications non enregistrées</span>
            <div class="flex gap-2">
              <Button variant="outline" emphasis="compact" @click="resetDraft">Annuler</Button>
              <Button emphasis="compact" :disabled="assignMutation.isPending.value" @click="save">
                {{ assignMutation.isPending.value ? 'Enregistrement…' : 'Enregistrer' }}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <ConfirmDialog
      :open="pendingUserId !== null"
      title="Modifications non enregistrées"
      description="Changer d'utilisateur abandonnera les matières cochées ou décochées."
      confirm-label="Changer quand même"
      destructive
      @update:open="pendingUserId = null"
      @confirm="confirmUserChange"
    />
  </div>
</template>
