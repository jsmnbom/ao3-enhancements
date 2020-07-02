<template lang="pug">
div
  v-switch.mt-2(
    hide-details,
    label='Force alignment of text.',
    v-model='enabled'
  )
  v-expand-transition
    v-select.mt-2(
      v-if='enabled',
      :items='items',
      hide-details,
      label='Force this text alignment',
      filled,
      dense,
      v-model='value'
    )
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { OPTION_IDS, StyleAlign as StyleAlignType } from '@/common';

@Component
export default class StyleAlign extends Vue {
  @PropSync(OPTION_IDS.styleAlignEnabled, { type: Boolean })
  enabled!: StyleAlignType;

  @PropSync(OPTION_IDS.styleAlign, { type: String })
  value!: StyleAlignType;

  items = [
    {
      value: 'start',
      text: 'start (usually right)',
    },
    {
      value: 'end',
      text: 'end (usually left)',
    },
    {
      value: 'center',
      text: 'center',
    },
    {
      value: 'justify',
      text: 'justify',
    },
  ];
}
</script>
