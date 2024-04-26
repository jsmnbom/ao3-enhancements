<script setup lang="ts">
const { enabled } = useOption('hideTags')

OptionRowHideTagsContext.provide({
  editDialog: ref(null),
})
</script>

<template>
  <OptionRowCollapsable
    v-model:open="enabled"
    title="Based on work tags"
    subtitle="Hide tags based on the tags of the work"
  >
    <OptionRowHideTagsTable />
    <OptionRowHideTagsEditDialog />
    <Dialog>
      <DialogTrigger as-child>
        <Button variant="link" mb-6 mt-2>
          Open notes/help on tag filtering.
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>
          Tag filtering notes
        </DialogTitle>
        <div flex="~ col" class="[&_h2]:(text-lg font-medium) [&_p]:(text-sm)">
          <h2 py-1>
            How to use
          </h2>
          <p>
            Tag filtering works by hiding works that have tags that match the filters you set.
            Filtering works by first hiding works marked as <Icon i-tabler-eye-off op40 label="Hide" title="Hide" />,
            then explicitly unhiding marked as <Icon i-tabler-eye-exclamation op100 label="Show" title="Show" />.
          </p>
          <h2 mt-6 py-1>
            Limitations
          </h2>
          <div flex="~ col gap-2">
            <p>
              Note that AO3 enhancements currently has no way to properly resolve <ArchiveLink path="/faq/tags#canonicalhow">wrangled tags</ArchiveLink>.
              You may need to add multiple variants of the "same" tag.
            </p>
            <p>
              Tags of the type `Warning` and `Additional Tag` will <em font="medium">not</em> work if your AO3 account has
              <ArchivePreferenceLink id="hide_warnings" label="Hide warnings" /> and
              <ArchivePreferenceLink id="hide_freeform" label="Hide additional tags" /> preferences enabled respectively.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </OptionRowCollapsable>
</template>
