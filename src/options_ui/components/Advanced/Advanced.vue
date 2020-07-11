<template lang="pug">
category#advanced(,
  title='Advanced',
  subtitle='Advanced options that most users don\'t need',
  :icon='icon',
  v-on='$listeners'
)
  p.subtitle-1.mt-1.mb-1.font-italic Data export/import
  import-export(:options.sync='opts')/
  p.subtitle-1.mt-1.mb-1.font-italic Debugging
  simple-boolean-option(v-bind.sync='opts', :id='option.verbose')
    span Show debugging info in console.
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiAlertDecagramOutline } from '@mdi/js';

import { Options, OPTION_IDS } from '@/common';

import Category from '../Category.vue';
import SimpleBooleanOption from '../SimpleBooleanOption.vue';

import ImportExport from './ImportExport.vue';

@Component({
  components: {
    SimpleBooleanOption,
    Category,
    ImportExport,
  },
})
export default class Advanced extends Vue {
  @PropSync('options', { type: Object }) opts!: Options;

  option = OPTION_IDS;

  icon = mdiAlertDecagramOutline;
}
</script>
