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
  sync-help(inset) Sync uses a collection to store data such as the read status of a work, and which chapters you have read. It is highly recommended to just press "Create New" and use the defaults unless you know what you are doing.
  sync-collection-create(
    :options.sync='syncOptions',
    @create='createdId = $event'
  )
</template>

<script lang="ts">
import { Vue, Component, PropSync, Watch } from 'vue-property-decorator';

import { Options } from '@/common/options';
import { fetchAndParseDocument } from '@/common/utils';

import SyncHelp from './SyncHelp.vue';
import SyncCollectionCreate from './SyncCollectionCreate.vue';

@Component({ components: { SyncHelp, SyncCollectionCreate } })
export default class SyncCollection extends Vue {
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
  async onCreatedIdChange(): Promise<void> {
    this.items = [];
    this.hasLoaded = false;
    this.loading = false;
    await this.fetchItems();
    const find = this.items.find((item) => item === this.createdId);
    if (find) {
      Vue.set(this.syncOptions, 'readingListCollectionId', find);
    }
  }

  mounted(): void {
    if (this.syncOptions.readingListCollectionId) {
      this.items = [this.syncOptions.readingListCollectionId];
    }
  }

  async fetchItems(): Promise<void> {
    if (this.hasLoaded || !this.syncOptions.user || this.loading) return;
    this.loading = true;
    this.hasLoaded = true;
    try {
      const doc = await fetchAndParseDocument(
        `https://archiveofourown.org/users/${this.syncOptions.user.username}/collections`
      );
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
    } finally {
      this.loading = false;
    }
  }
}
</script>

<style lang="scss" scoped>
.v-autocomplete ::v-deep .v-input__slot {
  padding-right: 32px !important;
}
</style>