<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

import type { Tag } from '#common'

const data = ref<Tag[]>([
  { tag: 'test', type: 'unknown' },
  { tag: 'test2', type: 'unknown' },
  { tag: 'test3', type: 'unknown' },
  { tag: 'test4', type: 'unknown' },
  { tag: 'test5', type: 'unknown' },
  { tag: 'test', type: 'unknown' },
  { tag: 'test2', type: 'unknown' },
  { tag: 'test3', type: 'unknown' },
  { tag: 'test4', type: 'unknown' },
  { tag: 'test5', type: 'unknown' },
  { tag: 'test', type: 'unknown' },
  { tag: 'test2', type: 'unknown' },
  { tag: 'test3', type: 'unknown' },
  { tag: 'test4', type: 'unknown' },
  { tag: 'test5', type: 'unknown' },
  { tag: 'test', type: 'unknown' },
  { tag: 'test2', type: 'unknown' },
  { tag: 'test3', type: 'unknown' },
  { tag: 'test4', type: 'unknown' },
  { tag: 'test5', type: 'unknown' },
  { tag: 'test', type: 'unknown' },
  { tag: 'test2', type: 'unknown' },
  { tag: 'test3', type: 'unknown' },
  { tag: 'test4', type: 'unknown' },
  { tag: 'test5', type: 'unknown' },
])

const columns: ColumnDef<Tag, any>[] = [{
  id: 'tag',
  header: 'Tag',
  cell: ({ row }) => h('div', { class: 'w-20' }, 'beans'),
}, {
  id: 'type',
  header: 'Type',
  cell: ({ row }) => h('div', { class: 'w-20' }, row.getValue('type')),
}]
</script>

<template>
  <OptionRowCollapsable
    title="Based on work tags"
    subtitle="Hide tags based on the tags of the work"
    switch-option-id="hideTags"
  >
    <DataTable :data="data" :columns="columns" />
  </OptionRowCollapsable>
</template>
