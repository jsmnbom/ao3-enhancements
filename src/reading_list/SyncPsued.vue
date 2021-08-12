<template lang="pug">
v-autocomplete(
  v-model='syncOptions.readingListPsued',
  :disabled='!syncOptions.user',
  return-object,
  :items='items',
  :loading='loading',
  @focus='fetchItems',
  outlined,
  hide-details,
  dense,
  label='Psued',
  item-text='name',
  item-value='id'
)
</template>

<script lang="ts">
import { Vue, Component, PropSync, Prop, Watch } from 'vue-property-decorator';

import { fetchAndParseDocument, Options } from '@/common';

import SyncHelp from './SyncHelp.vue';

@Component({ components: { SyncHelp } })
export default class SyncPseud extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @Prop() createdName: string | null = null;

  loading = false;
  hasLoaded = false;
  search: null | string = null;

  items: { name: string; id: number }[] = [];

  @Watch('syncOptions.user')
  onUserChange(): void {
    this.items = [];
    this.hasLoaded = false;
    this.syncOptions.readingListPsued = null;
  }

  @Watch('createdName')
  onCreatedNameChange(): void {
    this.items = [];
    this.hasLoaded = false;
    this.loading = false;
    this.fetchItems()
      .then(() => {
        const find = this.items.find((item) => item.name == this.createdName);
        if (find) {
          Vue.set(this.syncOptions, 'readingListPsued', find);
        }
      })
      .catch((e) => console.error(e));
  }

  mounted(): void {
    if (this.syncOptions.readingListPsued) {
      this.items = [this.syncOptions.readingListPsued];
    }
  }

  fetchItems(): Promise<void> {
    if (this.hasLoaded || !this.syncOptions.user || this.loading)
      return Promise.resolve();
    this.loading = true;
    this.hasLoaded = true;

    return fetchAndParseDocument(
      `https://archiveofourown.org/external_works/new`
    )
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
