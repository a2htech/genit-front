<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/shared/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="empty"
    :class="cn(
      'gap-2 border-2 border-dashed border-border bg-card p-12 flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance',
      props.class,
    )"
  >
    <slot />
  </div>
</template>
