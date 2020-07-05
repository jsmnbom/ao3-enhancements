<template lang="pug">
div
  v-switch.mt-2(
    hide-details,
    label='Hide works based on their author.',
    v-model='enabled'
  )
  v-expand-transition
    v-combobox.mt-2(
      v-model.trim='selected',
      label='Hide works from these authors:',
      hint='Use <enter> after each author.',
      multiple,
      chips,
      small-chips,
      dense,
      :disabled='!enabled',
      v-show='enabled',
      filled,
      deletable-chips,
      :items='items',
      :search-input.sync='search'
    )
      template(v-slot:selection='{ attrs, item, parent, selected, index }')
        v-chip(
          v-bind='attrs',
          :class='[colors[index % colors.length], $vuetify.theme.dark ? "darken-2" : "lighten-2"]',
          :input-value='selected',
          label,
          small
        )
          span.pr-1 {{ item }}
          v-icon(small, @click='parent.selectItem(item)') {{ icons.mdiCloseCircle }}
</template>

<script lang="ts">
import { Component, Vue, Watch, PropSync } from 'vue-property-decorator';
import debounce from 'just-debounce-it';
import { mdiCloseCircle } from '@mdi/js';

import { logger, OPTION_IDS } from '@/common';

@Component
export default class HideAuthors extends Vue {
  @PropSync(OPTION_IDS.hideAuthors, { type: Boolean })
  enabled!: boolean;

  @PropSync(OPTION_IDS.hideAuthorsList, { type: Array })
  selected!: string[];

  items = [] as string[];
  isLoading = false;
  search = null as null | string;

  debouncedDoSearch = debounce(this.doSearch.bind(this), 500);

  icons = {
    mdiCloseCircle,
  };

  colors = ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange'];

  @Watch('search')
  watchSearch(val: string): void {
    if (typeof val !== 'string') return;
    this.debouncedDoSearch(val);
  }

  mounted(): void {
    this.items = [...this.selected];
  }

  doSearch(val: string): void {
    if (this.isLoading) return;
    this.isLoading = true;

    fetch(
      'https://archiveofourown.org/autocomplete/pseud?' +
        new URLSearchParams({ term: val }).toString()
    )
      .then((res) => res.json())
      .then((res: { name: string; id: string }[]) => {
        this.items = [...this.selected];
        for (const pseud of res) {
          this.items.push(pseud.id);
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
