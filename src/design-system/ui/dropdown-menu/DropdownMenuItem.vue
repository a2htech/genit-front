<script setup lang="ts">
import type { DropdownMenuItemProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { DropdownMenuItem, useForwardProps } from 'reka-ui'
import { cn } from '@/shared/lib/utils'

const props = withDefaults(defineProps<DropdownMenuItemProps & {
  class?: HTMLAttributes['class']
  inset?: boolean
  variant?: 'default' | 'destructive'
}>(), {
  variant: 'default',
})

const delegatedProps = reactiveOmit(props, 'inset', 'variant', 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <DropdownMenuItem
    data-slot="dropdown-menu-item"
    :data-inset="inset ? '' : undefined"
    :data-variant="variant"
    v-bind="forwardedProps"
    :class="cn('focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive data-[variant=destructive]:focus:text-destructive-foreground gap-1.5 border-b-2 border-border px-3.5 py-2.5 text-sm font-semibold last:border-b-0 data-inset:pl-7 [&_svg:not([class*=size-])]:size-4 group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0', props.class)"
  >
    <slot />
  </DropdownMenuItem>
</template>
