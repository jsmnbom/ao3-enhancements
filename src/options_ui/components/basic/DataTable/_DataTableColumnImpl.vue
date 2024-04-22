<script setup lang="ts">
/* eslint-disable vue/valid-template-root */
import type { ColumnExposed, ColumnProps, ColumnSlots } from './types.ts'

const props = defineProps<ColumnProps>()
const slots = defineSlots<ColumnSlots>()

defineExpose({
  props: {
    id: props.id ?? props.accessor ?? props.header ?? (() => { throw new Error('Column must have an id, accessor, or header') })(),
    accessor: props.accessor,
    header: props.header,
  },
  slots,
} as ColumnExposed)
</script>

<template>
  <!-- DataTableColumnImpl -->
</template>
