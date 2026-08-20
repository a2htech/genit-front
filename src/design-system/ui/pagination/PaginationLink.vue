<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/shared/lib/utils'

const props = withDefaults(defineProps<{
  href?: string
  isActive?: boolean
  class?: HTMLAttributes['class']
}>(), {
  isActive: false,
})
</script>

<template>
  <a
    :href="href"
    data-slot="pagination-link"
    :data-active="isActive ? '' : undefined"
    :aria-current="isActive ? 'page' : undefined"
    :class="cn(
      'inline-flex h-9 min-w-9 items-center justify-center border-2 border-border px-2 text-sm font-bold transition-colors',
      isActive ? 'bg-foreground text-background' : 'bg-card text-foreground hover:bg-muted',
      props.class,
    )"
  >
    <slot />
  </a>
</template>
