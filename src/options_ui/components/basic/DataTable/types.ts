import type { Cell, CellContext, ColumnDefBase, Header, HeaderContext, Row } from '@tanstack/vue-table'
import type { AllowedComponentProps, ComponentCustomProps, IntrinsicElementAttributes, RenderFunction, Slot, VNodeProps } from 'vue'

export interface DataTableProps<TData extends object> {
  data: TData[]
}

export interface DataTableColumnBaseProps<TData, TValue> extends Omit<ColumnDefBase<TData, TValue>, 'cell' | 'header' | 'footer'> {
  header?: string
}
export type DataTableColumnAccessorProps<TData, TAccessor = keyof TData | ((row: TData, index: number) => unknown)> = TAccessor extends keyof TData ? { accessorKey: TAccessor } : { id: string, accessorFn: TAccessor }
export interface DataTableDisplayColumnProps { id: string }

export interface DataTableColumnSlots<TData, TValue> {
  cell?: Slot<CellContext<TData, TValue>>
  header?: Slot<HeaderContext<TData, TValue>>
}

export interface DataTableSlots {
  columns: Slot
  header?: Slot<{ inner: RenderFunction, attrs: Record<string, any>, header: Header<any, unknown> }>
  row?: Slot<{ inner: RenderFunction, row: Row<any> }>
  cell?: Slot<{ inner: RenderFunction, attrs: Record<string, any>, cell: Cell<any, unknown> }>
}

export type DataTable<TData extends object> = (
  props: DataTableProps<TData> & IntrinsicElementAttributes['table'] & VNodeProps & AllowedComponentProps & ComponentCustomProps,
  ctx: {
    slots: DataTableSlots
    emits: any
  }
) => VNode & { __ctx: { props: typeof props } & typeof ctx }

export type DataTableAccessorColumn<TData extends object> = <TAccessor extends keyof TData | ((row: TData, index: number) => unknown)>(
  props: DataTableColumnAccessorProps<TData, TAccessor> & DataTableColumnBaseProps<TData, ExtractValueFromAccessor<TData, TAccessor>> & VNodeProps & AllowedComponentProps & ComponentCustomProps,
  ctx: {
    slots: DataTableColumnSlots<TData, ExtractValueFromAccessor<TData, TAccessor>>
  }
) => VNode & { __ctx: {
  props: DataTableColumnAccessorProps<TData, TAccessor> & DataTableColumnBaseProps<TData, ExtractValueFromAccessor<TData, TAccessor>> & VNodeProps & AllowedComponentProps & ComponentCustomProps
  slots: DataTableColumnSlots<TData, ExtractValueFromAccessor<TData, TAccessor>>
} }

export type DataTableDisplayColumn<TData extends object> = (
  props: DataTableDisplayColumnProps & DataTableColumnBaseProps<TData, never> & VNodeProps & AllowedComponentProps & ComponentCustomProps,
  ctx: {
    slots: DataTableColumnSlots<TData, never>
  }
) => VNode & { __ctx: { props: typeof props } & typeof ctx }

type ExtractValueFromAccessor<TData, TAccessor> = TAccessor extends keyof TData
  ? TData[TAccessor]
  : TAccessor extends (row: TData, index: number) => infer TValue
    ? TValue
    : never
