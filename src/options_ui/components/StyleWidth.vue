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
import { Vue, Component, Watch } from 'vue-property-decorator';
import { error, log, getOption, setOption, optionIds } from '@/common';

@Component
export default class StyleWidth extends Vue {
  enabled = false;
  width = 30;
  enabledId = optionIds.styleWidthEnabled;
  widthId = optionIds.styleWidth;
  ready = false;

  async created() {
    this.enabled = await getOption(this.enabledId);
    this.width = await getOption(this.widthId);
    this.$nextTick(() => {
      this.ready = true;
    });
  }

  @Watch('enabled')
  async watchEnabled(enabled: boolean) {
    if (!this.ready) return;
    await setOption(this.enabledId, enabled);
  }
  @Watch('width')
  async watchWidth(width: number) {
    if (!this.ready) return;
    await setOption(this.widthId, width);
  }
}
</script>
