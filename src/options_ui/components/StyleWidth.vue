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
import { Vue, Component, Watch } from 'vue-property-decorator';
import { error, log, getOption, setOption, optionIds } from '@/common';

@Component
export default class StyleWidth extends Vue {
  enabled = false;
  width = 30;
  enabledId = optionIds.styleWidthEnabled;
  widthId = optionIds.styleWidth;

  async created() {
    this.enabled = await getOption(this.enabledId);
    this.width = await getOption(this.widthId);
  }

  @Watch('enabled')
  async watchEnabled(enabled: boolean) {
    await setOption(this.enabledId, enabled);
  }
  @Watch('width')
  async watchWidth(width: number) {
    await setOption(this.widthId, width);
  }
}
</script>
