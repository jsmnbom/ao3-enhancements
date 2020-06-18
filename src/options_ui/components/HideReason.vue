<template lang="pug">
v-switch.mt-2.mb-2(
  :input-value='value',
  @change='setValue',
  hide-details,
  :label='label'
)
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { getOption, optionIds, setOption } from '@/common';

@Component
export default class SimpleBooleanOption extends Vue {
  id = optionIds.hideShowReason;
  value: boolean | null = null;

  async created(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    this.value = (await getOption(this.id!)) as boolean;
  }

  async setValue(newValue: boolean): Promise<void> {
    this.value = newValue;
    await setOption(this.id, newValue);
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
