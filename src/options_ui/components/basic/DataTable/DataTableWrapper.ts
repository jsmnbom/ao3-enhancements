import { partition } from '@antfu/utils'
import { h } from 'vue'

import DataTableColumnImpl from './_DataTableColumnImpl.vue'
import DataTableInfer from './_DataTableInfer.vue'
import DataTableImpl from './DataTableImpl.ts'
import type { ColumnExposed } from './types.ts'

export default defineComponent({
  name: 'DataTableWrapper',
  inheritAttrs: false,
  // eslint-disable-next-line ts/no-unsafe-assignment
  props: DataTableInfer.props,
  setup(props, ctx) {
    const vNodes = ctx.slots.default?.() ?? []

    const [columnNodes, nodes] = partition(vNodes, vNode => vNode.type === DataTableColumnImpl)
    const columns = ref<ColumnExposed<object>[]>([])

    if (!columnNodes.length)
      throw new Error('DataTable must have at least one column')

    return () => [
      ...nodes,
      ...columnNodes.map((vNode, index) => h(vNode, { ref: column => columns.value[index] = column as unknown as ColumnExposed<object> })),
      h(DataTableImpl, { ...props, ...ctx.attrs, columns: columns.value }, {
        default: () => {},
        cell: ctx.slots.cell,
        row: ctx.slots.row,
        header: ctx.slots.header,
      }),
    ]
  },
})
