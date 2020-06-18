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
import { Component, Vue, Watch } from 'vue-property-decorator';
import debounce from 'just-debounce-it';
import { mdiCloseCircle } from '@mdi/js';

import { error, getOption, optionIds, setOption } from '@/common';

type Item = { text: string; value: string };

@Component
export default class HideAuthors extends Vue {
  enabled = false;
  enabledId = optionIds.hideAuthors;
  selectedId = optionIds.hideAuthorsList;
  selected = [] as string[];
  ready = false;
  items = [] as string[];
  isLoading = false;
  search = null as null | string;

  debouncedDoSearch = debounce(this.doSearch, 500);

  icons = {
    mdiCloseCircle,
  };

  colors = ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange'];

  async created(): Promise<void> {
    this.enabled = await getOption(this.enabledId);
    this.selected = await getOption(this.selectedId);
    this.items = [...this.selected];
    this.$nextTick(() => {
      this.ready = true;
    });
  }

  @Watch('enabled')
  async watchEnabled(newValue: boolean): Promise<void> {
    if (!this.ready) return;
    await setOption(this.enabledId, newValue);
  }
  @Watch('search')
  watchSearch(val: string): void {
    if (typeof val !== 'string') return;
    this.debouncedDoSearch(val);
  }
  @Watch('selected')
  async watchSelected(selected: Item[]): Promise<void> {
    if (!this.ready) return;
    await setOption(this.selectedId, selected);
  }
  doSearch(val: string): void {
    if (this.isLoading) return;
    this.isLoading = true;

    fetch(
      'https://archiveofourown.org/autocomplete/pseud?' +
        new URLSearchParams({ term: val })
    )
      .then((res) => res.json())
      .then((res) => {
        this.items = [...this.selected];
        for (const pseud of res) {
          this.items.push(pseud.id);
        }
      })
      .catch((err) => {
        error(err);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}
</script>
