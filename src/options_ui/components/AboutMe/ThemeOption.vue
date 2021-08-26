<template lang="pug">
div
  .px-4.my-2(style='min-height: 48px')
    v-row.align-center
      v-col.d-flex.flex-column
        span.text-subtitle-2(:id='id + "-label"') Preferred theme
        span.text-subtitle-2.grey--text Only used for AO3 Enhancements specific pages
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
import { Vue, Component, PropSync, Watch } from 'vue-property-decorator';

import { options, Options, Theme } from '@/common/options';

@Component({
  inheritAttrs: false,
})
export default class ThemeOption extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  readonly id = options.IDS.theme;

  get items(): { value: string; text: string }[] {
    const theme = this.syncOptions![this.id] as Theme;
    return [
      {
        text: `Inherit from AO3 (current: ${theme.current})`,
        value: 'inherit',
      },
      { text: 'Always Dark', value: 'dark' },
      { text: 'Always Light', value: 'light' },
    ];
  }

  get value(): Theme['chosen'] {
    const theme = this.syncOptions![this.id] as Theme;
    return theme.chosen;
  }

  set value(value: Theme['chosen']) {
    const theme = this.syncOptions![this.id!] as Theme;
    theme.chosen = value;
    (this.syncOptions![this.id] as Theme) = theme;
    this.$notification.add(
      'Theme setting will apply on next refresh',
      'success'
    );
  }

  @Watch('value')
  watchValue(newValue: string): void {
    const newText = this.items.find((item) => item.value === newValue)!.text;
    this.$logger.log(newText, (this.$refs['field'] as Vue).$refs);
    this.$nextTick(() => {
      const selections = (
        (this.$refs['field'] as Vue).$refs['input-slot'] as HTMLInputElement
      ).querySelector('div.v-select__selections')!;
      const selection = selections.children[0] as HTMLElement;
      selections.style.width = `${selection.scrollWidth}px`;
    });
  }

  mounted(): void {
    this.watchValue(this.value);
  }
}
</script>

<style lang="scss" scoped>
@import '~vuetify/src/styles/settings/_variables';
.field ::v-deep .v-select__selections {
  transition: 0.3s width map-get($transition, 'fast-in-fast-out');
  > .v-select__selection {
    overflow: visible;
  }
}
</style>