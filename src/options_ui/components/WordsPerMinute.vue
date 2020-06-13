<template lang="pug">
div.mt-2.mb-6
  .d-flex.flex-row.mb-2
    .d-flex.flex-row.align-center 
      span.body-1.mr-1.text--secondary#wpm-label My reading speed is
      v-text-field.wpm-field(
        aria-labelledby='wpm-label'
        dense,
        hide-details,
        type='number',
        v-model='value',
        single-line,
        @focus='$event.target.select()'
      )
      span.body-1.ml-2.text--secondary words/min.
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
  p.body-2.text--secondary Tip: You can use a site like #[a(href="http://www.readingsoft.com/") this] to calculate your reading speed.


</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import debounce from 'just-debounce-it';
import { log, getOption, setOption, optionIds } from '@/common';

function clamp(num: number, min: number, max: number) {
  return num <= min ? min : num >= max ? max : num;
}

@Component
export default class WordsPerMinute extends Vue {
  value = null as number | null;
  sliderValue = null as number | null;
  id = optionIds.wordsPerMinute;
  sliderOutOfBounds = false;
  ready = false;

  debouncedSetOption = debounce(this.setOption, 250);

  async created() {
    this.value = <number>await getOption(this.id);
    this.$nextTick(() => {
      this.ready = true;
    });
  }

  @Watch('sliderValue')
  watchSliderValue(newValue: any) {
    if (!this.sliderOutOfBounds) {
      this.value = newValue;
    }
  }
  @Watch('value')
  watchValue(newValue: any) {
    this.sliderOutOfBounds = newValue < 100 || newValue > 400;
    this.sliderValue = clamp(newValue, 100, 400);

    if (!this.ready) return;
    this.debouncedSetOption(newValue);
  }

  async setOption(newValue: number) {
    await setOption(this.id, newValue);
  }
  sliderStart(value: number) {
    this.value = value;
  }
}
</script>

<style scoped>
.wpm-field {
  width: 40px;
  margin: 0;
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
