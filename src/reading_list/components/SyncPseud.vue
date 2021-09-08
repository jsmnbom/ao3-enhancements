<template lang="pug">
div(v-frag)
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
  sync-help(inset)
    p Sync will create AO3 bookmarks for you automatically, to be able to check when the works you are reading update. On AO3 each user can have multiple pseuds, these function a bit like sub-users, if you would like the bookmark that Sync creates to show up as explicitly created by a Reading List user, you can select it here. Otherwise just choose your username.
  sync-pseud-create(
    :options.sync='syncOptions',
    @create='createdName = $event'
  )
</template>

<script lang="ts">
import { Vue, Component, PropSync, Watch } from 'vue-property-decorator';

import { Options } from '@/common/options';
import { fetchAndParseDocument } from '@/common/utils';

import SyncHelp from './SyncHelp.vue';
import SyncPseudCreate from './SyncPseudCreate.vue';

@Component({ components: { SyncHelp, SyncPseudCreate } })
export default class SyncPseud extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  createdName: string | null = null;

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
  async onCreatedNameChange(): Promise<void> {
    this.items = [];
    this.hasLoaded = false;
    this.loading = false;
    await this.fetchItems();
    const find = this.items.find((item) => item.name == this.createdName);
    if (find) {
      Vue.set(this.syncOptions, 'readingListPsued', find);
    }
  }

  mounted(): void {
    if (this.syncOptions.readingListPsued) {
      this.items = [this.syncOptions.readingListPsued];
    }
  }

  async fetchItems(): Promise<void> {
    if (this.hasLoaded || !this.syncOptions.user || this.loading) return;
    this.loading = true;
    this.hasLoaded = true;

    try {
      const doc = await fetchAndParseDocument(
        `https://archiveofourown.org/external_works/new`
      );
      const psuedSelect = doc.querySelector('select#bookmark_pseud_id')!;
      this.items = Array.from(psuedSelect.options).map((option) => ({
        id: parseInt(option.value),
        name: option.textContent!,
      }));
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