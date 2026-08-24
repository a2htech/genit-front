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
import { LEVELS, useContextStore, useCurrentAcademicYearQuery, type Level } from '@/features/academic-year'

const route = useRoute()
const router = useRouter()
const context = useContextStore()
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
  <div class="min-h-screen bg-background">
    <template v-if="showChrome">
      <header class="flex h-16 items-center gap-7 border-b-2 border-border bg-card px-6">
        <RouterLink :to="{ name: 'dashboard' }" class="flex items-center gap-2.5 no-underline">
          <span class="block size-8 border-2 border-border bg-primary" />
          <span class="font-heading text-lg font-extrabold text-foreground">GestNotes</span>
        </RouterLink>
        <nav class="flex flex-1 gap-1 overflow-x-auto">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="px-4 py-2.5 text-sm font-bold whitespace-nowrap text-foreground no-underline"
            active-class="bg-primary text-primary-foreground"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </header>

      <div class="flex flex-wrap items-center gap-2.5 border-b-2 border-border bg-background px-6 py-2.5">
        <div class="border-2 border-border bg-card px-3.5 py-2 text-sm font-bold">
          📅 {{ currentYear?.year }}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger class="flex items-center gap-1 border-2 border-border bg-card px-3.5 py-2 text-sm font-bold">
            <GraduationCapIcon class="size-4" /> {{ context.level }} <ChevronDownIcon class="size-3.5" />
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

        <div class="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger class="flex items-center gap-1 border-2 border-border bg-card px-3.5 py-2 text-sm font-bold">
            Contexte <ChevronDownIcon class="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem @select="changeContext">Changer de contexte</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <UserButton />
      </div>
    </template>

    <main :class="showChrome ? 'mx-auto max-w-350 px-6 pt-7 pb-20' : ''">
      <RouterView />
    </main>
  </div>
</template>
