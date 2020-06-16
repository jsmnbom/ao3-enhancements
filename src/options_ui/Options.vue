<template lang="pug">
v-expansion-panels(multiple, hover, :value='[0, 1, 2, 3, 4]')
  category(
    :icon='icons.mdiAccountBox',
    title='About me',
    subtitle='Details used for calculation'
  )
    words-per-minute/

  category(
    :icon='icons.mdiChartBar',
    title='Blurb statistics',
    subtitle='Add or improve work stats!'
  )
    p.subtitle-1.mt-1.mb-1.font-italic Reading and 'Finish reading at' times
    simple-boolean-option(:id='optionIds.showTotalTime')
      span Show #[em Reading time] for the entire work.
    simple-boolean-option(:id='optionIds.showTotalFinish')
      span Show #[em Finish reading at] for the entire work.
    p.subtitle-1.mt-5.mb-1 Kodus/hits ratio
    simple-boolean-option(:id='optionIds.showKudosHitsRatio')
      span Show kudos/hit ratio.

  category(
    :icon='icons.mdiFileChart',
    title='Chapter statistics',
    subtitle='Add statistics to each chapter when reading.'
  ) 
    simple-boolean-option(:id='optionIds.showChapterWords')
      span Show #[em Word count] for each chapter.
    simple-boolean-option(:id='optionIds.showChapterTime')
      span Show #[em Reading time] for each chapter.
    simple-boolean-option(:id='optionIds.showChapterFinish')
      span Show #[em Finish reading at] for each chapter.
    //- simple-boolean-option(:id='optionIds.showChapterWords')
    //-   span Show #[em Updated date] for each chapter.

  category(
    :icon='icons.mdiEyeOff',
    title='Hide works',
    subtitle='Hide works/blurbs based on various filters!'
  )
    hide-reason/
    hide-crossovers/
    hide-languages/
    hide-authors/
    hide-tags/

  category(
    :icon='icons.mdiPalette',
    title='Style tweaks',
    subtitle='Make reading easier!'
  )
    style-width/

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import {
  mdiFileChart,
  mdiEyeOff,
  mdiPalette,
  mdiAccountBox,
  mdiChartBar,
} from '@mdi/js';

import SimpleBooleanOption from './components/SimpleBooleanOption.vue';
import Category from './components/Category.vue';
import WordsPerMinute from './components/WordsPerMinute.vue';
import HideReason from './components/HideReason.vue';
import HideCrossovers from './components/HideCrossovers.vue';
import HideLanguages from './components/HideLanguages.vue';
import HideAuthors from './components/HideAuthors.vue';
import HideTags from './components/HideTags.vue';
import StyleWidth from './components/StyleWidth.vue';

import { optionIds } from '@/common';

@Component({
  components: {
    Category,
    SimpleBooleanOption,
    WordsPerMinute,
    HideReason,
    HideCrossovers,
    HideLanguages,
    HideAuthors,
    HideTags,
    StyleWidth,
  },
})
export default class Options extends Vue {
  optionIds = optionIds;

  icons = {
    mdiFileChart,
    mdiEyeOff,
    mdiPalette,
    mdiAccountBox,
    mdiChartBar,
  };
}
</script>

<style>
@media (prefers-color-scheme: dark) {
  .v-slider__tick {
    background-color: rgba(255, 255, 255, 0.5) !important;
  }
  .v-slider__tick--filled {
    background-color: rgba(0, 0, 0, 0.5) !important;
  }
}
.v-select.v-input--dense .v-chip {
  margin: 4px !important;
}
</style>
