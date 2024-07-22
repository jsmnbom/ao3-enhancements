<script setup lang="ts">
import type { AuthorFilter } from '#common'

const FiltersDataTable = useDataTable<AuthorFilter>()

const { filters } = useOption('hideAuthors')
function renderData(filters: AuthorFilter[]) {
  return filters
    .map((filter, index) => [index, filter] as [number, AuthorFilter])
    .sort(([_ai, a], [_bi, b]) => a.userId.localeCompare(b.userId))
}

const context = OptionRowHideAuthorsContext.inject()
</script>

<template>
  <div mx="-4" relative mt-4>
    <div mx="sm:4" max-h-96 overflow-auto border rounded-md bg-default>
      <FiltersDataTable
        id="hideAuthors-filters"
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
            <th w-1 scope="row">
              <Tooltip>
                <div flex="~ items-center justify-center" text="4" h-full w-min px-2>
                  <Icon v-if="cell.value" i-tabler-eye-exclamation op100 label="Show" />
                  <Icon v-else i-tabler-eye-off op40 label="Hide" />
                </div>
                <template #content>
                  <span v-if="cell.value">Always show works with matching authors - even if matched by other filters.</span>
                  <span v-else>Hide works with matching authors.</span>
                </template>
              </Tooltip>
            </th>
          </template>
        </FiltersDataTable.Column>
        <FiltersDataTable.Column accessor="userId">
          <template #cell="cell">
            <th scope="row">
              <div
                text="start"
                flex="~ items-center"
                ws-nowrap
              >
                <pre font="leading-[1em]" my-0.5 ws-pre-wrap>{{ cell.value }}</pre>
              </div>
            </th>
          </template>
          <template #header>
            <th colspan="2">
              User ID
            </th>
          </template>
        </FiltersDataTable.Column>
        <FiltersDataTable.Column accessor="pseud" header="Pseud">
          <template #cell="cell">
            <div text="xs tracking-tight center">
              <pre>{{ cell.value }}</pre>
            </div>
          </template>
        </FiltersDataTable.Column>
        <FiltersDataTable.Column id="actions">
          <template #cell="cell">
            <td w-1>
              <div mx-4 w-min>
                <DialogDetachedTrigger
                  v-if="context.editDialog.value"
                  :id="`${cell.id}.edit`"
                  :dialog="context.editDialog.value"
                  class="input-ring"
                  text="4 muted-fg hover:default-fg"
                  cursor-pointer rounded-md
                  :aria-labelledby="`${cell.id}.edit ${cell.row.cells.userId.id}`"
                  @click="context.edit?.(cell.row.data)"
                >
                  <Icon i-codicon-edit label="Edit" />
                </DialogDetachedTrigger>
              </div>
            </td>
          </template>
          <template #header>
            <button
              class="btn"
              text="5"
              h-6 w-6
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
