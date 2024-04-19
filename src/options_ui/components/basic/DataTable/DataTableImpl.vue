<script setup lang="ts">
import { toArray } from '@antfu/utils'
import {
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { Fragment, type VNodeArrayChildren, type VNodeChild, h } from 'vue'

import { type DataTableColumnDefMeta, dataTableContext } from './context.ts'
import type { DataTableSlots } from './types.ts'

const slots = defineSlots<DataTableSlots>()

const context = dataTableContext.inject()

const table = useVueTable({
  get data() { return toValue(context.data) },
  get columns() { return toValue(context.columns) },
  enableRowSelection: true,
  // onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  // onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  // onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
})

defineExpose({
  table,
})

function innerSlot(name: string, renderSlot: () => VNode[] | undefined, renderDefault?: () => VNodeChild): { attrs: Record<string, any>, inner?: Inner } {
  const fromSlot = renderSlot()
  if (fromSlot?.length) {
    if (fromSlot.length > 1)
      throw new Error(`DataTable v-slot:${name} must have a single root element!`)
    const vnode = fromSlot[0]

    if (vnode.type === 'th' || vnode.type === 'td') {
      return {
        attrs: vnode.props ?? {},
        inner: h(Fragment, toArray(vnode.children as VNodeArrayChildren | string | null)),
      }
    }
    return {
      attrs: {},
      inner: vnode,
    }
  }
  return {
    attrs: {},
    inner: renderDefault && h(Fragment, toArray(renderDefault())),
  }
}

const headers = computed(() => {
  return table.getFlatHeaders().map((header) => {
    const { ref } = header.column.columnDef.meta as DataTableColumnDefMeta
    const headerDef = header.column.columnDef.header
    return {
      item: header,
      ...innerSlot(
        'header',
        () => ref.value?.slots.header?.(header.getContext()),
        typeof headerDef === 'string' ? () => header.column.columnDef.header as string : undefined,
      ),
    }
  })
})

const rows = computed(() => {
  return table.getRowModel().rows.map((row) => {
    const cells = row.getVisibleCells().map((cell) => {
      const { ref } = cell.column.columnDef.meta as DataTableColumnDefMeta

      return {
        item: cell,
        ...innerSlot(
          'cell',
          () => ref.value?.slots.cell?.(cell.getContext()),
          () => cell.getContext().renderValue() as VNodeChild,
        ),
      }
    })

    return {
      item: row,
      inner: function DataTableRowImpl() { return slottedItems('cell', 'td', cells) },
    }
  })
})

type Inner = (() => VNodeChild) | VNode

interface SlottedItem {
  inner?: Inner
  item: any
  attrs?: Record<string, any>
}

function slottedItems<K extends keyof typeof slots>(key: K, element: string, items: SlottedItem[]) {
  return items.flatMap((item) => {
    if (item.inner === undefined)
      return undefined

    if (slots[key]) {
      return slots[key]!({
        [key]: item.item,
        inner: item.inner,
        attrs: item.attrs ?? {},
      } as any)
    }

    return h(element, {
      key: item.item.id,
      ...item.attrs,
    }, typeof item.inner === 'function' ? (item.inner() ?? []) : [item.inner])
  })
}

function DataTableHeadersImpl() {
  return slottedItems('header', 'th', headers.value)
}

function DataTableRowsImpl() {
  return slottedItems('row', 'tr', rows.value)
}
</script>

<template>
  <table v-bind="$attrs">
    <thead>
      <component :is="DataTableHeadersImpl" />
    </thead>
    <tbody>
      <template v-if="rows.length">
        <component :is="DataTableRowsImpl" />
      </template>

      <tr v-else>
        <td :colspan="Object.keys(context.columns).length" h-24 text-center>
          No results.
        </td>
      </tr>
    </tbody>
  </table>
</template>
