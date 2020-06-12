<template lang="pug">
.d-flex.flex-row.mt-4.mb-6
  .flex-grow-1
    v-slider(
      label='Your reading speed',
      hide-details='auto',
      persistent-hint='',
      :min='100',
      :max='400',
      hint='Use a site like [SITE] to calculate.',
      v-model='sliderValue',
      @start='sliderStart'
    )
  div
    v-text-field.wpm-field(
      dense='',
      hide-details='',
      prefix='words/min.',
      reverse='',
      type='number',
      v-model='value',
      @focus='$event.target.select()'
    )

</template>

<script lang="ts">
import Vue from 'vue';
import debounce from 'just-debounce-it';
import { log, error } from '@/common';

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

    this.value = await browser.storage.local
      .get({ [this.id]: this.defaultValue })
      .then((obj) => {
        return <number>obj[this.id];
      })
      .catch((err) => {
        error(
          `Could not read ${this.id} from storage. Setting to default ${this.defaultValue}.`,
          err
        );
        return this.defaultValue;
      });
  },
  methods: {
    async setValue(newValue: number) {
      log(`Setting ${this.id} to ${newValue}.`);
      await browser.storage.local
        .set({ [this.id]: newValue })
        .catch((err) => {
          error(
            `Could not set ${this.id} with value ${newValue} to storage.`,
            err
          );
        });
    },
    sliderStart(value: number) {
      this.value = value;
    },
  },
});
</script>

<style scoped>
.wpm-field {
  width: 132px;
}
.wpm-field >>> input {
  -moz-appearance: textfield;
}
</style>
