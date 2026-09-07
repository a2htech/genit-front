<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Card } from '@/design-system/ui/card'
import { cn } from '@/shared/lib/utils'
import Skeleton from './Skeleton.vue'

const props = withDefaults(defineProps<{
  label: string
  class?: HTMLAttributes['class']
  valueClass?: HTMLAttributes['class']
}>(), {
  valueClass: 'h-9 w-16',
})
</script>

<template>
  <Card :class="cn('px-5', props.class)">
    <div class="text-xs font-bold tracking-wide text-muted-foreground uppercase">{{ props.label }}</div>
    <Skeleton :class="cn('mt-1.5', props.valueClass)" />
  </Card>
</template>
