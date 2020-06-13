<template lang="pug">
div
  v-switch.mt-2(
    hide-details,
    label='Decrease width of work for easier reading on large screens.',
    v-model='enabled'
  )
  v-slider(
    hide-details='auto',
    :min='1',
    :max='100',
    v-model='width',
    step='1',
    thumb-label,
    :disabled='!enabled',
    aria-label='Decrease work width by this many percent.'
  )
    template(v-slot:label)
      span Decrease width by <em>{{ width }}%</em>.
    template(v-slot:thumb-label='{ value }') {{ value }}%

</template>

<script lang="ts">
import Vue from 'vue';
import { error, log, getValue, setValue } from '@/common';

export default Vue.extend({
  data() {
    return {
      enabled: false,
      width: 30,
      enabledId: 'options.styleWidthEnabled',
      widthId: 'options.styleWidth',
    };
  },
  async created() {
    this.enabled = await getValue(this.enabledId, this.enabled);
    this.width = await getValue(this.widthId, this.width);
  },
  watch: {
    async enabled(enabled: boolean) {
      await setValue(this.enabledId, enabled);
    },
    async width(width: number) {
      await setValue(this.widthId, width);
    },
  },
});
</script>
