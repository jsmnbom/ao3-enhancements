<template lang="pug">
div
  .px-4.my-2(style='min-height: 48px')
    v-row.align-center
      v-col.d-flex.flex-column
        span.text-subtitle-2(:id='id + "-label"') {{ title }}
        span.text-subtitle-2.grey--text {{ subtitle }}
      v-col.flex-grow-0
        v-select.field(
          v-model='value',
          :items='items',
          :aria-labelledby='id + "-label"',
          dense,
          hide-details,
          single-line,
          ref='field'
        )
</template>

<script lang="ts">
import { Vue, Component, Prop, PropSync, Watch } from 'vue-property-decorator';

import { options, Options } from '@/common/options';

@Component({
  inheritAttrs: false,
})
export default class SelectOption extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @Prop({ type: Array, required: true }) readonly items!: {
    text: string;
    value: string;
  }[];
  @Prop(String) readonly id: options.Id | undefined;
  @Prop(String) readonly title: string | undefined;
  @Prop(String) readonly subtitle: string | undefined;

  get value(): string {
    return this.syncOptions![this.id!] as string;
  }

  set value(value: string) {
    (this.syncOptions![this.id!] as string) = value;
  }

  @Watch('value')
  watchValue(newValue: string): void {
    const newText = this.items.find((item) => item.value === newValue)!.text;
    this.$logger.log(newText, (this.$refs['field'] as Vue).$refs);
    this.$nextTick(() => {
      const selections = (
        (this.$refs['field'] as Vue).$refs['input-slot'] as HTMLInputElement
      ).querySelector('div.v-select__selections')!;
      selections.style.width =
        (newText.toString().length + 2).toString() + 'ch';
    });
  }

  mounted(): void {
    this.watchValue(this.value);
  }
}
</script>

<style lang="scss" scoped>
.field ::v-deep .v-select__selections {
  transition: 0.3s width cubic-bezier(0.25, 0.8, 0.5, 1);
}
</style>