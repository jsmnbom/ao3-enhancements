<template lang="pug">
div
  boolean-option(
    :options.sync='syncOptions',
    :id='option.hideAuthors',
    title='Hide works based on their author'
  )
    div
      v-divider.mx-4
      v-combobox.mb-2.mt-5.mx-4(
        v-model.trim='syncOptions.hideAuthorsList',
        label='Hide works from these authors:',
        hint='Use <enter> after each author',
        multiple,
        chips,
        small-chips,
        dense,
        deletable-chips,
        hide-details='auto',
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

import { options, Options } from '@/common/options';

import BooleanOption from '../BooleanOption.vue';

@Component({
  components: {
    BooleanOption,
  },
})
export default class HideAuthors extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = options.IDS;

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
    this.items = [...this.syncOptions.hideAuthorsList];
  }

  async doSearch(val: string): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const res = await fetch(
        'https://archiveofourown.org/autocomplete/pseud?' +
          new URLSearchParams({ term: val }).toString()
      );
      const json = (await res.json()) as { name: string; id: string }[];
      this.items = [...this.syncOptions.hideAuthorsList];
      for (const pseud of json) {
        this.items.push(pseud.id);
      }
    } finally {
      this.isLoading = false;
    }
  }
}
</script>
