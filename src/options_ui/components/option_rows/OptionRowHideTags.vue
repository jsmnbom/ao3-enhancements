<script setup lang="ts">
import { createColumnHelper } from '@tanstack/vue-table'

import type { TagFilter } from '#common'

const { enabled, filters } = useOption('hideTags')

const helper = createColumnHelper<TagFilter>()

const columns = [
  helper.accessor('name', {
    header: 'Tag',
  }),
  helper.accessor('type', {
    header: 'Type',
  }),
  helper.accessor('invert', {
    header: 'Show/Hide',
  }),
]
</script>

<template>
  <OptionRowCollapsable
    v-model:open="enabled"
    title="Based on work tags"
    subtitle="Hide tags based on the tags of the work"
  >
    <div mb-3>
      <p text="muted-fg sm" py-2>
        <span inline-block rounded-md border-1 px-2 pt-1px pb-2px>show</span> filters apply after <span inline-block rounded-md border-1 px-2 pt-1px pb-2px>hide</span> filters, and will take precedence when a work matches both.
      </p>
    </div>
    <DataTable :data="filters" :columns="columns" />

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
