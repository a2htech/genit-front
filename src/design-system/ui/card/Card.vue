<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/shared/lib/utils'

const props = withDefaults(
  defineProps<{
    class?: HTMLAttributes['class']
    size?: 'default' | 'sm'
  }>(),
  {
    size: 'default',
  },
)
</script>

<template>
  <div
    data-slot="card"
    :data-size="size"
    :class="
      cn(
        'group/card flex flex-col gap-4 overflow-hidden border-2 border-border bg-card py-5 text-sm text-card-foreground shadow-brutal-md has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
