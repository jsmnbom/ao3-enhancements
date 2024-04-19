<script setup lang="ts">
import { type TagFilter, TagType } from '#common'

import OptionRowHideTagsCellMatcher from './OptionRowHideTagsCellMatcher.vue'

const { enabled, filters } = useOption('hideTags')

const FiltersDataTable = useDataTable<TagFilter>()
</script>

<template>
  <OptionRowCollapsable
    v-model:open="enabled"
    title="Based on work tags"
    subtitle="Hide tags based on the tags of the work"
  >
    <div overflow-hidden border rounded-md bg-default>
      <FiltersDataTable :data="filters" text="sm" w-full>
        <template #header="{ inner, attrs }">
          <th h-8 border-b px-4 align-middle text-muted-fg font-medium v-bind="attrs">
            <component :is="inner" />
          </th>
        </template>
        <template #row="{ inner, row }">
          <tr
            :data-state="row.getIsSelected() && 'selected'"
            bg="state-selected:bg-muted hover:bg-muted/50"
            h-7 min-h-7 transition-colors
            class="[&:not(:last-child)]:border-b [&>:first-child]:pl-2! [&>:last-child]:pr-2!"
          >
            <component :is="inner" />
          </tr>
        </template>
        <template #cell="{ inner, attrs }">
          <td class="align-middle" v-bind="attrs">
            <component :is="inner" />
          </td>
        </template>
        <template #columns>
          <FiltersDataTable.column.accessor id="invert" :accessor-fn="(tagFilter) => tagFilter.invert">
            <template #cell="{ getValue }">
              <td w-8 align-middle>
                <div flex="~ items-center " h-full>
                  <IconTablerEyeOff v-if="getValue()" h-5 w-5 op40 />
                  <IconTablerEyeExclamation v-else h="5" w-5 op100 />
                </div>
              </td>
            </template>
          </FiltersDataTable.column.accessor>
          <FiltersDataTable.column.accessor accessor-key="name">
            <template #cell="{ getValue }">
              <span>{{ getValue() }}</span>
            </template>
            <template #header>
              <th colspan="2">
                Tag
              </th>
            </template>
          </FiltersDataTable.column.accessor>
          <FiltersDataTable.column.accessor accessor-key="type" header="Type">
            <template #cell="{ getValue }">
              <span h-8 flex="~ items-center justify-center">
                {{ getValue() ? TagType.toDisplayString(getValue()!) : 'Any' }}
              </span>
            </template>
          </FiltersDataTable.column.accessor>
          <FiltersDataTable.column.accessor accessor-key="matcher" header="Matcher">
            <template #cell="cell">
              <td w-18 align-middle>
                <OptionRowHideTagsCellMatcher :context="cell" />
              </td>
            </template>
          </FiltersDataTable.column.accessor>
        </template>
      </FiltersDataTable>
    </div>

    <p text="muted-fg xs" py-3>
      Note that AO3 enhancements currently has no way to properly resolve <ArchiveLink path="/faq/tags#canonicalhow">wrangled tags</ArchiveLink>. You may need to add multiple variants of the "same" tag.
    </p>
    <p text="muted-fg xs" pb-6>
      Tags of the type `Warning` and `Additional Tag` will <em font="medium">not</em> work if your AO3 account has
      <ArchivePreferenceLink id="hide_warnings" label="Hide warnings" /> and
      <ArchivePreferenceLink id="hide_freeform" label="Hide additional tags" /> preferences enabled respectively.
    </p>
  </OptionRowCollapsable>
</template>
