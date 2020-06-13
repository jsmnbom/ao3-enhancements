<template lang="pug">
div
  v-switch.mt-2(
    hide-details,
    label='Hide works with many fandoms (crossovers).',
    v-model='enabled'
  )
  v-slider(
    hide-details='auto',
    :min='1',
    :max='10',
    v-model='fandoms',
    step='1',
    thumb-label,
    ticks='always',
    :disabled='!enabled',
    tick-size='5',
    aria-label='Hide work when it has more than this many fandoms.'
  )
    template(v-slot:label)
      span Hide when more than <em>{{ fandoms }}</em> fandoms.

</template>

<script lang="ts">
import Vue from 'vue';
import { error, log, getValue, setValue } from '@/common';

export default Vue.extend({
  data() {
    return {
      enabled: false,
      fandoms: 4,
      enabledId: 'options.hideCrossovers',
      fandomsId: 'options.hideCrossoversMaxFandoms',
    };
  },
  async created() {
    this.enabled = await getValue(this.enabledId, this.enabled);
    this.fandoms = await getValue(this.fandomsId, this.fandoms);
  },
  watch: {
    async enabled(newValue: boolean, oldValue: boolean) {
      await setValue(this.enabledId, newValue);
    },
    async fandoms(newValue: number, oldValue: number) {
      await setValue(this.fandomsId, newValue);
    },
  },
});
</script>
