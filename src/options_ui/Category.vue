<template lang="pug">
v-expansion-panel
  v-expansion-panel-header
    slot(name='label')
  v-divider.divider
  v-expansion-panel-content
    slot

</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({});
</script>

<style scoped>
.divider {
  display: none;
}
.v-expansion-panel--active .divider {
  display: block;
}
</style>
