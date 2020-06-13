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
import { Vue, Component, Watch } from 'vue-property-decorator';
import { log, error, getOption, setOption, optionIds } from '@/common';

type Item = { text: string; value: string };

@Component
export default class HideLanguages extends Vue {
  enabled = false;
  enabledId = optionIds.hideLanguages;
  selectedId = optionIds.hideLanguagesList;
  isLoading = false;
  selected = [] as Item[];
  search = null as string | null;
  items = [] as Item[];
  hasLoaded = false;

  async created() {
    this.enabled = await getOption(this.enabledId);
    this.selected = await getOption(this.selectedId);
    this.items = [...this.selected];
  }

  @Watch('enabled')
  async watchEnabled(newValue: boolean) {
    await setOption(this.enabledId, newValue);
  }
  @Watch('search')
  watchSearch(val: string) {
    this.doSearch(val);
  }
  @Watch('selected')
  async watchSelected(selected: Item[]) {
    await setOption(this.selectedId, selected);
  }

  get sortedItems(): Item[] {
    return this.items.sort((a, b) => (a.value > b.value ? 1 : -1));
  }

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
        error(err);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }
}
</script>
