import { getProperty, setProperty } from 'dot-prop'
import { Text, type VNode, type VNodeArrayChildren, type VNodeChild, h } from 'vue'

import DataTableInfer from './_DataTableInfer.vue'
import type { ColumnContext, ColumnExposed, HeaderContext, RowContext, TableProps, TableSlots, WritableCellContextRef } from './types.ts'

interface RenderFunc { name: string, defaultType: string, renderSlot: (inner: VNodeChild) => VNode[] | undefined }
interface Unwrapped { attrs?: Record<string, unknown>, type?: string, inner: VNodeChild }

function unwrapSlot(name: string, fromSlot: VNode[]): Unwrapped {
  if (fromSlot.length > 1)
    throw new Error(`${name} must have a single root element!`)
  const vnode = fromSlot[0]
  if (vnode.type === 'th' || vnode.type === 'td' || vnode.type === 'tr') {
    return {
      attrs: vnode.props ?? {},
      type: vnode.type,
      inner: vnode.children as VNodeArrayChildren,
    }
  }
  return { inner: vnode }
}

function renderItem({ name, defaultType, renderSlot, inner, attrs = {}, type = undefined }: Unwrapped & RenderFunc) {
  const fromSlot = renderSlot(inner)
  if (fromSlot) {
    const unwrappedSlot = unwrapSlot(`DataTable v-slot:${name}`, fromSlot)
    type = type ?? unwrappedSlot.type
    attrs = { ...attrs, ...unwrappedSlot.attrs }
    inner = unwrappedSlot.inner
  }
  type = type ?? defaultType

  return h(type, attrs, inner!)
}

function renderColumnItem({ name, defaultType, renderSlot, inner, attrs = {} }: { inner: VNode[] | undefined, attrs: Record<string, unknown> } & RenderFunc) {
  if (!inner)
    return []

  const unwrapped = unwrapSlot(`DataTable.Column v-slot:${name}`, inner)
  return renderItem({ name, defaultType, renderSlot, ...unwrapped, attrs: { ...attrs, ...unwrapped.attrs } })
}

function createColumnContext(column: ColumnExposed): ColumnContext {
  return {
    props: column.props,
  }
}

function createHeaderContext(id: string, column: ColumnContext): HeaderContext {
  return {
    id,
    column,
  }
}

function createRowContext(id: string, data: object, index: number): Omit<RowContext, 'cells'> {
  return {
    id,
    data,
    index,
    isSelected: false,
  }
}

function createCellContext(id: string, column: ColumnContext, row: RowContext): WritableCellContextRef {
  const baseContext = {
    id,
    column,
    row,
  }

  const cellRef = (column.props.accessor !== undefined
    ? computed({
      get: () => getProperty(row.data, column.props.accessor!),
      set: v => setProperty(row.data, column.props.accessor!, v),
    })
    : {}) as Ref<any>

  return extendRef(cellRef, baseContext, { unwrap: false }) as unknown as WritableCellContextRef
}

export default defineComponent({
  name: 'DataTableImpl',
  inheritAttrs: false,
  // eslint-disable-next-line ts/no-unsafe-assignment
  props: { ...DataTableInfer.props, columns: Array },

  setup(__props, ctx) {
    const props = __props as TableProps & { columns: ColumnExposed[] }
    const slots = ctx.slots as TableSlots

    return () => {
      const columns = props.columns.map(column => ({
        ...column,
        context: createColumnContext(column),
      }))

      return h('table', ctx.attrs, [
        h('thead', {}, [
          h('tr', {}, columns.map((column) => {
            const header = createHeaderContext(`${props.id}-header-${column.props.id}`, column.context)

            return renderColumnItem({
              name: 'header',
              defaultType: 'th',
              renderSlot: inner => slots.header?.({ inner, header }),
              inner: column.slots.header?.(header) ?? (column.props.header !== undefined ? [h(Text, column.props.header)] : undefined),
              attrs: { id: header.id },
            })
          })),
        ]),
        h('tbody', {}, props.data.map((rowData, index) => {
          const rowBase = createRowContext(`${props.id}-row-${index}`, rowData, index)
          const cells = columns.map(column => ({
            column,
            cell: createCellContext(`${props.id}-cell-${column.props.id}-${index}`, column.context, rowBase as RowContext),
          }))
          const row: RowContext = Object.assign(rowBase, { cells: Object.fromEntries(cells.map(cell => [cell.column.props.id, cell.cell])) })

          const inner = cells.map(({ column, cell }) => {
            return renderColumnItem({
              name: 'cell',
              defaultType: 'td',
              renderSlot: inner => slots.cell?.({ inner, cell }),
              inner: column.slots.cell?.(cell) ?? (cell.value ? [h(Text, cell.value as string)] : (() => { throw new Error(`No cell rendering for column ${column.props.id}`) })()),
              attrs: { id: cell.id },
            })
          })

          return renderItem({
            name: 'row',
            defaultType: 'tr',
            renderSlot: inner => slots.row?.({ inner, row }),
            inner,
            attrs: { id: row.id },
          })
        })),
      ])
    }
  },
})
