<template lang="pug">
category#hide-works(,
  title='Hide works',
  subtitle='Hide works based on criteria.',
  :icon='icon',
  v-on='$listeners'
)
  hide-reason(v-bind.sync='opts')/
  hide-crossovers(v-bind.sync='opts')/
  hide-languages(v-bind.sync='opts')/
  hide-authors(v-bind.sync='opts')/
  hide-tags(v-bind.sync='opts')/
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiEyeOff } from '@mdi/js';

import { OPTION_IDS, Options } from '@/common';

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
  @PropSync('options', { type: Object }) opts!: Options;

  option = OPTION_IDS;

  icon = mdiEyeOff;
}
</script>
