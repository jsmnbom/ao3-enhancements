import type { ComponentInstance, GlobalComponents, Ref } from 'vue'

import type { AuthorFilter, TagFilter } from '#common'

export const OptionLabelId = createContext<string>('OptionLabelId')

export const OptionRowHideTagsContext = createContext<{
  editDialog: Ref<ComponentInstance<GlobalComponents['Dialog']> | null>
  edit?: (value?: TagFilter) => void
  remove?: (value: TagFilter) => void
}>('OptionRowHideTags')

export const OptionRowHideAuthorsContext = createContext<{
  editDialog: Ref<ComponentInstance<GlobalComponents['Dialog']> | null>
  edit?: (value?: AuthorFilter) => void
  remove?: (value: AuthorFilter) => void
}>('OptionRowHideAuthors')
