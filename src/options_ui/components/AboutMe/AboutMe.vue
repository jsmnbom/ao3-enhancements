<template lang="pug">
category#about-me(
  title='About me',
  subtitle='Details about you required for some enhancements.',
  :icon='$icons.mdiAccountBox',
  v-on='$listeners'
)
  v-divider
  slider-option(
    :options.sync='syncOptions',
    :id='option.wordsPerMinute',
    title='Reading speed',
    unit='words/min',
    unit-padding='8px',
    :min='100',
    :max='500'
  )
  tip Tip: You can use a site like #[a(href='http://www.readingsoft.com/') this] to calculate your reading speed.
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { Options, options } from '@/common/options';

import Category from '../Category.vue';
import SliderOption from '../SliderOption.vue';
import Tip from '../Tip.vue';

@Component({
  components: {
    SliderOption,
    Category,
    Tip,
  },
})
export default class AboutMe extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = options.IDS;
}
</script>
