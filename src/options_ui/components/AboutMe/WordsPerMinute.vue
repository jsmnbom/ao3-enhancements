<template lang="pug">
div
  .d-flex.flex-row.align-center 
    span#wpm-label.body-1.mr-1.text--secondary My reading speed is
    v-text-field.wpm-field(
      aria-labelledby='wpm-label',
      dense,
      hide-details,
      type='number',
      v-model.number='value',
      single-line,
      @focus='$event.target.select()'
    )
    span.body-1.ml-2.text--secondary words/min.
  v-slider(
    aria-labelledby='wpm-label',
    hide-details='auto',
    persistent-hint,
    :min='100',
    :max='400',
    thumb-label,
    v-model.number='sliderValue',
    @start='sliderStart'
  )
  p.body-2.text--secondary.mb-0 Tip: You can use a site like #[a(href='http://www.readingsoft.com/') this] to calculate your reading speed.
  p.body-2.text--secondary.mb-0 Your reading speed is used for the
    |
    |
    a-btn(@click='$vuetify.goTo("#blurb-stats")') blurb statistics
    |
    | as well as the
    |
    |
    a-btn(@click='$vuetify.goTo("#chapter-stats")') chapter statistics
    |
    | if enabled.
</template>

<script lang="ts">
import { Component, Vue, Watch, PropSync } from 'vue-property-decorator';

import { OPTION_IDS } from '@/common';

import ABtn from '../ABtn.vue';

function clamp(num: number, min: number, max: number) {
  return num <= min ? min : num >= max ? max : num;
}

@Component({
  inheritAttrs: false,
  components: { ABtn },
})
export default class WordsPerMinute extends Vue {
  @PropSync(OPTION_IDS.wordsPerMinute, { type: Number })
  value!: number;

  sliderValue = null as number | null;
  sliderOutOfBounds = false;

  @Watch('sliderValue')
  watchSliderValue(newValue: number): void {
    if (!this.sliderOutOfBounds) {
      this.value = newValue;
    }
  }
  @Watch('value')
  watchValue(newValue: number): void {
    this.sliderOutOfBounds = newValue < 100 || newValue > 400;
    this.sliderValue = clamp(newValue, 100, 400);
  }

  created(): void {
    this.sliderValue = this.value;
  }

  sliderStart(value: number): void {
    this.value = value;
  }
}
</script>

<style scoped>
.wpm-field {
  width: 40px;
  margin: 0;
  flex: 0 auto;
}
.wpm-field >>> input {
  -moz-appearance: textfield;
  text-align: center;
}
.wpm-field >>> input::-webkit-outer-spin-button,
.wpm-field >>> input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
