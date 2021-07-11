<template lang="pug">
div
  boolean-option(
    :options.sync='syncOptions',
    :id='option.styleWidthEnabled',
    title='Decrease width of work for easier reading on large screens'
  )
    div
      v-divider.mx-4
      slider-option(
        :options.sync='syncOptions',
        :id='option.styleWidth',
        title='Decrease work width by',
        unit='%',
        unit-padding='2px',
        :min='1',
        :max='100',
        step=1,
        hide-details
      )
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { OPTION_IDS, Options } from '@/common';

import BooleanOption from '../BooleanOption.vue';
import SliderOption from '../SliderOption.vue';

@Component({
  components: { BooleanOption, SliderOption },
})
export default class StyleWidth extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = OPTION_IDS;
}
</script>
