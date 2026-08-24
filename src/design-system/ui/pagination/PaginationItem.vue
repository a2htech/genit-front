<script setup lang="ts">
import type { PaginationListItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { PaginationListItem } from 'reka-ui'
import { cn } from '@/shared/lib/utils'

const props = withDefaults(defineProps<PaginationListItemProps & {
  class?: HTMLAttributes['class']
  isActive?: boolean
}>(), {})

const delegatedProps = reactiveOmit(props, 'class', 'isActive')
</script>

<template>
  <PaginationListItem
    data-slot="pagination-item"
    v-bind="delegatedProps"
    :class="cn(
      'inline-flex h-9 min-w-9 items-center justify-center border-2 border-border px-2 text-sm font-bold transition-colors',
      isActive ? 'bg-foreground text-background' : 'bg-card text-foreground hover:bg-muted',
      props.class,
    )"
  >
    <slot />
  </PaginationListItem>
</template>
