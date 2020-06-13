<template lang="pug">
v-switch.mt-2.mb-2(:input-value='value', @change='setValue', hide-details)
  template(v-slot:label)
    slot

</template>

<script lang="ts">
import Vue from 'vue';
import { log, getValue, setValue } from '@/common';

export default Vue.extend({
  props: {
    id: String,
    defaultValue: Boolean,
  },
  data() {
    return {
      value: this.defaultValue,
    };
  },
  async created() {
    this.value = await getValue(this.id, this.defaultValue);
  },
  methods: {
    async setValue(newValue: boolean) {
      await setValue(this.id, newValue);
    },
  },
});
</script>