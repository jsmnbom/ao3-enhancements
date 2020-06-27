<template lang="pug">
v-expansion-panel
  v-expansion-panel-header
    span.text-h6.d-flex.flex-wrap.align-baseline
      v-icon.mr-1(small) {{ icon }}
      span.mr-2 {{ title }}
      span.text--secondary.body-2.subtitle {{ subtitle }}
  v-divider.divider
  v-expansion-panel-content.pb-2.pt-4
    slot
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Category extends Vue {
  @Prop(String) readonly icon: string | undefined;
  @Prop(String) readonly title: string | undefined;
  @Prop(String) readonly subtitle: string | undefined;
}
</script>

<style scoped>
.divider {
  display: none;
}
.v-expansion-panel--active .divider {
  display: block;
}
.subtitle {
  line-height: normal;
}
</style>
