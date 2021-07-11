<template lang="pug">
category#advanced(
  title='Advanced',
  subtitle='Advanced options that most users don\'t need',
  :icon='icon',
  v-on='$listeners'
)
  //- p.subtitle-1.mt-1.mb-1.font-italic Data export/import
  v-divider
  import-export(:options.sync='syncOptions')/
  //- p.subtitle-1.mt-1.mb-1.font-italic Debugging
  v-divider
  boolean-option(
    :options.sync='syncOptions',
    :id='option.verbose',
    title='Show debugging info in console.'
  )
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiAlertDecagramOutline } from '@mdi/js';

import { Options, OPTION_IDS } from '@/common';

import Category from '../Category.vue';
import BooleanOption from '../BooleanOption.vue';

import ImportExport from './ImportExport.vue';

@Component({
  components: {
    BooleanOption,
    Category,
    ImportExport,
  },
})
export default class Advanced extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = OPTION_IDS;

  icon = mdiAlertDecagramOutline;
}
</script>
