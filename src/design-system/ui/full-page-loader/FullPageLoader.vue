<script setup lang="ts">
import type { HTMLAttributes } from 'vue'

import { GraduationCapIcon } from '@lucide/vue'
import { cn } from '@/shared/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('flex min-h-screen items-center justify-center bg-background', props.class)">
    <GraduationCapIcon role="status" aria-label="Chargement" class="size-20 animate-pulse text-primary" />
  </div>
</template>
