<template lang="pug">
category#blurb-stats(
  title='Blurb statistics',
  subtitle='Add or improve stats for entire works.',
  :icon='icon',
  v-on='$listeners'
)
  v-divider
  boolean-option(
    :options.sync='syncOptions',
    :id='option.showTotalTime',
    title='Reading time'
  )
  v-divider
  boolean-option(
    :options.sync='syncOptions',
    :id='option.showTotalFinish',
    title='Finish reading at'
  )
  v-divider
  boolean-option(
    :options.sync='syncOptions',
    :id='option.showKudosHitsRatio',
    title='Kudos/hits ratio'
  )
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiChartBar } from '@mdi/js';

import { OPTION_IDS, Options } from '@/common';

import BooleanOption from '../BooleanOption.vue';
import Category from '../Category.vue';
import ABtn from '../ABtn.vue';

@Component({
  components: {
    BooleanOption,
    Category,
    ABtn,
  },
})
export default class BlurbStats extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;

  option = OPTION_IDS;

  icon = mdiChartBar;
}
</script>
