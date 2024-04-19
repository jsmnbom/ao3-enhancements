import type { AccessorColumnDef, DisplayColumnDef } from '@tanstack/vue-table'
import { camelize } from '@vueuse/core'
import { defineComponent, h } from 'vue'

import { dataTableContext } from './context.ts'
import DataTableColumn from './DataTableColumn.vue'
import DataTableImpl from './DataTableImpl.vue'
import type { DataTable, DataTableAccessorColumn, DataTableDisplayColumn } from './types.ts'

export function useDataTable<const TData extends object>() {
  const DataTable = defineComponent({
    setup(props, ctx) {
      const columnVNodes = ctx.slots.columns?.() ?? []

      if (!columnVNodes.length)
        throw new Error('DataTable must have at least one column')

      const columns = columnVNodes.map((vnode) => {
        if (vnode.type === DataTableColumn)
          return { ...keysToCamelKebabCase(vnode.props ?? {}) as AccessorColumnDef<TData> | DisplayColumnDef<TData>, meta: { vnode, ref: ref() } }
        throw new Error('useDataTable() v-slot:column children must only be .column.accessor or .column.display')
      })

      dataTableContext.provide({
        data: toRef(props, 'data'),
        columns,
      })

      return () => [
        ...columns.map(column => h(column.meta.vnode, { key: column.id, ref: column.meta.ref })),
        h(DataTableImpl, { ...ctx.attrs }, {
          default: () => [],
          cell: ctx.slots.cell,
          row: ctx.slots.row,
          header: ctx.slots.header,
        }),
      ]
    },
    name: 'DataTableWrapper',
    props: {
      data: {
        type: Array as PropType<TData[]>,
        required: true,
      },
    },
  }) as unknown

  const composable = Object.assign(DataTable as DataTable<TData>, {
    column: {
      accessor: DataTableColumn as unknown as DataTableAccessorColumn<TData>,
      display: DataTableColumn as unknown as DataTableDisplayColumn<TData>,
    },
  })
  return composable
}

function keysToCamelKebabCase(obj: Record<string, any>) {
  const newObj: typeof obj = {}
  for (const key in obj)
    // eslint-disable-next-line ts/no-unsafe-assignment
    newObj[camelize(key)] = obj[key]
  return newObj
}
