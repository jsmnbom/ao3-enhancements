<template lang="pug">
category#style-tweaks(
  title='Style tweaks',
  subtitle='Make reading easier!',
  :icon='$icons.mdiPalette',
  v-on='$listeners'
)
  v-divider
  style-width(:options.sync='syncOptions')/
  v-divider
  style-align(:options.sync='syncOptions')/
  v-divider
  boolean-option(
    :options.sync='syncOptions',
    :id='option.showStatsColumns',
    title='Show stats (both blurb and chapter, if enabled) as columns'
  )
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { options, Options } from '@/common/options';

import BooleanOption from '../BooleanOption.vue';
import Category from '../Category.vue';

import StyleWidth from './StyleWidth.vue';
import StyleAlign from './StyleAlign.vue';

@Component({
  components: {
    BooleanOption,
    Category,
    StyleWidth,
    StyleAlign,
  },
})
export default class BlurbStats extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = options.IDS;
}
</script>
