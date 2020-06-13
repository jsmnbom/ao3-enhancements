<template lang="pug">
div.mt-2.mb-6
  .d-flex.flex-row.mb-2
    .d-flex.flex-row.align-center 
      span.mr-1#wpm-label My reading speed is
      v-text-field.wpm-field(
        aria-labelledby='wpm-label'
        dense,
        hide-details,
        reverse,
        type='number',
        v-model='value',
        single-line,
        @focus='$event.target.select()'
      )
      span.ml-2 words/min.
    v-slider(
      aria-labelledby='wpm-label'
      hide-details='auto',
      persistent-hint,
      :min='100',
      :max='400',
      thumb-label,
      v-model='sliderValue',
      @start='sliderStart'
    )
  p.body-2.text--secondary Tip: You can use a site like [site] to calculate your reading speed.


</template>

<script lang="ts">
import Vue from 'vue';
import debounce from 'just-debounce-it';
import { log, getValue, setValue } from '@/common';

function clamp(num: number, min: number, max: number) {
  return num <= min ? min : num >= max ? max : num;
}

export default Vue.extend({
  data() {
    return {
      value: 200,
      sliderValue: 200,
      id: 'options.wordsPerMinute',
      defaultValue: 200,
      sliderOutOfBounds: false,
    };
  },
  watch: {
    sliderValue(newValue: any, oldValue: any) {
      if (!this.sliderOutOfBounds) {
        this.value = newValue;
      }
    },
    value(newValue: any, oldValue: any) {
      this.sliderOutOfBounds = newValue < 100 || newValue > 400;
      this.sliderValue = clamp(newValue, 100, 400);

      // @ts-ignore
      this.debouncedSetValue(newValue);
    },
  },
  async created() {
    // @ts-ignore
    this.debouncedSetValue = debounce(this.setValue, 250);

    this.value = await getValue(this.id, this.defaultValue);
  },
  methods: {
    async setValue(newValue: number) {
      await setValue(this.id, newValue);
    },
    sliderStart(value: number) {
      this.value = value;
    },
  },
});
</script>

<style scoped>
.wpm-field {
  width: 40px;
  margin: 0;
}
.wpm-field >>> input {
  -moz-appearance: textfield;
}
</style>
