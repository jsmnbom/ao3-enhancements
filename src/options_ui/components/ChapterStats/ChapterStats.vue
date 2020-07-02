<template lang="pug">
category#chapter-stats(,
  title='Chapter statistics',
  subtitle='Add statistics to each chapter when reading.',
  :icon='icon',
  v-on='$listeners'
)
  p.text--secondary.subtitle See the
    |
    |
    a-btn(@click='$vuetify.goTo("#style-tweaks")') style tweaks
    |
    | section for more
  simple-boolean-option(v-bind.sync='opts', :id='option.showChapterWords')
    span Show #[em Word count] for each chapter.
  simple-boolean-option(v-bind.sync='opts', :id='option.showChapterTime')
    span Show #[em Reading time] for each chapter.
  simple-boolean-option(v-bind.sync='opts', :id='option.showChapterFinish')
    span Show #[em Finish reading at] for each chapter.
  simple-boolean-option(v-bind.sync='opts', :id='option.showChapterDate')
    span Show #[em Updated date] for each chapter.
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiFileChart } from '@mdi/js';

import { OPTION_IDS, Options } from '@/common';

import SimpleBooleanOption from '../SimpleBooleanOption.vue';
import Category from '../Category.vue';
import ABtn from '../ABtn.vue';

@Component({
  components: {
    SimpleBooleanOption,
    Category,
    ABtn,
  },
})
export default class ChapterStats extends Vue {
  @PropSync('options', { type: Object }) opts!: Options;

  option = OPTION_IDS;

  icon = mdiFileChart;
}
</script>
