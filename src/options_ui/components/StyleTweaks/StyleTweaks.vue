<template lang="pug">
category#style-tweaks(,
  title='Style tweaks',
  subtitle='Make reading easier!',
  :icon='icon',
  v-on='$listeners'
)
  style-width(v-bind.sync='opts')/
  style-align(v-bind.sync='opts')/
  simple-boolean-option(
    v-bind.sync='opts',
    :id='option.showStatsColumns'
  )
    span Show stats (both blurb and chapter, if enabled) as columns
  
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiPalette } from '@mdi/js';

import { OPTION_IDS, Options } from '@/common';

import SimpleBooleanOption from '../SimpleBooleanOption.vue';
import Category from '../Category.vue';

import StyleWidth from './StyleWidth.vue';
import StyleAlign from './StyleAlign.vue';

@Component({
  components: {
    SimpleBooleanOption,
    Category,
    StyleWidth,
    StyleAlign,
  },
})
export default class BlurbStats extends Vue {
  @PropSync('options', { type: Object }) opts!: Options;

  option = OPTION_IDS;

  icon = mdiPalette;
}
</script>
