<template lang="pug">
div
  boolean-option(
    :options.sync='syncOptions',
    :id='option.hideLanguages',
    title='Hide works based on their language'
  )
    div 
      v-divider.mx-4
      v-autocomplete.mb-2.mt-5.mx-4(
        v-model='syncOptions.hideLanguagesList',
        :items='sortedItems',
        :loading='isLoading',
        :search-input.sync='search',
        label='Show only these languages:',
        return-object,
        chips,
        dense,
        small-chips,
        multiple,
        hide-details='auto',
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
            v-icon(small, @click='parent.selectItem(item)') {{ $icons.mdiCloseCircle }}
</template>

<script lang="ts">
import { Component, Vue, Watch, PropSync } from 'vue-property-decorator';

import { options, Options } from '@/common/options';

import BooleanOption from '../BooleanOption.vue';

type Item = { text: string; value: string };

@Component({
  components: {
    BooleanOption,
  },
})
export default class HideLanguages extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = options.IDS;

  isLoading = false;
  search = null as string | null;
  items = [] as Item[];
  hasLoaded = false;

  colors = ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange'];

  @Watch('search')
  async watchSearch(): Promise<void> {
    await this.doSearch();
  }

  get sortedItems(): Item[] {
    if (this.items.length == 0)
      this.items = [...this.syncOptions.hideLanguagesList];
    return this.items.sort((a, b) => (a.value > b.value ? 1 : -1));
  }

  async doSearch(): Promise<void> {
    if (this.hasLoaded) return;
    if (this.isLoading) return;
    this.isLoading = true;
    this.hasLoaded = true;

    // Lazily load input items
    try {
      const res = await fetch('https://archiveofourown.org/works/search');
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const langSelect = doc.getElementById(
        'work_search_language_id'
      )! as HTMLSelectElement;
      const langOptions = langSelect.options;
      this.$logger.debug('langOptions from AO3', langOptions);
      this.items = [];
      for (const { text, value } of langOptions) {
        if (text && value) {
          this.items.push({
            text,
            value,
          });
        }
      }
    } finally {
      this.isLoading = false;
    }
  }
}
</script>
