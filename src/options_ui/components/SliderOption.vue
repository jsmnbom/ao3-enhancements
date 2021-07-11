<template lang="pug">
.px-4.py-1
  v-row.align-baseline
    v-col
      span.text-subtitle-2(:id='id + "-label"') {{ title }}
    v-col.flex-grow-0
      v-text-field.field.mr-2(
        :aria-labelledby='id + "-label"',
        dense,
        hide-details,
        type='number',
        v-model.number='value',
        single-line,
        @focus='$event.target.select()',
        ref='field'
      )
        template(v-slot:append)
          span.body-1.text--secondary {{ unit }}
  v-slider(
    :aria-labelledby='id + "-label"',
    hide-details='auto',
    persistent-hint,
    v-bind='$attrs',
    thumb-label,
    :min='min',
    :max='max',
    v-model.number='sliderValue',
    @start='sliderStart',
    ref='slider'
  )
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, PropSync } from 'vue-property-decorator';

import { OptionId, Options } from '@/common';

function clamp(num: number, min: number, max: number) {
  return num <= min ? min : num >= max ? max : num;
}

@Component
export default class SliderOption extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @Prop(String) readonly id: OptionId | undefined;
  @Prop(String) readonly title: string | undefined;
  @Prop(String) readonly unit: string | undefined;
  @Prop(Number) readonly min: number | undefined;
  @Prop(Number) readonly max: number | undefined;
  @Prop(String) readonly unitPadding: string | undefined;

  sliderValue = null as number | null;
  sliderOutOfBounds = false;

  get value(): number {
    return this.syncOptions![this.id!] as number;
  }

  set value(value: number) {
    (this.syncOptions![this.id!] as number) = value;
  }

  @Watch('sliderValue')
  watchSliderValue(newValue: number): void {
    if (!this.sliderOutOfBounds) {
      this.value = newValue;
    }
  }
  @Watch('value')
  watchValue(newValue: number): void {
    console.log(this.$refs['slider']);
    this.sliderOutOfBounds = newValue < this.min! || newValue > this.max!;
    this.sliderValue = clamp(newValue, this.min!, this.max!);
    this.$nextTick(() => {
      const fieldInput = (this.$refs['field'] as Vue).$refs[
        'input'
      ] as HTMLInputElement;
      fieldInput.style.width = newValue.toString().length.toString() + 'ch';
    });
  }

  created(): void {
    this.watchValue(this.value);
    this.sliderValue = this.value;
    this.$nextTick(() => {
      const fieldAppendinner = (this.$refs['field'] as Vue).$refs[
        'append-inner'
      ] as HTMLInputElement;
      console.log(fieldAppendinner, this.$refs['field']);
      fieldAppendinner.style.paddingLeft = this.unitPadding!;
    });
  }

  sliderStart(value: number): void {
    this.value = value;
  }
}
</script>

<style scoped>
.field >>> input {
  -moz-appearance: textfield;
  text-align: right;
}
.field >>> input::-webkit-outer-spin-button,
.field >>> input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.field >>> .v-input__append-inner {
  margin-top: 2px !important;
}
</style>
