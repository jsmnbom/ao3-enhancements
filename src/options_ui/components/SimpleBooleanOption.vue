<template lang="pug">
v-switch.mt-2.mb-2(v-model='value', hide-details)
  template(v-slot:label)
    slot
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import { OptionId } from '@/common';

@Component({
  inheritAttrs: false,
})
export default class SimpleBooleanOption extends Vue {
  @Prop(String) readonly id: OptionId | undefined;

  get value(): boolean {
    return (this.$attrs[this.id!] as unknown) as boolean;
  }

  set value(value: boolean) {
    this.$emit(`update:${this.id}`, value);
  }
}
</script>
