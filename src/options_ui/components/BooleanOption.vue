<template lang="pug">
div
  v-switch.mt-2.mb-2.switch.px-4.align-center(
    v-model='value',
    hide-details,
    style='min-height: 48px'
  )
    template(v-slot:label)
      .d-flex.flex-column
        span.text-subtitle-2(
          :class='["text-subtitle-2", $vuetify.theme.dark ? "white--text" : "black--text"].join(" ")'
        )
          slot(name='title', v-bind:value='value') {{ title }}
        span.text-subtitle-2.grey--text
          slot(name='subtitle', v-bind:value='value') {{ subtitle }}
  v-expand-transition
    slot(name='default', v-if='value')
</template>

<script lang="ts">
import { Vue, Component, Prop, PropSync } from 'vue-property-decorator';

import { options, Options } from '@/common/options';

@Component({
  inheritAttrs: false,
})
export default class BooleanOption extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @Prop(String) readonly id: options.Id | undefined;
  @Prop(String) readonly title: string | undefined;
  @Prop(String) readonly subtitle: string | undefined;

  get value(): boolean {
    return this.syncOptions![this.id!] as boolean;
  }

  set value(value: boolean) {
    (this.syncOptions![this.id!] as boolean) = value;
  }
}
</script>
