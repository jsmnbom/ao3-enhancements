<template lang="pug">
v-switch.mt-2.mb-2(:input-value='value', @change='setValue', hide-details)
  template(v-slot:label)
    slot
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { getOption, setOption, OptionId } from '@/common';

@Component
export default class SimpleBooleanOption extends Vue {
  @Prop(String) readonly id: OptionId | undefined;

  value: boolean | null = null;

  async created(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    this.value = (await getOption(this.id!)) as boolean;
  }

  async setValue(newValue: boolean): Promise<void> {
    await setOption(this.id!, newValue);
  }
}
</script>
