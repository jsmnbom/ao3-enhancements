<template lang="pug">
div
  boolean-option(
    :options.sync='syncOptions',
    :id='option.styleAlignEnabled',
    title='Force allignment of text'
  )
    div
      v-divider.mx-4
      v-select.mb-2.mt-5.mx-4(
        :items='items',
        hide-details,
        label='Force this text alignment',
        dense,
        v-model='syncOptions.styleAlign'
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
export default class StyleAlign extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = options.IDS;

  items = [
    {
      value: 'start',
      text: 'start (usually right)',
    },
    {
      value: 'end',
      text: 'end (usually left)',
    },
    {
      value: 'center',
      text: 'center',
    },
    {
      value: 'justify',
      text: 'justify',
    },
  ];
}
</script>
