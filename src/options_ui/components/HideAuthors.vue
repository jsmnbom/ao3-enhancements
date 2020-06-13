<template lang="pug">
div
  v-switch.mt-2(
    hide-details,
    label='Hide works based on their author.',
    v-model='enabled'
  )
  v-expand-transition
    v-combobox.mt-2(
      v-model.trim='selected',
      label='Hide works from these authors:',
      hint='Use <enter> after each author.',
      multiple,
      chips,
      small-chips,
      dense,
      :disabled='!enabled',
      v-show='enabled',
      filled
    )

</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { log, error, getOption, setOption, optionIds } from '@/common';

type Item = { text: string; value: string };

@Component
export default class HideAuthors extends Vue {
  enabled = false;
  enabledId = optionIds.hideAuthors;
  selectedId = optionIds.hideAuthorsList;
  selected = [] as string[];
  ready = false;

  async created() {
    this.enabled = await getOption(this.enabledId);
    this.selected = await getOption(this.selectedId);
    this.$nextTick(() => {
      this.ready = true;
    });
  }

  @Watch('enabled')
  async watchEnabled(newValue: boolean) {
    if (!this.ready) return;
    await setOption(this.enabledId, newValue);
  }
  @Watch('selected')
  async watchSelected(selected: Item[]) {
    if (!this.ready) return;
    await setOption(this.selectedId, selected);
  }
}
</script>
