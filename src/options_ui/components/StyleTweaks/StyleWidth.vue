<template lang="pug">
div
  v-switch.mt-2(
    hide-details,
    label='Decrease width of work for easier reading on large screens.',
    v-model='enabled'
  )
  v-expand-transition
    v-slider.mt-2.column-slider(
      hide-details='auto',
      :min='1',
      :max='100',
      v-model='width',
      step='1',
      thumb-label,
      :disabled='!enabled',
      v-show='enabled',
      aria-label='Decrease work width by this many percent.'
    )
      template(v-slot:label)
        span Decrease width by <em>{{ width }}%</em>.
      template(v-slot:thumb-label='{ value }') {{ value }}%
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { OPTION_IDS } from '@/common';

@Component
export default class StyleWidth extends Vue {
  @PropSync(OPTION_IDS.styleWidthEnabled, { type: Boolean })
  enabled!: boolean;

  @PropSync(OPTION_IDS.styleWidth, { type: Number })
  width!: number;
}
</script>
