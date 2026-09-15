<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { refDebounced } from '@vueuse/core'
import { CheckIcon, PlusIcon } from '@lucide/vue'
import {
  Combobox,
  ComboboxAnchor,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  ComboboxViewport,
} from '@/design-system/ui/combobox'
import { Spinner } from '@/design-system/ui/spinner'
import type { Student } from '@/features/student'
import { useRetakeEligibleStudentsQuery } from './score.queries'

const props = defineProps<{
  subjectId: number | null
  excludedIds: number[]
}>()

const emit = defineEmits<{ add: [student: Student] }>()

const search = ref('')
const debouncedSearch = refDebounced(search, 300)
// Monté uniquement en session de rattrapage : la requête peut rester toujours active.
const { data: results, isFetching } = useRetakeEligibleStudentsQuery(
  toRef(props, 'subjectId'),
  debouncedSearch,
  ref(true),
)
const options = computed(() => (results.value ?? []).filter((s) => !props.excludedIds.includes(s.id)))

function onSelect(value: unknown) {
  const student = value as Student | undefined
  if (!student) return
  emit('add', student)
  search.value = ''
}
</script>

<template>
  <Combobox :model-value="null" ignore-filter by="id" @update:model-value="onSelect">
    <ComboboxAnchor as-child>
      <ComboboxTrigger as-child>
        <button
          type="button"
          class="flex w-full items-center gap-2 py-1 text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <PlusIcon class="size-4" />
          Ajouter un étudiant au rattrapage
        </button>
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxList align="start" class="w-75">
      <ComboboxInput v-model="search" placeholder="Nom de l'étudiant…" />
      <ComboboxViewport>
        <ComboboxEmpty>
          <Spinner v-if="isFetching" class="size-4" />
          <span v-else>Aucun étudiant trouvé.</span>
        </ComboboxEmpty>
        <ComboboxItem v-for="s in options" :key="s.id" :value="s">
          {{ s.first_name }} {{ s.last_name }}
          <ComboboxItemIndicator><CheckIcon /></ComboboxItemIndicator>
        </ComboboxItem>
      </ComboboxViewport>
    </ComboboxList>
  </Combobox>
</template>
