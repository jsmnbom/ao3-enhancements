<template lang="pug">
category#style-tweaks(,
  title='Style tweaks',
  subtitle='Make reading easier!',
  :icon='icon',
  v-on='$listeners'
)
  style-width(v-bind.sync='_options')/
  simple-boolean-option(
    v-bind.sync='_options',
    :id='option.showStatsColumns'
  )
    span Show stats (both blurb and chapter, if enabled) as columns
  
</template>

<script lang="ts">
import { Component, Vue, PropSync, Prop } from 'vue-property-decorator';
import { OPTION_IDS, Options } from '@/common';

import SimpleBooleanOption from '../SimpleBooleanOption.vue';
import StyleWidth from './StyleWidth.vue';
import Category from '../Category.vue';
import { mdiPalette } from '@mdi/js';

@Component({
  components: {
    SimpleBooleanOption,
    Category,
    StyleWidth,
  },
})
export default class BlurbStats extends Vue {
  @PropSync('options', { type: Object }) _options!: Options;

  option = OPTION_IDS;

  icon = mdiPalette;
}
</script>
