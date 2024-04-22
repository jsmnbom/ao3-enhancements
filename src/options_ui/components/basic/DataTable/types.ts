import type { AllowedComponentProps, ComponentCustomProps, IntrinsicElementAttributes, RenderFunction, Slot, VNode, VNodeChild, VNodeProps, WritableComputedRef } from 'vue'

type Renderable = VNodeChild | RenderFunction
type Data = Record<string, any>
type Path<TData extends Record<string, any>> = DeepObjectOnlyPaths<TData> | undefined

export interface TableProps<TData extends Data = Data> {
  data: TData[]
  id?: string
}

export interface ColumnProps<TData extends Data = Data, TPath extends Path<TData> = Path<TData>> {
  header?: string
  id?: string
  accessor?: TPath
}

export interface ColumnPropsResolved<TData extends Data = Data, TPath extends Path<TData> = Path<TData>> {
  header?: string
  accessor: TPath
  id: string
}

export interface ColumnContext<TData extends Data = Data, TPath extends Path<TData> = Path<TData>> {
  props: ColumnPropsResolved<TData, TPath>
}

export interface HeaderContext<TData extends Data = Data, TPath extends Path<TData> = Path<TData>> {
  column: ColumnContext<TData, TPath>
  id: string
}

export interface RowContext<TData extends Data = Data> {
  data: TData
  index: number
  isSelected: boolean
  id: string
  cells: Record<string, WritableCellContextRef>
}

export type WritableCellContextRef<TData extends Data = Data, TPath extends Path<TData> = Path<TData>, TValue = TPath extends DeepObjectOnlyPaths<TData> ? PickDeepObjectOnlyPaths<TData, TPath> : undefined> = {
  column: ColumnContext<TData, TPath>
  row: RowContext<TData>
  id: string
} & (TPath extends DeepObjectOnlyPaths<TData> ? WritableComputedRef<TValue> : { value: never })

export interface ColumnSlots<TData extends Data = Data, TPath extends Path<TData> = Path<TData>> {
  cell?: Slot<WritableCellContextRef<TData, TPath>>
  header?: Slot<HeaderContext<TData, TPath>>
}

export interface TableSlots<TData extends Data = Data> {
  default?: () => DataTableColumn<TData>[]
  header?: Slot<{ inner: Renderable, header: HeaderContext<TData> }>
  row?: Slot<{ inner: Renderable, row: RowContext<TData> }>
  cell?: Slot<{ inner: Renderable, cell: WritableCellContextRef<TData> }>
}

export type DataTable<TData extends Data = Data> = (
  props: TableProps<TData> & IntrinsicElementAttributes['table'] & VNodeProps & AllowedComponentProps & ComponentCustomProps,
  ctx: {
    slots: TableSlots<TData>
    emits: any
  }
) => VNode & { __ctx: { props: typeof props } & typeof ctx }

export type DataTableColumn<TData extends Data = Data> = (<TPath extends Path<TData> = Path<TData>>(
  props: ColumnProps<TData, TPath> & VNodeProps & AllowedComponentProps & ComponentCustomProps,
  ctx: {
    slots: ColumnSlots<TData, TPath>
  }
) => VNode & { __ctx: { props: typeof props } & typeof ctx })

export interface ColumnExposed<TData extends Data = Data, TPath extends Path<TData> = Path<TData>> {
  props: ColumnPropsResolved<TData, TPath>
  slots: ColumnSlots<TData, TPath>
}

export type DeepObjectOnlyPaths<T> =
  T extends any[]
    ? never
    : T extends object
      ? DeepObjectOnlyPathsInternal<T>
      : never

type DeepObjectOnlyPathsInternal<T extends object> = {
  [Key in keyof T]: Key extends string ? `${Key}` | `${Key}.${DeepObjectOnlyPaths<T[Key]>}` : never
}[keyof T]

export type PickDeepObjectOnlyPaths<T, TPath extends DeepObjectOnlyPaths<T>> = PickDeepObjectOnlyPathsInternal<T, TPath>

type PickDeepObjectOnlyPathsInternal<T, TPath extends string> =
  TPath extends keyof T
    ? T[TPath]
    : TPath extends `${infer Key}.${infer Rest}`
      ? Key extends keyof T
        ? PickDeepObjectOnlyPathsInternal<T[Key], Rest>
        : never
      : never
