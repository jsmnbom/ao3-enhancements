<template lang="pug">
v-card
  v-card-text.text-center
    p.
      Reading List uses bookmarks to store data.
      Each pseud on AO3 can only have a work bookmarked once.
      This means that if you wish to use bookmarks for other purposes too,
      it is highly recommended that you create another pseud for use with the reading list,
      such that your normal bookmarks are left untouched.
      Please select the psued that reading list should use below.
    v-autocomplete.mx-auto(
      v-model='syncOptions.readingListPsued',
      return-object,
      :items='items',
      :loading='loading',
      @focus='fetchItems',
      filled,
      hide-details,
      :style='style',
      item-text='name',
      item-value='id'
    )
  v-card-actions.flex-wrap
    v-btn(color='error', @click='syncStep = 1') Previous
    v-spacer
    v-btn(
      color='primary',
      @click='syncStep = 3',
      :disabled='!syncOptions.readingListPsued'
    ) Next
</template>

<script lang="ts">
import { Vue, Component, PropSync } from 'vue-property-decorator';
import { mdiReload, mdiLogin } from '@mdi/js';

import { fetchAndParseDocument, Options } from '@/common';

@Component({
  inheritAttrs: false,
})
export default class Owner extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @PropSync('step') syncStep!: number;

  loading = false;
  hasLoaded = false;
  search: null | string = null;
  icons = {
    mdiReload,
    mdiLogin,
  };

  items: { name: string; id: number }[] = [];

  mounted(): void {
    if (this.syncOptions.readingListPsued) {
      this.items = [this.syncOptions.readingListPsued];
    }
  }

  get style(): { width: string } {
    return {
      width: `${
        Math.max(20, this.syncOptions.readingListPsued?.name.length || 0) + 2
      }ch`,
    };
  }

  fetchItems(): void {
    if (this.hasLoaded || !this.syncOptions.user || this.loading) return;
    this.loading = true;
    this.hasLoaded = true;

    fetchAndParseDocument(`https://archiveofourown.org/external_works/new`)
      .then((doc) => {
        const psuedSelect = doc.querySelector(
          '#bookmark_pseud_id'
        ) as HTMLSelectElement;
        this.items = Array.from(psuedSelect.options).map((option) => ({
          id: parseInt(option.value),
          name: option.textContent!,
        }));
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => (this.loading = false));
  }
}
</script>
