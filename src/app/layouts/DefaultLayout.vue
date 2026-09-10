<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UserButton } from '@clerk/vue'
import { ChevronDownIcon, GraduationCapIcon } from '@lucide/vue'
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

const route = useRoute()
const router = useRouter()
const context = useContextStore()
const auth = useAuthStore()
const { data: currentYear } = useCurrentAcademicYearQuery()

const showChrome = computed(() => route.meta.requiresContext !== false)

const navItems: { name: string; label: string }[] = [
  { name: 'students', label: 'Étudiants' },
  { name: 'teaching-units', label: 'UE' },
  { name: 'scores', label: 'Notes' },
  { name: 'decisions', label: 'Résultats' },
  { name: 'academic-year', label: 'Année' },
]

function selectLevel(n: Level) {
  context.setLevel(n)
}

function changeContext() {
  context.reset()
  router.push({ name: 'context-setup' })
}
</script>

<template>
  <FullPageLoader v-if="!auth.isLoaded" />
  <div v-else class="min-h-screen bg-background">
    <template v-if="showChrome">
      <header class="flex h-16 items-center gap-4 border-b-2 border-border bg-card px-6">
        <RouterLink
          :to="{ name: 'dashboard' }"
          class="flex size-9 shrink-0 items-center justify-center border-2 border-border bg-accent shadow-brutal-sm no-underline transition-transform duration-100 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          style="clip-path: polygon(0 0, 100% 0, 100% 62%, 62% 100%, 0 100%)"
        >
          <GraduationCapIcon class="size-4.5 -translate-x-0.5 -translate-y-0.5 text-accent-foreground" aria-hidden="true" />
        </RouterLink>
        <span class="h-6 w-1 shrink-0 bg-foreground" />
        <nav class="flex flex-1 gap-1 overflow-x-auto">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="border-b-4 px-3.5 py-2.5 text-sm font-bold whitespace-nowrap no-underline transition-colors duration-100"
            :class="route.name === item.name
              ? 'border-accent text-foreground'
              : 'border-transparent text-foreground/70 hover:border-accent/40 hover:text-foreground'"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
        <span class="h-8 w-px shrink-0 bg-border" />

        <div class="flex shrink-0 flex-wrap items-center gap-2">
          <div class="border-2 border-border bg-card px-2.5 py-1.5 text-xs font-bold">
            📅 {{ currentYear?.year }}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger class="flex items-center gap-1 border-2 border-border bg-card px-2.5 py-1.5 text-xs font-bold">
              <GraduationCapIcon class="size-3.5" /> {{ context.level }} <ChevronDownIcon class="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  v-for="n in LEVELS"
                  :key="n.value"
                  @select="selectLevel(n.value)"
                >
                  {{ n.value }} — {{ n.label }}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger class="flex items-center gap-1 border-2 border-border bg-card px-2.5 py-1.5 text-xs font-bold">
              Contexte <ChevronDownIcon class="size-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem @select="changeContext">Changer de contexte</DropdownMenuItem>
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
  </div>
</template>
