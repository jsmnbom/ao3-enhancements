<template lang="pug">
category#blurb-stats(,
  title='Blurb statistics',
  subtitle='Add or improve work stats.',
  :icon='icon',
  v-on='$listeners'
)
  p.text--secondary.subtitle See the
    |
    |
    a-btn(@click='$vuetify.goTo("#style-tweaks")') style tweaks
    |
    | section for more
  p.subtitle-1.mt-1.mb-1.font-italic Reading and 'Finish reading at' times
  simple-boolean-option(v-bind.sync='opts', :id='option.showTotalTime')
    span Show #[em Reading time] for the entire work.
  simple-boolean-option(v-bind.sync='opts', :id='option.showTotalFinish')
    span Show #[em Finish reading at] for the entire work.
  p.subtitle-1.mt-5.mb-1 Kodus/hits ratio
  simple-boolean-option(
    v-bind.sync='opts',
    :id='option.showKudosHitsRatio'
  )
    span Show kudos/hit ratio.
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { mdiChartBar } from '@mdi/js';

import { OPTION_IDS, Options } from '@/common';

import SimpleBooleanOption from '../SimpleBooleanOption.vue';
import Category from '../Category.vue';
import ABtn from '../ABtn.vue';

@Component({
  components: {
    SimpleBooleanOption,
    Category,
    ABtn,
  },
})
export default class BlurbStats extends Vue {
  @PropSync('options', { type: Object }) opts!: Options;

  option = OPTION_IDS;

  icon = mdiChartBar;
}
</script>
