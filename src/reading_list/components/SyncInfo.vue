<template lang="pug">
v-list
  v-subheader The AO3 Enhancements Reading List Sync feature is responsible for two things:
  v-list-item: v-list-item-content
    v-list-item-title Work updates
    v-list-item-subtitle.text-wrap Using native AO3 bookmarks, AO3 Enhancements is able to easily check if any of the works on your reading list have been updated, and will update the reading list accordingly.
  v-divider
  v-list-item: v-list-item-content
    v-list-item-title Cross device sync
    v-list-item-subtitle.text-wrap Your Reading List will be uploaded to AO3, so if you install this extension on another device and configure it the same, your reading list can be easily synced.
  v-subheader 
    | For more info on the Reading List sync please see the deticated&nbsp;
    a(
      href='https://github.com/jsmnbom/ao3-enhancements/wiki/Reading-List-and-Sync-FAQ',
      target='_blank'
    ) FAQ page
    | .
  v-subheader Press the button below to get started.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component
export default class SyncInfo extends Vue {}
</script>

<style lang="scss" scoped>
.v-list {
  ::v-deep .v-list-item,
  ::v-deep .v-subheader {
    padding: 0;
  }
  ::v-deep .v-subheader {
    height: 32px;
  }
}
</style>