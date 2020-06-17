<template lang="pug">
v-switch.mt-2.mb-2(
  :input-value='value',
  @change='setValue',
  hide-details,
  :label='label'
)
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { log, getOption, setOption, optionIds } from '@/common';

@Component
export default class SimpleBooleanOption extends Vue {
  id = optionIds.hideShowReason;
  value: boolean | null = null;

  async created() {
    this.value = <boolean>await getOption(this.id!);
  }

  async setValue(newValue: boolean) {
    this.value = newValue;
    await setOption(this.id!, newValue);
  }

  get label(): string {
    if (this.value) {
      return 'Show reason why work was hidden.';
    } else {
      return 'Hide work completely.';
    }
  }
}
</script>
