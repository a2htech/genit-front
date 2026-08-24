<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/shared/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <tr
    data-slot="table-row"
    :class="cn('hover:bg-muted data-[state=selected]:bg-muted border-b-2 border-border transition-colors last:border-b-0 has-aria-expanded:bg-muted', props.class)"
  >
    <slot />
  </tr>
</template>
