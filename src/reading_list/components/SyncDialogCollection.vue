<template lang="pug">
div(v-frag)
  v-autocomplete(
    v-model='syncOptions.readingListCollectionId',
    :disabled='!syncOptions.readingListPsued',
    :items='items',
    :loading='loading',
    @focus='fetchItems',
    outlined,
    dense,
    label='Collection',
    hide-details
  )
  sync-dialog-help(inset) Collection help
  sync-dialog-collection-create(
    :options.sync='syncOptions',
    @create='createdId = $event'
  )
</template>

<script lang="ts">
import { Vue, Component, PropSync, Watch } from 'vue-property-decorator';

import { Options } from '@/common/options';
import { fetchAndParseDocument } from '@/common/utils';

import SyncDialogHelp from './SyncDialogHelp.vue';
import SyncDialogCollectionCreate from './SyncDialogCollectionCreate.vue';

@Component({ components: { SyncDialogHelp, SyncDialogCollectionCreate } })
export default class SyncDialogCollection extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  createdId: string | null = null;

  loading = false;
  hasLoaded = false;

  search: null | string = null;

  items: string[] = [];

  @Watch('syncOptions.readingListPsued')
  onPseudChange(): void {
    this.items = [];
    this.hasLoaded = false;
    this.syncOptions.readingListCollectionId = null;
  }

  @Watch('createdId')
  onCreatedIdChange(): void {
    this.items = [];
    this.hasLoaded = false;
    this.loading = false;
    this.fetchItems()
      .then(() => {
        const find = this.items.find((item) => item === this.createdId);
        if (find) {
          Vue.set(this.syncOptions, 'readingListCollectionId', find);
        }
      })
      .catch((e) => console.error(e));
  }

  mounted(): void {
    if (this.syncOptions.readingListCollectionId) {
      this.items = [this.syncOptions.readingListCollectionId];
    }
  }

  fetchItems(): Promise<void> {
    if (this.hasLoaded || !this.syncOptions.user || this.loading)
      return Promise.resolve();
    this.loading = true;
    this.hasLoaded = true;

    return fetchAndParseDocument(
      `https://archiveofourown.org/users/${this.syncOptions.user.username}/collections`
    )
      .then((doc) => {
        const collections: string[] = Array.from(
          doc.querySelectorAll('.collection.index .collection')
        )
          .filter((collection) =>
            collection
              .querySelector('a:nth-of-type(2)')!
              .textContent!.startsWith(this.syncOptions.readingListPsued!.name)
          )
          .map((collection) =>
            collection.querySelector('.name')!.textContent!.slice(1, -1)
          );
        this.items = collections;
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => (this.loading = false));
  }
}
</script>

<style lang="scss" scoped>
.v-autocomplete ::v-deep .v-input__slot {
  padding-right: 32px !important;
}
</style>