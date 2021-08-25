<template lang="pug">
category#hide-works(
  title='Hide works',
  subtitle='Hide works based on criteria.',
  :icon='$icons.mdiEyeOff',
  v-on='$listeners'
)
  v-divider
  hide-reason(:options.sync='syncOptions')/
  v-divider
  hide-crossovers(:options.sync='syncOptions')/
  v-divider
  hide-languages(:options.sync='syncOptions')/
  v-divider
  hide-authors(:options.sync='syncOptions')/
  v-divider
  hide-tags(:options.sync='syncOptions')/
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { Options } from '@/common/options';

import Category from '../Category.vue';

import HideReason from './HideReason.vue';
import HideCrossovers from './HideCrossovers.vue';
import HideLanguages from './HideLanguages.vue';
import HideAuthors from './HideAuthors.vue';
import HideTags from './HideTags.vue';

@Component({
  components: {
    Category,
    HideReason,
    HideCrossovers,
    HideLanguages,
    HideAuthors,
    HideTags,
  },
})
export default class HideWorks extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
}
</script>
