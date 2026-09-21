<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { Component } from 'vue'
import { Card } from '@/design-system/ui/card'
import { Progress } from '@/design-system/ui/progress'
import { cn } from '@/shared/lib/utils'

const props = withDefaults(
  defineProps<{
    label: string
    value: string
    icon?: Component
    variant?: 'default' | 'success' | 'warning' | 'destructive' | 'accent'
    hint?: string
    /** Jauge 0-100 optionnelle (ex. moyenne /20 convertie en %) affichée sous la valeur. */
    progress?: number
    class?: HTMLAttributes['class']
  }>(),
  { variant: 'default' },
)

const ICON_CLASSES: Record<NonNullable<typeof props.variant>, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
  accent: 'bg-accent/10 text-accent',
}
</script>

<template>
  <Card :class="cn('gap-3 px-5', props.class)">
    <div class="flex items-center justify-between">
      <div class="text-xs font-bold tracking-wide text-muted-foreground uppercase">{{ label }}</div>
      <div
        v-if="icon"
        :class="
          cn(
            'flex size-8 items-center justify-center border-2 border-border [&_svg:not([class*=size-])]:size-4',
            ICON_CLASSES[variant],
          )
        "
      >
        <component :is="icon" />
      </div>
    </div>
    <div class="font-heading text-4xl font-extrabold">{{ value }}</div>
    <div v-if="hint" class="text-xs font-semibold text-muted-foreground">{{ hint }}</div>
    <Progress v-if="progress !== undefined" :model-value="progress" class="h-2" />
  </Card>
</template>
