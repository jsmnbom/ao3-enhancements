<template lang="pug">
div(v-frag)
  v-checkbox.mt-0(
    v-model='syncOptions.readingListPrivateBookmarks',
    hide-details
  )
    template(#label)
      span Create bookmarks as private
      sync-help.ml-1.mt-0
        p When toggled on, Sync will create any new bookmarks as private, hiding them from public view. This only applies to future bookmarks that are created, if you would like to change the "publicness" of older bookmarks, please edit them on AO3.
  div
  div
</template>

<script lang="ts">
import { Vue, Component, PropSync } from 'vue-property-decorator';

import { Options } from '@/common/options';

import SyncHelp from './SyncHelp.vue';

@Component({ components: { SyncHelp } })
export default class SyncPrivateBookmarks extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
}
</script>