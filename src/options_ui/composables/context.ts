import type { TagFilter } from '#common'

export const OptionLabelId = createContext<string>('OptionLabelId')

export const OptionRowHideTagsContext = createContext<{
  editDialog: Ref<ComponentInstance['Dialog'] | null>
  edit?: (value?: TagFilter) => void
}>('OptionRowHideTags')
