<template lang="pug">
category#chapter-stats(
  title='Chapter statistics',
  subtitle='Add statistics to each chapter when reading.',
  :icon='icon',
  v-on='$listeners'
)
  v-divider
  boolean-option(
    :options.sync='syncOptions',
    :id='option.showChapterWords',
    title='Word Count'
  )
  v-divider
  boolean-option(
    :options.sync='syncOptions',
    :id='option.showChapterTime',
    title='Reading Time'
  )
  v-divider
  boolean-option(
    :options.sync='syncOptions',
    :id='option.showChapterFinish',
    title='Finish reading at'
  )
  v-divider
  boolean-option(
    :options.sync='syncOptions',
    :id='option.showChapterDate',
    title='Updated date'
  )
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiFileChart } from '@mdi/js';

import { OPTION_IDS, Options } from '@/common';

import BooleanOption from '../BooleanOption.vue';
import Category from '../Category.vue';
import ABtn from '../ABtn.vue';

@Component({
  components: {
    BooleanOption,
    Category,
    ABtn,
  },
})
export default class ChapterStats extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = OPTION_IDS;

  icon = mdiFileChart;
}
</script>
