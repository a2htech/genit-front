<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { UserButton } from '@clerk/vue'
import { ChevronDownIcon, GraduationCapIcon } from '@lucide/vue'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/design-system/ui/dropdown-menu'
import { FullPageLoader } from '@/design-system/ui/full-page-loader'
import { LEVELS, useContextStore, useCurrentAcademicYearQuery, type Level } from '@/features/academic-year'
import { useAuthStore } from '@/features/auth'
import { discardUnsavedChanges, hasUnsavedChanges } from '@/shared/lib/unsaved-changes'
import { formatAcademicYear } from '@/shared/utils/format'

const route = useRoute()
const context = useContextStore()
const auth = useAuthStore()
const { data: currentYear } = useCurrentAcademicYearQuery()

const showChrome = computed(() => route.meta.requiresContext !== false)

/** Une page de détail (ex. la fiche étudiant) garde l'onglet de sa liste actif via `meta.nav`. */
const activeNav = computed(() => (route.meta.nav as string | undefined) ?? route.name)

const academicYearLabel = computed(() => (currentYear.value ? formatAcademicYear(currentYear.value.year) : null))

const navItems: { name: string; label: string }[] = [
  { name: 'students', label: 'Étudiants' },
  { name: 'teaching-units', label: 'UE' },
  { name: 'scores', label: 'Notes' },
  { name: 'decisions', label: 'Résultats' },
  { name: 'academic-year', label: 'Année' },
]

const pendingLevel = ref<Level | null>(null)
// AlertDialogAction ferme le dialog (nullifie pendingLevel via @update:open) dans le même
// clic avant que ce handler ne tourne, donc le niveau visé est capturé à part.
let pendingLevelValue: Level | null = null

function selectLevel(n: Level) {
  if (hasUnsavedChanges()) {
    pendingLevel.value = n
    pendingLevelValue = n
    return
  }
  context.setLevel(n)
}

function confirmLevelChange() {
  if (pendingLevelValue === null) return
  discardUnsavedChanges()
  context.setLevel(pendingLevelValue)
  pendingLevelValue = null
  pendingLevel.value = null
}

function cancelLevelChange() {
  pendingLevelValue = null
  pendingLevel.value = null
}
</script>

<template>
  <FullPageLoader v-if="!auth.isLoaded" />
  <div v-else class="min-h-screen bg-background">
    <template v-if="showChrome">
      <header class="flex h-16 items-center gap-4 border-b-2 border-border bg-card px-6">
        <RouterLink
          :to="{ name: 'dashboard' }"
          class="flex size-9 shrink-0 items-center justify-center border-2 border-border bg-accent no-underline shadow-brutal-sm transition-transform duration-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          style="clip-path: polygon(0 0, 100% 0, 100% 62%, 62% 100%, 0 100%)"
        >
          <GraduationCapIcon
            class="size-4.5 -translate-x-0.5 -translate-y-0.5 text-accent-foreground"
            aria-hidden="true"
          />
        </RouterLink>
        <span class="h-6 w-1 shrink-0 bg-foreground" />
        <nav class="flex flex-1 gap-1 overflow-x-auto">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="border-b-4 px-3.5 py-2.5 text-sm font-bold whitespace-nowrap no-underline transition-colors duration-100"
            :class="
              activeNav === item.name
                ? 'border-accent text-foreground'
                : 'border-transparent text-foreground/70 hover:border-accent/40 hover:text-foreground'
            "
          >
            {{ item.label }}
          </RouterLink>
        </nav>
        <span class="h-8 w-px shrink-0 bg-border" />

        <div class="flex shrink-0 flex-wrap items-center gap-2">
          <span v-if="academicYearLabel" class="text-xs font-semibold whitespace-nowrap text-muted-foreground">
            <span class="text-[10px] font-bold tracking-wide uppercase">AU</span> {{ academicYearLabel }}
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger
              class="flex items-center gap-1.5 border-2 border-border bg-primary px-3 py-1.5 text-xs font-bold whitespace-nowrap text-primary-foreground shadow-brutal-sm transition-transform duration-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              <GraduationCapIcon class="size-3.5" /> Niveau {{ context.level }} <ChevronDownIcon class="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem v-for="n in LEVELS" :key="n.value" @select="selectLevel(n.value)">
                  {{ n.value }} — {{ n.label }}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <UserButton />
        </div>
      </header>
    </template>

    <main :class="showChrome ? 'mx-auto max-w-350 px-6 pt-7 pb-20' : ''">
      <RouterView />
    </main>

    <AlertDialog :open="!!pendingLevel" @update:open="(v) => !v && (pendingLevel = null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Modifications non enregistrées</AlertDialogTitle>
          <AlertDialogDescription>
            Changer de niveau abandonnera les modifications en cours sur cette page.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelLevelChange">Annuler</AlertDialogCancel>
          <AlertDialogAction variant="destructive" @click="confirmLevelChange">Changer quand même</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
