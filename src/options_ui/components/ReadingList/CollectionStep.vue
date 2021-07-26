<template lang="pug">
v-card
  v-card-text.text-center
    p.
      Reading list needs to add each created bookmark to a collection so
      that it can easily check for updates.
      Either choose an already existing collection below,
      or click create collection to create a suitable collection.
    v-autocomplete.mx-auto(
      v-model='syncOptions.readingListCollectionId',
      :items='items',
      :loading='loading',
      @focus='fetchItems',
      filled,
      hide-details,
      :style='style'
    )
  v-card-actions.flex-wrap
    v-btn(color='error', @click='syncStep = create ? 3 : 2') Previous
    v-spacer
    v-btn(color='secondary', @click='createNew') Create new collection
    v-spacer
    v-btn(
      color='primary',
      @click='syncDialog = false',
      :disabled='!syncOptions.readingListCollectionId'
    ) Done
</template>

<script lang="ts">
import { Vue, Component, PropSync, Watch } from 'vue-property-decorator';
import { mdiReload, mdiLogin } from '@mdi/js';

import { fetchAndParseDocument, Options } from '@/common';

@Component({
  inheritAttrs: false,
})
export default class CollectionStep extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @PropSync('step') syncStep!: number;
  @PropSync('creating') create!: boolean;
  @PropSync('dialog') syncDialog!: boolean;

  loading = false;
  hasLoaded = false;

  search: null | string = null;

  console = console;

  icons = {
    mdiReload,
    mdiLogin,
  };

  items: string[] = [];

  get style(): { width: string } {
    return {
      width: `${
        Math.max(20, this.syncOptions.readingListCollectionId?.length || 0) + 4
      }ch`,
    };
  }

  @Watch('syncOptions.readingListPsued')
  onPseudChange(): void {
    this.items = [];
    this.hasLoaded = false;
  }

  mounted(): void {
    if (this.syncOptions.readingListCollectionId) {
      this.items = [this.syncOptions.readingListCollectionId];
    }
  }

  createNew(): void {
    this.create = true;
  }

  fetchItems(): void {
    if (this.hasLoaded || !this.syncOptions.user || this.loading) return;
    this.loading = true;
    this.hasLoaded = true;

    fetchAndParseDocument(
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
