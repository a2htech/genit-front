<script setup lang="ts">
import { TableCell, TableRow } from '@/design-system/ui/table'
import Skeleton from './Skeleton.vue'

const props = withDefaults(
  defineProps<{
    rows?: number
    columns: number
    /** Classe(s) par colonne (index 0-based) ; sinon 'h-4 w-full' pour toutes. */
    cellClass?: string | string[]
  }>(),
  {
    rows: 5,
  },
)

function classFor(index: number) {
  return (Array.isArray(props.cellClass) ? props.cellClass[index] : props.cellClass) ?? 'h-4 w-full'
}
</script>

<template>
  <TableRow v-for="r in props.rows" :key="r">
    <TableCell v-for="c in props.columns" :key="c">
      <Skeleton :class="classFor(c - 1)" />
    </TableCell>
  </TableRow>
</template>
