<template lang="pug">
div
  v-switch.mt-2(
    hide-details,
    label='Hide works based on their language.',
    v-model='enabled'
  )
  v-expand-transition
    v-autocomplete.mt-2(
      v-model='selected',
      :items='sortedItems',
      :loading='isLoading',
      :search-input.sync='search',
      :disabled='!enabled',
      v-show='enabled',
      label='Show only these languages:',
      return-object,
      chips,
      dense,
      filled,
      small-chips,
      multiple,
      deletable-chips,
      @focus='doSearch($event.target.value)'
    )
      template(v-slot:selection='{ attrs, item, parent, selected, index }')
        v-chip(
          v-bind='attrs',
          :class='[colors[index % colors.length], $vuetify.theme.dark ? "darken-2" : "lighten-2"]',
          :input-value='selected',
          label,
          small
        )
          span.pr-1 {{ item.text }}
          v-icon(small, @click='parent.selectItem(item)') {{ icons.mdiCloseCircle }}
</template>

<script lang="ts">
import { Component, Vue, Watch, PropSync } from 'vue-property-decorator';
import { mdiCloseCircle } from '@mdi/js';

import { OPTION_IDS, logger } from '@/common';

type Item = { text: string; value: string };

@Component
export default class HideLanguages extends Vue {
  @PropSync(OPTION_IDS.hideLanguages, { type: Boolean })
  enabled!: boolean;

  @PropSync(OPTION_IDS.hideLanguagesList, { type: Array })
  selected!: Item[];

  isLoading = false;
  search = null as string | null;
  items = [] as Item[];
  hasLoaded = false;

  icons = {
    mdiCloseCircle,
  };

  colors = ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange'];

  @Watch('search')
  watchSearch(): void {
    this.doSearch();
  }

  get sortedItems(): Item[] {
    if (this.items.length == 0) this.items = [...this.selected];
    return this.items.sort((a, b) => (a.value > b.value ? 1 : -1));
  }

  doSearch(): void {
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
        const langSelect = doc.getElementById(
          'work_search_language_id'
        )! as HTMLSelectElement;
        const langOptions = langSelect.options;
        logger.debug('langOptions from AO3', langOptions);
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
        logger.error(err);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}
</script>
