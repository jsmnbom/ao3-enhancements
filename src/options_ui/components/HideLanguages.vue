<template lang="pug">
div
  v-switch.mt-2(
    hide-details,
    label='Hide works based on their language.',
    v-model='enabled'
  )
  v-autocomplete(
    v-model='selected',
    :items='sortedItems',
    :loading='isLoading',
    :search-input.sync='search',
    :disabled='!enabled',
    persistent-hint,
    label='Show only these languages:',
    return-object,
    chips,
    small-chips,
    multiple,
    @focus='doSearch($event.target.value)'
  )

</template>

<script lang="ts">
import Vue from 'vue';
import { log, getValue, setValue } from '@/common';

type Item = { text: string; value: string };

export default Vue.extend({
  data() {
    return {
      enabled: false,
      enabledId: 'options.hideLanguages',
      selectedId: 'options.hideLanguagesList',
      isLoading: false,
      selected: [] as Item[],
      search: null as string | null,
      items: [] as Item[],
      hasLoaded: false,
    };
  },
  async created() {
    this.enabled = await getValue(this.enabledId, this.enabled);
    this.selected = JSON.parse(
      await getValue(this.selectedId, JSON.stringify(this.selected))
    );
    this.items = [...this.selected];
  },
  watch: {
    async enabled(newValue: boolean) {
      await setValue(this.enabledId, newValue);
    },
    search(val: string) {
      this.doSearch(val);
    },
    async selected(selected: Item[]) {
      await setValue(this.selectedId, JSON.stringify(selected));
    },
  },
  computed: {
    sortedItems(): Item[] {
      return this.items.sort((a, b) => (a.value > b.value ? 1 : -1));
    },
  },
  methods: {
    doSearch(val: string) {
      if (this.hasLoaded) return;
      if (this.isLoading) return;
      this.isLoading = true;
      this.hasLoaded = true;

      // Lazily load input items
      fetch('https://archiveofourown.org/works/search')
        .then((res) => res.text())
        .then((res) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(res, 'text/html');
          const langSelect = <HTMLSelectElement>(
            doc.getElementById('work_search_language_id')!
          );
          const langOptions = langSelect.options;
          log('langOptions from AO3', langOptions);
          this.items = [];
          for (const { text, value } of langOptions) {
            if (text && value) {
              this.items.push({
                text,
                value,
              });
            }
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
});
</script>
