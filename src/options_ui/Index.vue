<template lang="pug">
v-app
  v-main.my-4.mx-1
    v-container
      v-row.mb-2(justify='center')
        v-tooltip(right)
          template(v-slot:activator='{ on, attrs }')
            svg(
              v-bind='attrs',
              v-on='on',
              preserveAspectRatio='xMidYMid meet',
              viewBox='0 0 24 24'
            )
              use(:href='iconUrl + "#main"')
          span AO3 Enhancements Options
      v-row(justify='center')
        v-col(cols=12, sm=10, md=8, lg=6)
          v-alert(
            border='left',
            colored-border,
            color='deep-purple accent-4',
            elevation='2',
            dense
          )
            span.text-body-2 AO3 Enhancements automatically saves options when you change them. They will also automatically apply to open AO3 tabs without needing refreshing.
      v-row(justify='center')
        v-col(cols=12, sm=10, md=8, lg=6)
          options/
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import Options from './Options.vue';

@Component({
  components: { Options },
})
export default class SimpleBooleanOption extends Vue {
  iconUrl = browser.runtime.getURL('icon.svg');
}
</script>

<style scoped>
svg {
  color: #970000;
  height: min(20vh, 20vw);
  cursor: default;
}
</style>
