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
      v-model='fandoms',
      step='1',
      thumb-label,
      ticks='always',
      v-show='enabled',
      :disabled='!enabled',
      tick-size='5',
      aria-label='Hide work when it has more than this many fandoms.'
    )
      template(v-slot:label)
        span Hide when more than <em>{{ fandoms }}</em> fandoms.
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { error, log, getOption, setOption, optionIds } from '@/common';

@Component
export default class HideCrossovers extends Vue {
  enabled = false;
  fandoms = 4;
  enabledId = optionIds.hideCrossovers;
  fandomsId = optionIds.hideCrossoversMaxFandoms;
  ready = false;

  async created() {
    this.enabled = await getOption(this.enabledId);
    this.fandoms = await getOption(this.fandomsId);
    this.$nextTick(() => {
      this.ready = true;
    });
  }

  @Watch('enabled')
  async watchEnabled(newValue: boolean, oldValue: boolean) {
    if (!this.ready) return;
    await setOption(this.enabledId, newValue);
  }
  @Watch('fandoms')
  async watchFandoms(newValue: number, oldValue: number) {
    if (!this.ready) return;
    await setOption(this.fandomsId, newValue);
  }
}
</script>
