<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { useRoute } from 'vue-router'
import { UserButton } from '@clerk/vue'
import { CalendarIcon, ChevronDownIcon, GraduationCapIcon, UsersIcon } from '@lucide/vue'
import { ConfirmDialog } from '@/design-system/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/design-system/ui/dropdown-menu'
import { FullPageLoader } from '@/design-system/ui/full-page-loader'
import { LEVELS, useContextStore, useCurrentAcademicYearQuery, type Level } from '@/features/academic-year'
import { useAuthStore, usePermissions, type Permission } from '@/features/auth'
import { discardUnsavedChanges, hasUnsavedChanges } from '@/shared/lib/unsaved-changes'
import { formatAcademicYear } from '@/shared/utils/format'

const route = useRoute()
const context = useContextStore()
const auth = useAuthStore()
const { can, hasAccess } = usePermissions()
const { data: currentYear } = useCurrentAcademicYearQuery()

const showChrome = computed(() => route.meta.requiresContext !== false)

/** Une page de détail (ex. la fiche étudiant) garde l'onglet de sa liste actif via `meta.nav`. */
const activeNav = computed(() => route.meta.nav ?? route.name)

const academicYearLabel = computed(() => (currentYear.value ? formatAcademicYear(currentYear.value.year) : null))

// Même permission que la route : une entrée visible ne mène jamais à « Accès refusé ».
const navItems: { name: string; label: string; permission: Permission }[] = [
  { name: 'students', label: 'Étudiants', permission: 'students.view' },
  { name: 'teaching-units', label: 'UE', permission: 'curriculum.view' },
  { name: 'scores', label: 'Notes', permission: 'scores.manage-own' },
  { name: 'decisions', label: 'Résultats', permission: 'results.view' },
]
const visibleNavItems = computed(() => navItems.filter((item) => can(item.permission)))

const adminItems: {
  name: string
  label: string
  description: string
  icon: Component
  permission: Permission
}[] = [
  {
    name: 'academic-year',
    label: 'Année universitaire',
    description: 'Calcul des résultats, bascule',
    icon: CalendarIcon,
    permission: 'academic-years.manage',
  },
  {
    name: 'users',
    label: 'Utilisateurs',
    description: 'Comptes, matières des enseignants',
    icon: UsersIcon,
    permission: 'users.manage',
  },
]
const visibleAdminItems = computed(() => adminItems.filter((item) => can(item.permission)))
const isAdminActive = computed(() => adminItems.some((item) => item.name === activeNav.value))

/** Niveau demandé alors que la page a des modifications non enregistrées : attend la confirmation. */
const pendingLevel = ref<Level | null>(null)

function selectLevel(level: Level) {
  if (hasUnsavedChanges()) pendingLevel.value = level
  else context.setLevel(level)
}

function confirmLevelChange() {
  if (!pendingLevel.value) return
  discardUnsavedChanges()
  context.setLevel(pendingLevel.value)
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
            v-for="item in visibleNavItems"
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
          <DropdownMenu v-if="visibleAdminItems.length > 0">
            <DropdownMenuTrigger
              class="flex items-center gap-1.5 border-b-4 px-3.5 py-2.5 text-sm font-bold whitespace-nowrap transition-colors duration-100"
              :class="
                isAdminActive
                  ? 'border-accent text-foreground'
                  : 'border-transparent text-foreground/70 hover:border-accent/40 hover:text-foreground'
              "
            >
              Administration <ChevronDownIcon class="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" class="w-72">
              <DropdownMenuItem v-for="item in visibleAdminItems" :key="item.name" as-child>
                <RouterLink :to="{ name: item.name }" class="flex items-start gap-3 text-foreground no-underline">
                  <component :is="item.icon" class="mt-0.5 size-4.5 shrink-0" />
                  <span class="flex flex-col gap-0.5">
                    <span class="text-sm font-bold">{{ item.label }}</span>
                    <span class="text-xs text-muted-foreground">{{ item.description }}</span>
                  </span>
                </RouterLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
        <span class="h-8 w-px shrink-0 bg-border" />

        <div class="flex shrink-0 flex-wrap items-center gap-2">
          <span v-if="academicYearLabel" class="text-xs font-semibold whitespace-nowrap text-muted-foreground">
            <span class="text-[10px] font-bold tracking-wide uppercase">AU</span> {{ academicYearLabel }}
          </span>

          <DropdownMenu v-if="hasAccess">
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

    <ConfirmDialog
      :open="pendingLevel !== null"
      title="Modifications non enregistrées"
      description="Changer de niveau abandonnera les modifications en cours sur cette page."
      confirm-label="Changer quand même"
      destructive
      @update:open="pendingLevel = null"
      @confirm="confirmLevelChange"
    />
  </div>
</template>
