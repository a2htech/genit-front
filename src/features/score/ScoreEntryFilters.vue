<script setup lang="ts">
import { computed } from 'vue'
import { CheckIcon, ChevronDownIcon } from '@lucide/vue'
import { Button } from '@/design-system/ui/button'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from '@/design-system/ui/combobox'
import { Skeleton } from '@/design-system/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/ui/toggle-group'
import type { Subject, TeachingUnit } from '@/features/teaching-unit'
import type { ExamSession } from './score.types'

const props = defineProps<{
  units: TeachingUnit[]
  pending: boolean
}>()

const subjectId = defineModel<number | null>('subjectId', { required: true })
const session = defineModel<ExamSession>('session', { required: true })

const currentSubject = computed(
  () => props.units.flatMap((u) => u.subjects).find((s) => s.id === subjectId.value) ?? null,
)

function onSessionChange(value: unknown) {
  if (!value) return
  session.value = value as ExamSession
}
</script>

<template>
  <div class="mb-5.5 flex flex-wrap gap-4">
    <div>
      <div class="mb-1.5 text-xs font-bold tracking-wide uppercase">Matière</div>
      <Skeleton v-if="pending" class="h-9 w-65" />
      <Combobox
        v-else
        :model-value="currentSubject"
        by="id"
        @update:model-value="(v) => (subjectId = (v as Subject | null)?.id ?? null)"
      >
        <ComboboxAnchor as-child>
          <ComboboxTrigger as-child>
            <Button variant="outline" emphasis="compact" role="combobox" class="min-w-65 justify-between gap-2 bg-card">
              {{ currentSubject?.name ?? 'Sélectionner une matière' }}
              <ChevronDownIcon class="size-4 shrink-0 opacity-50" />
            </Button>
          </ComboboxTrigger>
        </ComboboxAnchor>
        <ComboboxList align="start" class="w-75">
          <ComboboxInput placeholder="Rechercher une matière…" />
          <ComboboxViewport>
            <ComboboxEmpty>Aucune matière trouvée.</ComboboxEmpty>
            <ComboboxGroup v-for="unit in units" :key="unit.id" :heading="`${unit.code} — ${unit.name}`">
              <ComboboxItem v-for="s in unit.subjects" :key="s.id" :value="s">
                {{ s.name }}
                <ComboboxItemIndicator><CheckIcon /></ComboboxItemIndicator>
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxViewport>
        </ComboboxList>
      </Combobox>
    </div>
    <div>
      <div class="mb-1.5 text-xs font-bold tracking-wide uppercase">Session</div>
      <ToggleGroup :model-value="session" type="single" variant="outline" @update:model-value="onSessionChange">
        <ToggleGroupItem value="normale">Normale</ToggleGroupItem>
        <ToggleGroupItem value="rattrapage">Rattrapage</ToggleGroupItem>
      </ToggleGroup>
    </div>
  </div>
</template>
