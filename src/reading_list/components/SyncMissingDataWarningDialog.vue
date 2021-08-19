<template lang="pug">
v-dialog(
  :value='visible',
  max-width='600px',
  persistent,
  :fullscreen='$vuetify.breakpoint.xsOnly'
): v-card
  v-toolbar(
    color='secondary',
    dark,
    dense,
    style='position: sticky; top: 0; z-index: 10'
  )
    v-toolbar-title Missing data
  v-divider
  v-card-text
    p.text-h6.mb-0.text--primary Sync is missing data from {{ count }} works
    p It looks like you have recently added a lot of works to your reading list. Sync has created bookmarks for each of these works to be able to easily fetch data for them, but unfortunately it seems that AO3 has not updated the list of bookmarks yet. You now have 3 choices:
    ul
      li #[em Abort the sync entirely], and try again later if you want.
      li #[em Force Sync to fetch the data]. It will do this by vising each of the {{ count }} work pages #[em slowly] in sequence to reduce the strain on AO3's servers.
      li #[em Continue sync with the data missing]. The newly added works will not have proper title or author, but at least they will be in your list. The works will automatically update their data when you visit their work page or see them elsewhere on AO3, or you can run another sync in the future once AO3 updates the bookmarks index (usually takes up to an hour).
  v-card-actions
    v-spacer
    v-btn(color='error', plain, @click='$emit("resolve", "abort")') Abort sync
    v-btn(color='warning', plain, @click='$emit("resolve", "force")') Force
    v-btn(color='primary', @click='$emit("resolve", "blank")') Continue
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mdiClose } from '@mdi/js';

@Component({
  components: {},
})
export default class SyncMissingDataWarningDialog extends Vue {
  @Prop() count!: number;
  @Prop() visible!: boolean;

  icons = {
    mdiClose,
  };
}
</script>