<script setup lang="ts">
import { type TagFilter, TagType } from '#common'

const props = defineProps<{
  editDialog: any
}>()
const editing = defineModel<TagFilter | null>('editing')

const { filters } = useOption('hideTags')

const sorted = useSorted(filters, (a, b) => a.name.localeCompare(b.name))

const FiltersDataTable = useDataTable<TagFilter>()

console.log(props)
</script>

<template>
  <div mx="-4" relative>
    <div mx="sm:4" max-h-96 overflow-auto border rounded-md bg-default>
      <FiltersDataTable
        id="hideTags-filters"
        :data="sorted" text="sm"
        w-full
        class="[&_td,&_th]:(h-7 min-h-7 align-middle)"
      >
        <template #header="{ inner }">
          <th scope="col" sticky top-0 z-10 bg-default text-muted-fg font-medium>
            <div flex="~ items-center justify-center " h-8 border-b>
              <Render :render="inner" />
            </div>
          </th>
        </template>
        <template #row="{ inner, row }">
          <tr
            :data-state="row.isSelected && 'selected'"
            bg="state-selected:muted hover:muted/50"
            transition-colors
            class="[&:not(:last-child)]:border-b"
          >
            <Render :render="inner" />
          </tr>
        </template>
        <FiltersDataTable.Column accessor="invert">
          <template #cell="cell">
            <Tooltip>
              <div flex="~ items-center justify-center" h-full px-2 text="4">
                <Icon v-if="cell.value" i-tabler-eye-exclamation op100 label="Show" />
                <Icon v-else i-tabler-eye-off op40 label="Hide" />
              </div>
              <template #content>
                <span v-if="cell.value">Always show works with matching tags - even if matched by other filters.</span>
                <span v-else>Hide works with matching tags.</span>
              </template>
            </Tooltip>
          </template>
        </FiltersDataTable.Column>
        <FiltersDataTable.Column accessor="name">
          <template #cell="cell">
            <th scope="row">
              <div
                font="leading-[1em]"
                text="start"
                flex="~ items-center"
                my-0.5
              >
                <pre ws-pre-wrap>{{ cell.value }}</pre>
              </div>
            </th>
          </template>
          <template #header>
            <th colspan="2">
              Tag
            </th>
          </template>
        </FiltersDataTable.Column>
        <FiltersDataTable.Column accessor="type" header="Type">
          <template #cell="cell">
            <div text="xs tracking-tight center">
              <span>{{ cell.value ? TagType.toDisplayString(cell.value!) : 'Any' }}</span>
            </div>
          </template>
        </FiltersDataTable.Column>
        <FiltersDataTable.Column accessor="matcher" header="Matcher">
          <template #cell="cell">
            <Tooltip>
              <div flex="~ items-center justify-center" h-full px-2 text="4">
                <Icon v-if="cell.value === 'exact'" i-codicon-surround-with label="Exact" />
                <Icon v-else-if="cell.value === 'contains'" i-codicon-whole-word label="Contains" />
                <Icon v-else-if="cell.value === 'regex'" i-codicon-regex label="Regex" />
              </div>
              <template #content>
                <span v-if="cell.value === 'exact'">Matches if the tag is exactly the filter.</span>
                <span v-else-if="cell.value === 'contains'">Matches if the tag contains the filter. Often used for matching one person in a Relationship tag.</span>
                <span v-else-if="cell.value === 'regex'">Uses regular expressions to match the filter to the tag.</span>
              </template>
            </Tooltip>
          </template>
        </FiltersDataTable.Column>
        <FiltersDataTable.Column id="actions">
          <template #cell="cell">
            <div mr-4>
              <component
                :is="editDialog?.trigger"
                :id="`${cell.id}.edit`"
                text="4 muted-fg hover:default-fg"
                cursor-pointer
                :aria-labelledby="`${cell.id}.edit ${cell.row.cells.name.id}`"
              >
                <Icon i-codicon-edit label="Edit" />
              </component>
            </div>
          </template>
          <template #header>
            <span sr-only>Actions</span>
          </template>
        </FiltersDataTable.Column>
      </FiltersDataTable>
    </div>
  </div>
</template>
