<script setup lang="ts">
import { type TagFilter, TagType } from '#common'

const FiltersDataTable = useDataTable<TagFilter>()

const { filters } = useOption('hideTags')
function renderData(filters: TagFilter[]) {
  return filters
    .map((filter, index) => [index, filter] as [number, TagFilter])
    .sort(([_ai, a], [_bi, b]) => a.name.localeCompare(b.name))
}

const context = OptionRowHideTagsContext.inject()
</script>

<template>
  <div mx="-4" relative>
    <div mx="sm:4" max-h-96 overflow-auto border rounded-md bg-default>
      <FiltersDataTable
        id="hideTags-filters"
        :data="filters"
        :render-data="renderData"
        text="sm"
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
            bg="hover:muted/50"
            transition-colors
            class="[&:not(:last-child)]:border-b"
            @dblclick="context.edit?.(row.data)"
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
                text="start"
                flex="~ items-center"
                ws-nowrap
              >
                <pre font="leading-[1em]" my-0.5 ws-pre-wrap>{{ cell.value }}</pre>
                <Tooltip v-if="cell.row.data.matcher !== 'exact'">
                  <div
                    flex="~ items-center justify-center"
                    border="1 primary"
                    bg="primary op30"
                    mx-1 h-5 w-5 rounded-md
                  >
                    <Icon v-if="cell.row.data.matcher === 'contains'" i-codicon-whole-word label="Contains" />
                    <Icon v-else-if="cell.row.data.matcher === 'regex'" i-codicon-regex label="Regex" />
                  </div>
                  <template #content>
                    <span v-if="cell.row.data.matcher === 'contains'">Matches if the tag contains the filter. Often used for matching one person in a Relationship tag.</span>
                    <span v-else-if="cell.row.data.matcher === 'regex'">Uses regular expressions to match the filter to the tag.</span>
                  </template>
                </Tooltip>
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
              <span ws-nowrap>{{ cell.value ? TagType.toDisplayString(cell.value!) : 'Any' }}</span>
            </div>
          </template>
        </FiltersDataTable.Column>
        <FiltersDataTable.Column id="actions">
          <template #cell="cell">
            <div mx-4>
              <DialogDetachedTrigger
                v-if="context.editDialog.value"
                :id="`${cell.id}.edit`"
                :dialog="context.editDialog.value"
                class="button-focus-ring"
                text="4 muted-fg hover:default-fg"
                cursor-pointer rounded-md
                :aria-labelledby="`${cell.id}.edit ${cell.row.cells.name.id}`"
                @click="context.edit?.(cell.row.data)"
              >
                <Icon i-codicon-edit label="Edit" />
              </DialogDetachedTrigger>
            </div>
          </template>
          <template #header>
            <button
              class="button-focus-ring"
              flex="~ items-center justify-center"
              bg="hover:input"
              text="5"
              h-6 w-6 cursor-pointer rounded-md
              @click="context.edit?.()"
            >
              <Icon i-mdi-plus-box label="Add new filter" />
            </button>
          </template>
        </FiltersDataTable.Column>
      </FiltersDataTable>
    </div>
  </div>
</template>
