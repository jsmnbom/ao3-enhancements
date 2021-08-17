<template lang="pug">
div(v-frag)
  v-autocomplete(
    v-model='syncOptions.readingListReadDateResolution',
    :items='items',
    outlined,
    hide-details,
    dense,
    label='Read date resolution',
    item-text='name',
    item-value='id'
  )
    template(#item='{item, attrs, on}')
      v-list-item(v-on='on', v-bind='attrs')
        v-list-item-content(v-if='item === "day"')
          v-list-item-title Day (default)
          v-list-item-subittle Store the day you read a chapter on
        v-list-item-content(v-if='item === "boolean"')
          v-list-item-title Boolean
          v-list-item-subittle Only store weather you have read a chapter or not
    template(#selection='{item}')
      span(v-if='item === "day"') Day
      span(v-if='item === "boolean"') Boolean
  sync-dialog-help(inset) Read date help
  div.wrap.mb-0
</template>

<script lang="ts">
import { Vue, Component, PropSync } from 'vue-property-decorator';

import { Options, READ_DATE_RESOLUTIONS } from '@/common/options';

import SyncDialogHelp from './SyncDialogHelp.vue';

@Component({ components: { SyncDialogHelp } })
export default class SyncDialogReadDateResolution extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  items = READ_DATE_RESOLUTIONS;
}
</script>

<style lang="scss" scoped>
.v-autocomplete ::v-deep .v-input__slot {
  padding-right: 32px !important;
}
</style>
