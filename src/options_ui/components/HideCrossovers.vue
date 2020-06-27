<template lang="pug">
div
  v-switch.mt-2(
    hide-details,
    label='Hide works with many fandoms (crossovers).',
    v-model='enabled'
  )
  v-expand-transition
    v-slider.mt-2.column-slider(
      hide-details='auto',
      :min='1',
      :max='10',
      v-model.number='maxFandoms',
      step='1',
      thumb-label,
      ticks='always',
      :disabled='!enabled',
      tick-size='5',
      aria-label='Hide work when it has more than this many fandoms.'
    )
      template(v-slot:label)
        span Hide when more than <em>{{ maxFandoms }}</em> fandoms.
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { OPTION_IDS } from '@/common';

@Component
export default class HideCrossovers extends Vue {
  @PropSync(OPTION_IDS.hideCrossovers, { type: Boolean })
  enabled!: boolean;
  @PropSync(OPTION_IDS.hideCrossoversMaxFandoms, { type: Number })
  maxFandoms!: number;
}
</script>
