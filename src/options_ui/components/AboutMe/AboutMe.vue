<template lang="pug">
category#about-me(
  title='About me',
  subtitle='Personal preferences',
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
  v-divider
  theme-option(:options.sync='syncOptions')
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { Options, options } from '@/common/options';

import Category from '../Category.vue';
import SliderOption from '../SliderOption.vue';
import Tip from '../Tip.vue';

import ThemeOption from './ThemeOption.vue';

@Component({
  components: {
    SliderOption,
    ThemeOption,
    Category,
    Tip,
  },
})
export default class AboutMe extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = options.IDS;
}
</script>
