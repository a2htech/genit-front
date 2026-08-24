<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Spinner } from '@/design-system/ui/spinner'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import { useCurrentAcademicYearQuery } from './academic-year.queries'
import { useContextStore } from './context.store'
import { LEVELS, type Level } from './academic-year.types'

const router = useRouter()
const context = useContextStore()
const { data: currentYear, isPending } = useCurrentAcademicYearQuery()

function selectLevel(value: unknown) {
  const level = value as Level | undefined
  if (!level) return
  context.setLevel(level)
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <Spinner v-if="isPending" class="mx-auto mt-32 size-8" />
  <div v-else class="mx-auto max-w-230 px-6 py-12">
    <div class="mb-9 text-center">
      <h1 class="font-heading mb-2 text-3xl font-extrabold">Bienvenue</h1>
      <p class="text-sm font-medium text-muted-foreground">
        Choisissez votre niveau pour l'année universitaire {{ currentYear?.year }}. Ce contexte
        sera actif pour toute votre session.
      </p>
    </div>

    <div class="mb-2.5 text-xs font-bold tracking-wide text-foreground uppercase">Niveau</div>
    <ToggleGroup
      type="single"
      :model-value="context.level ?? undefined"
      class="grid w-full grid-cols-2 gap-4 sm:grid-cols-5"
      @update:model-value="selectLevel"
    >
      <ToggleGroupItem
        v-for="n in LEVELS"
        :key="n.value"
        :value="n.value"
        class="flex h-auto flex-col gap-1 border-2 border-border bg-card py-6 shadow-brutal-lg transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-brutal-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <span class="font-heading text-2xl font-extrabold">{{ n.value }}</span>
        <span class="text-[11px] font-semibold opacity-70">{{ n.label }}</span>
      </ToggleGroupItem>
    </ToggleGroup>
  </div>
</template>
