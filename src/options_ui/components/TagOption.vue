<template lang="pug">
tag-option-combobox.mb-2.mt-5.mx-4(
  v-model='value',
  :items='allItems',
  :loading='isLoading',
  :search-input.sync='search',
  :label='title',
  return-object,
  chips,
  dense,
  small-chips,
  multiple,
  hide-details='auto',
  deletable-chips,
  hide-selected,
  :item-value='itemValue',
  :item-text='itemText',
  ref='field'
)
  template(v-slot:no-data)
    v-subheader.ml-2(style='height: 30px')
      span(v-if='isLoading') Loading...
      span(v-if='!search') Start typing or choose a type to add tags.
      span(v-if='search && !isFreeform && !isLoading') No results found.
      span(v-if='search && isFreeform && !isLoading') No suggestions found, press enter to add "{{ search }}" as a freeform tag anyway.
  template(v-slot:selection='{ attrs, item, parent, selected, index }')
    v-chip(
      v-bind='attrs',
      :class='[colors[index % colors.length], $vuetify.theme.dark ? "darken-2" : "lighten-2"]',
      :input-value='selected',
      label,
      small
    )
      v-icon(left) {{ tagTypeIcons[item.type] }}
      span.pr-1 {{ item.tag }}
      v-icon(small, @click='parent.selectItem(item)') {{ $icons.mdiCloseCircle }}
  template(v-slot:prepend-list)
    v-list.py-0(dense)
      v-list-item
        v-chip-group(v-model='selectedTagTypeIndex', column, mandatory)
          v-chip(
            v-for='tagType in tagTypes',
            :key='tagType',
            filter,
            small,
            outlined,
            @click='refocus'
          ) 
            v-icon(left) {{ tagTypeIcons[tagType] }}
            span {{ tagType }}
      v-subheader.pb-2.ml-2(
        style='height: 24px',
        v-if='search && isFreeform && items.length > 0'
      )
        span Press enter to add "{{ search }}" as a freeform tag.
    v-divider
</template>

<script lang="ts">
import { Component, Vue, Watch, PropSync, Prop } from 'vue-property-decorator';
import {
  mdiAccount,
  mdiAccountHeartOutline,
  mdiAlert,
  mdiBookmarkMultiple,
  mdiHeartCircleOutline,
  mdiHelpCircleOutline,
  mdiTag,
} from '@mdi/js';
import pDebounce from 'p-debounce';

import { Options, TagType, tagTypes, Tag, options } from '@/common/options';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import TagOptionCombobox from './TagOptionCombobox.js';

const tagTypeIcons: { [key in TagType]: string } = {
  fandom: mdiBookmarkMultiple,
  warning: mdiAlert,
  category: mdiHeartCircleOutline,
  relationship: mdiAccountHeartOutline,
  character: mdiAccount,
  freeform: mdiTag,
  unknown: mdiHelpCircleOutline,
};

const constantTagItems: Partial<{ [key in TagType]: string[] }> = {
  warning: [
    'Creator Chose Not To Use Archive Warnings',
    'Graphic Depictions Of Violence',
    'Major Character Death',
    'No Archive Warnings Apply',
    'Rape/Non-Con',
    'Underage ',
  ],
  category: ['F/F', 'F/M', 'Gen', 'M/M', 'Multi', 'Other'],
};
const searchableTagTypes: TagType[] = [
  'fandom',
  'relationship',
  'character',
  'freeform',
];

interface Field {
  focus(): void;
}

@Component({
  components: { TagOptionCombobox },
})
export default class TagOption extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @Prop(String) readonly id: options.Id | undefined;
  @Prop(String) readonly title: string | undefined;

  isLoading = false;
  isFetching = false;
  search = null as string | null;
  items = [] as Tag[];
  hasLoaded = false;
  tagTypes = tagTypes.filter((type) => type !== 'unknown');
  selectedTagTypeIndex: number = tagTypes.indexOf('freeform');

  tagTypeIcons = tagTypeIcons;

  colors = ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange'];

  debouncedDoSearch = pDebounce(this.doSearch.bind(this), 500);

  get isFreeform(): boolean {
    return this.selectedTagType === 'freeform';
  }

  get value(): Tag[] {
    return this.syncOptions![this.id!] as Tag[];
  }

  set value(value: (Tag | string)[]) {
    const newValue = value.map((tag) => {
      if (typeof tag === 'string') {
        return {
          tag: tag,
          type: 'freeform' as TagType,
        };
      }
      return tag;
    });
    (this.syncOptions![this.id!] as Tag[]) = newValue;
  }

  get allItems(): Tag[] {
    return [...this.items, ...this.value];
  }

  get selectedTagType(): TagType {
    return tagTypes[this.selectedTagTypeIndex];
  }

  @Watch('selectedTagType')
  async watchSelectedTagType(): Promise<void> {
    await this.updateItems();
  }

  @Watch('search')
  async watchSearch(): Promise<void> {
    await this.updateItems();
  }

  async updateItems(): Promise<void> {
    if (this.selectedTagType in constantTagItems) {
      this.items = constantTagItems[this.selectedTagType]!.map((tag) => ({
        tag,
        type: this.selectedTagType!,
      }));
      this.isLoading = false;
    } else {
      this.items = [];
      this.isLoading = !!this.search;
      await this.debouncedDoSearch();
    }
  }

  itemValue(tag: Tag): Tag {
    return tag;
  }

  itemText(tag: Tag): string {
    return tag.tag;
  }

  refocus(): void {
    (this.$refs.field! as unknown as Field).focus();
  }

  async doSearch(): Promise<void> {
    if (this.isFetching) return;
    if (!searchableTagTypes.includes(this.selectedTagType)) return;
    if (!this.search) return;
    this.isFetching = true;

    try {
      const res = await fetch(
        `https://archiveofourown.org/autocomplete/${this.selectedTagType}?` +
          new URLSearchParams({ term: this.search }).toString()
      );
      const json = (await res.json()) as { name: string; id: string }[];

      for (const tag of json) {
        this.items.push({ tag: tag.name, type: this.selectedTagType! });
      }
    } finally {
      this.isFetching = false;
      this.isLoading = false;
    }
  }
}
</script>
