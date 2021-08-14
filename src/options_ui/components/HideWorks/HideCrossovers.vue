<template lang="pug">
div
  boolean-option(
    :options.sync='syncOptions',
    :id='option.hideCrossovers',
    title='Hide works with many fandoms (crossovers)'
  )
    div
      v-divider.mx-4
      slider-option(
        :options.sync='syncOptions',
        :id='option.hideCrossoversMaxFandoms',
        title='Hide when more than',
        unit='fandoms',
        unit-padding='8px',
        :min='1',
        :max='10',
        step=1,
        ticks='always',
        ticks-size='5'
      )
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { options, Options } from '@/common/options';

import BooleanOption from '../BooleanOption.vue';
import SliderOption from '../SliderOption.vue';

@Component({
  components: { BooleanOption, SliderOption },
})
export default class HideCrossovers extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = options.IDS;
}
</script>
