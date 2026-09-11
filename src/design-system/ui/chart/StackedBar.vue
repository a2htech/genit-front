<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { BadgeVariants } from '@/design-system/ui/badge'
import { computed } from 'vue'
import { Badge } from '@/design-system/ui/badge'
import { cn } from '@/shared/lib/utils'

interface StackedBarSegment {
  key: string
  label: string
  value: number
  variant?: BadgeVariants['variant']
}

const props = defineProps<{
  segments: StackedBarSegment[]
  class?: HTMLAttributes['class']
}>()

const SEGMENT_FILLS: Record<NonNullable<BadgeVariants['variant']>, string> = {
  default: 'bg-primary',
  secondary: 'bg-secondary',
  destructive: 'bg-destructive',
  success: 'bg-success',
  warning: 'bg-warning',
  accent: 'bg-accent',
  outline: 'bg-background',
}

const total = computed(() => props.segments.reduce((sum, s) => sum + s.value, 0))
const filledSegments = computed(() => props.segments.filter((s) => s.value > 0))

function pct(value: number): number {
  return total.value > 0 ? Math.round((value / total.value) * 100) : 0
}
</script>

<template>
  <div :class="cn('flex flex-col gap-3', props.class)">
    <div class="flex h-8 gap-0.5 border-2 border-border bg-background p-0.5">
      <div
        v-for="s in filledSegments"
        :key="s.key"
        :class="SEGMENT_FILLS[s.variant ?? 'default']"
        :style="{ flexGrow: s.value, flexBasis: 0 }"
        :title="`${s.label} : ${s.value} (${pct(s.value)}%)`"
      />
    </div>
    <div class="flex flex-wrap gap-2">
      <Badge v-for="s in segments" :key="s.key" :variant="s.variant">{{ s.label }} · {{ s.value }} ({{ pct(s.value) }}%)</Badge>
    </div>
  </div>
</template>
