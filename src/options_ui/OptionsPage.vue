<template lang="pug">
v-app
  v-main.my-4.mx-1
    v-alert(
      border='left',
      colored-border,
      color='deep-purple accent-4',
      elevation='2'
      dense
    )
      span.text-caption AO3 Enhancements automatically saves options when you change them. They will also automatically apply to open AO3 tabs without refreshing.
    v-expansion-panels(tile, multiple, :value='[0, 1, 2, 3]')
      category
        template(v-slot:label)
          span.text-h6
            v-icon.mr-1.mb-1(small) {{ icons.mdiFormatListNumbered }}
            | Stats #[span.text--secondary.body-1 Supercharge the stats display!]
        p.subtitle-1.mt-1.mb-1.font-italic Reading and 'Finish reading at' times
        words-per-minute/
        simple-boolean-option(:id='optionIds.showTotalTime')
          span Show #[em Reading time] for the entire work.
        simple-boolean-option(:id='optionIds.showTotalFinish')
          span Show #[em Finish reading at] for the entire work.
        simple-boolean-option(:id='optionIds.showChapterTime')
          span Show #[em Reading time] for each chapter.
        simple-boolean-option(:id='optionIds.showChapterFinish')
          span Show #[em Finish reading at] for each chapter.
        p.subtitle-1.mt-5.mb-1 Chapter stats
        simple-boolean-option(:id='optionIds.showChapterWords')
          span Show #[em Word count] for each chapter.
        //- simple-boolean-option(:id='optionIds.showChapterWords')
        //-   span Show #[em Updated date] for each chapter.
        p.subtitle-1.mt-5.mb-1 Kodus/hits ratio
        simple-boolean-option(:id='optionIds.showKudosHitsRatio')
          span Show kudos/hit ratio.
      category
        template(v-slot:label)
          span.text-h6
            v-icon.mr-1.mb-1(small) {{ icons.mdiEyeOff }}
            | Hide works #[span.text--secondary.body-1 Hide works based on various filters!]
        hide-reason/
        hide-crossovers/
        hide-languages/
        hide-authors/
        hide-tags/
      category
        template(v-slot:label)
          span.text-h6
            v-icon.mr-1.mb-1(small) {{ icons.mdiPalette }}
            | Style tweaks #[span.text--secondary.body-1 Make reading easier!]
        style-width/

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { mdiFormatListNumbered, mdiEyeOff, mdiPalette } from '@mdi/js';

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
export default class OptionsPage extends Vue {
  optionIds = optionIds;

  icons = {
    mdiFormatListNumbered,
    mdiEyeOff,
    mdiPalette,
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
