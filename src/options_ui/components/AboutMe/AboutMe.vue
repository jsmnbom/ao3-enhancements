<template lang="pug">
category#about-me(,
  title='About me',
  subtitle='Details required for some enhancements.',
  :icon='icon',
  v-on='$listeners'
)
  words-per-minute(v-bind.sync='opts')/
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiAccountBox } from '@mdi/js';

import { Options } from '@/common';

import Category from '../Category.vue';

import WordsPerMinute from './WordsPerMinute.vue';

@Component({
  components: {
    WordsPerMinute,
    Category,
  },
})
export default class AboutMe extends Vue {
  @PropSync('options', { type: Object }) opts!: Options;

  icon = mdiAccountBox;
}
</script>
