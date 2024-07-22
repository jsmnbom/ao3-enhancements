<script setup lang="ts">
const { enabled } = useOption('hideAuthors')

OptionRowHideAuthorsContext.provide({
  editDialog: ref(null),
})
</script>

<template>
  <OptionRowCollapsable
    v-model:open="enabled"
    title="Author"
    subtitle="Hide works written by certain authors/pseudonyms"
  >
    <OptionRowHideAuthorsTable />
    <OptionRowHideAuthorsEditDialog />
  </OptionRowCollapsable>
</template>
