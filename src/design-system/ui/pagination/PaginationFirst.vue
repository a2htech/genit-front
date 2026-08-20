<script setup lang="ts">
import type { PaginationFirstProps } from 'reka-ui'

import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '@/design-system/ui/button'
import { ChevronsLeftIcon } from '@lucide/vue'
import { reactiveOmit } from '@vueuse/core'
import { PaginationFirst, useForwardProps } from 'reka-ui'
import { cn } from '@/shared/lib/utils'
import { buttonVariants } from '@/design-system/ui/button'

const props = withDefaults(defineProps<PaginationFirstProps & {
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}>(), {
  size: 'sm',
})

const delegatedProps = reactiveOmit(props, 'class', 'size')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <PaginationFirst
    data-slot="pagination-first"
    :class="cn(buttonVariants({ variant: 'ghost', emphasis: 'compact', size }), '', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <ChevronsLeftIcon data-icon="inline-start" />
      <span class="hidden sm:block">First</span>
    </slot>
  </PaginationFirst>
</template>
