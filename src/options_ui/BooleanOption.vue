<template lang="pug">
  v-switch.mt-2.mb-2(:input-value="value" @change="setValue" hide-details)
      template(v-slot:label)
        slot
</template>

<script lang="ts">
import Vue from 'vue';
import { error, log } from '@/common';

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
    this.value = await browser.storage.local
      .get({ [this.id]: this.defaultValue })
      .then((obj) => {
        return <boolean>obj[this.id];
      })
      .catch((err) => {
        error(
          `Could not read ${this.id} from storage. Setting to default ${this.defaultValue}.`,
          err
        );
        return this.defaultValue;
      });
  },
  methods: {
    async setValue(newValue: boolean) {
      log(`Setting ${this.id} to ${newValue}.`);
      await browser.storage.local.set({ [this.id]: newValue }).catch((err) => {
        error(
          `Could not set ${this.id} with value ${newValue} to storage.`,
          err
        );
      });
    },
  },
});
</script>
<style scoped>
input[type='checkbox'] {
  vertical-align: middle;
}
</style>
