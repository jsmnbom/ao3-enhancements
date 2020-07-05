<template lang="pug">
category#advanced(,
  title='Advanced',
  subtitle='Advanced options that most users don\'t need',
  :icon='icon',
  v-on='$listeners'
)
  simple-boolean-option(v-bind.sync='opts', :id='option.verbose')
    span Show debugging info in console.
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiAlertDecagramOutline } from '@mdi/js';

import { Options, OPTION_IDS } from '@/common';

import Category from '../Category.vue';
import SimpleBooleanOption from '../SimpleBooleanOption.vue';

@Component({
  components: {
    SimpleBooleanOption,
    Category,
  },
})
export default class AboutMe extends Vue {
  @PropSync('options', { type: Object }) opts!: Options;

  option = OPTION_IDS;

  icon = mdiAlertDecagramOutline;
}
</script>
