<template lang="pug">
category#style-ReadingList(
  title='Reading List',
  subtitle='Track works you have read/want to read.',
  :icon='$icons.mdiBookOutline',
  v-on='$listeners'
)
  v-divider
  boolean-option(
    :options.sync='syncOptions',
    :id='option.readingListShowNeverReadInListings',
    title='Show "Never read" text in listings',
    subtitle='Allows you to click it and easily add a work to your reading list without opening the work.'
  )
  v-divider
  boolean-option(
    :options.sync='syncOptions',
    :id='option.readingListAutoRead',
    title='Automatically mark chapters as read when scrolled to bottom of page and work is marked as "Currently Reading"'
  )
  v-divider
  select-option(
    :options.sync='syncOptions',
    :id='option.readingListShowButton',
    :items='showItems',
    title='Show floating button on work pages',
    subtitle='This button is required to mark chapters as read etc.'
  )
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { options, Options } from '@/common/options';

import BooleanOption from '../BooleanOption.vue';
import SelectOption from '../SelectOption.vue';
import Category from '../Category.vue';

@Component({
  components: {
    BooleanOption,
    SelectOption,
    Category,
  },
})
export default class ReadingList extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  showItems = [
    { text: 'Always show', value: 'always' },
    { text: 'Never show', value: 'never' },
    { text: 'Show only when not reading', value: 'exceptWhenREading' },
  ];

  option = options.IDS;
}
</script>
