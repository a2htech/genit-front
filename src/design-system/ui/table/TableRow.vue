<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { useTemplateRef } from 'vue'
import { cn } from '@/shared/lib/utils'

const props = withDefaults(defineProps<{
  class?: HTMLAttributes['class']
  /** Rangée navigable au clavier (focus + Entrée/Espace). Pas de role="button" : certaines rangées imbriquent déjà de vrais boutons d'action. */
  interactive?: boolean
}>(), {
  interactive: false,
})

const rowRef = useTemplateRef('rowRef')

function onKeydown(e: KeyboardEvent) {
  if (!props.interactive || e.target !== rowRef.value) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    rowRef.value?.click()
  }
}
</script>

<template>
  <tr
    ref="rowRef"
    data-slot="table-row"
    :tabindex="interactive ? 0 : undefined"
    :class="
      cn(
        'hover:bg-muted data-[state=selected]:bg-muted border-b-2 border-border transition-colors last:border-b-0 has-aria-expanded:bg-muted',
        interactive && 'cursor-pointer outline-none focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset',
        props.class,
      )
    "
    @keydown="onKeydown"
  >
    <slot />
  </tr>
</template>
