<template lang="pug">
category#hide-works(,
  title='Hide works',
  subtitle='Hide works based on criteria.',
  :icon='icon',
  v-on='$listeners'
)
  hide-reason(v-bind.sync='_options')/
  hide-crossovers(v-bind.sync='_options')/
  hide-languages(v-bind.sync='_options')/
  hide-authors(v-bind.sync='_options')/
  hide-tags(v-bind.sync='_options')/
</template>

<script lang="ts">
import { Component, Vue, PropSync, Prop } from 'vue-property-decorator';
import { OPTION_IDS, Options } from '@/common';

import HideReason from './HideReason.vue';
import HideCrossovers from './HideCrossovers.vue';
import HideLanguages from './HideLanguages.vue';
import HideAuthors from './HideAuthors.vue';
import HideTags from './HideTags.vue';
import Category from '../Category.vue';
import { mdiEyeOff } from '@mdi/js';

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
  @PropSync('options', { type: Object }) _options!: Options;

  option = OPTION_IDS;

  icon = mdiEyeOff;
}
</script>
