<template lang="pug">
category#advanced(
  title='Advanced',
  subtitle='Advanced options that most users don\'t need',
  :icon='$icons.mdiAlertDecagramOutline',
  v-on='$listeners'
)
  v-divider
  import-export(:options.sync='syncOptions')/
  v-divider
  boolean-option(
    :options.sync='syncOptions',
    :id='option.verbose',
    title='Show debugging info in console.'
  )
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { Options, options } from '@/common/options';

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

  option = options.IDS;
}
</script>
