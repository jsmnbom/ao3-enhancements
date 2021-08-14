<template lang="pug">
boolean-option(
  :options.sync='syncOptions',
  :id='option.hideShowReason',
  title='Show reason work was hidden'
)
  template(v-slot:subtitle='{ value }')
    span(v-if='value') Current: showing reason
    span(v-else) Current: hide work completely
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { options, Options } from '@/common/options';

import BooleanOption from '../BooleanOption.vue';

@Component({
  components: {
    BooleanOption,
  },
})
export default class HideReason extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = options.IDS;
}
</script>
