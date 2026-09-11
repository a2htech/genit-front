<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cn } from '@/shared/lib/utils'

interface BarDatum {
  label: string
  value: number
}

/** Zone de tracé fixe en px : évite les chaînes de hauteurs en % imbriquées dans une colonne flex. */
const PLOT_HEIGHT = 96

const props = withDefaults(
  defineProps<{
    data: BarDatum[]
    class?: HTMLAttributes['class']
    barClass?: string
  }>(),
  { barClass: 'bg-primary' },
)

const max = computed(() => Math.max(1, ...props.data.map((d) => d.value)))

function barHeight(value: number): number {
  return value > 0 ? Math.max(4, Math.round((value / max.value) * PLOT_HEIGHT)) : 0
}
</script>

<template>
  <div :class="cn('flex flex-col', props.class)">
    <div class="flex items-end gap-2" :style="{ height: `${PLOT_HEIGHT + 28}px` }">
      <div v-for="d in data" :key="d.label" class="flex flex-1 flex-col items-center justify-end gap-1.5">
        <span class="font-heading text-sm font-extrabold tabular-nums">{{ d.value.toLocaleString('fr-FR') }}</span>
        <div
          :class="cn('w-full max-w-10 border-2 border-border', barClass)"
          :style="{ height: `${barHeight(d.value)}px` }"
        />
      </div>
    </div>
    <div class="mt-2 flex gap-2 border-t-2 border-border pt-2">
      <div
        v-for="d in data"
        :key="d.label"
        class="flex-1 text-center text-xs font-bold tracking-wide text-muted-foreground uppercase"
      >
        {{ d.label }}
      </div>
    </div>
  </div>
</template>
