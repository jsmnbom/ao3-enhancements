import DataTableColumnImpl from './_DataTableColumnImpl.vue'
import DataTableWrapper from './DataTableWrapper.ts'
import type { DataTable, DataTableColumn } from './types.ts'

export function useDataTable<const TData extends object>() {
  const DataTable = DataTableWrapper as unknown
  const composable = Object.assign(DataTable as DataTable<TData>, {
    Column: DataTableColumnImpl as unknown as DataTableColumn<TData>,
  })
  return composable
}
