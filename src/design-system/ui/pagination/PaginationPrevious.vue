<script setup lang="ts">
import type { PaginationPrevProps } from 'reka-ui'

import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '@/design-system/ui/button'
import { ChevronLeftIcon } from '@lucide/vue'
import { reactiveOmit } from '@vueuse/core'
import { PaginationPrev, useForwardProps } from 'reka-ui'
import { cn } from '@/shared/lib/utils'
import { buttonVariants } from '@/design-system/ui/button'

const props = withDefaults(defineProps<PaginationPrevProps & {
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}>(), {
  size: 'sm',
})

const delegatedProps = reactiveOmit(props, 'class', 'size')
const forwarded = useForwardProps(delegatedProps)
</script>

<template>
  <PaginationPrev
    data-slot="pagination-previous"
    :class="cn(buttonVariants({ variant: 'ghost', emphasis: 'compact', size }), 'pl-1.5!', props.class)"
    v-bind="forwarded"
  >
    <slot>
      <ChevronLeftIcon data-icon="inline-start" class="cn-rtl-flip" />
      <span class="hidden sm:block">Previous</span>
    </slot>
  </PaginationPrev>
</template>
