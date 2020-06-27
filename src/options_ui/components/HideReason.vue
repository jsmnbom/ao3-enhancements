<template lang="pug">
v-switch.mt-2.mb-2(
  v-model='value'
  hide-details,
  :label='label'
)
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { OPTION_IDS } from '@/common';

@Component
export default class SimpleBooleanOption extends Vue {
  @PropSync(OPTION_IDS.hideShowReason, { type: Boolean })
  value!: boolean;

  get label(): string {
    if (this.value) {
      return 'Show reason why work was hidden. (current: showing reason)';
    } else {
      return 'Show reason why work was hidden. (current: hiding work completely)';
    }
  }
}
</script>
