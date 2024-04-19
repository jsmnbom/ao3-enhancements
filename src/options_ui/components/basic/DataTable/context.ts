import type { ColumnDef } from '@tanstack/vue-table'
import type { MaybeRefOrGetter } from '@vueuse/core'
import type { VNode } from 'vue'

import type { DataTableColumnSlots } from './types.ts'

export interface DataTableColumnDefMeta { vnode: VNode, ref: Ref<{ slots: DataTableColumnSlots<any, any> } | undefined> }
export type DataTableColumnDef = ColumnDef<any, any> & { meta: DataTableColumnDefMeta }

interface DataTableContext {
  data: MaybeRefOrGetter<object[]>
  columns: DataTableColumnDef[]
}

export const dataTableContext = createContext<DataTableContext>('DataTable')
