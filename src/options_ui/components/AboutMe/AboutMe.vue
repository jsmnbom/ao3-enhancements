<template lang="pug">
category#about-me(,
  title='About me',
  subtitle='Details required for some enhancements.',
  :icon='icon',
  v-on='$listeners'
)
  words-per-minute(v-bind.sync='_options')/
</template>

<script lang="ts">
import { Component, Vue, PropSync, Prop } from 'vue-property-decorator';

import WordsPerMinute from './WordsPerMinute.vue';
import Category from '../Category.vue';
import { Options } from '@/common';
import { mdiAccountBox } from '@mdi/js';

@Component({
  components: {
    WordsPerMinute,
    Category,
  },
})
export default class AboutMe extends Vue {
  @PropSync('options', { type: Object }) _options!: Options;

  icon = mdiAccountBox;
}
</script>
