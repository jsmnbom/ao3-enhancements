<template lang="pug">
v-app
  v-main.my-4.mx-1
    v-expansion-panels(tile, multiple, :value='[0, 1, 2, 3]')
      category
        template(v-slot:label)
          span.text-h6 Stats #[span.text--secondary.body-1 Improvements and additions to a work's stats display]
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
          span.text-h6 Hide works #[span.text--secondary.body-1 Hide works based on various filters]
        hide-crossovers/
        hide-languages/
      category
        template(v-slot:label)
          span.text-h6 Style tweaks #[span.text--secondary.body-1 Stylistic improvements to make your reading experience]
        style-width/
        

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import SimpleBooleanOption from './components/SimpleBooleanOption.vue';
import Category from './components/Category.vue';
import WordsPerMinute from './components/WordsPerMinute.vue';
import HideCrossovers from './components/HideCrossovers.vue';
import HideLanguages from './components/HideLanguages.vue';
import StyleWidth from './components/StyleWidth.vue';

import { optionIds } from '@/common';

@Component({
  // Specify `components` option.
  // See Vue.js docs for all available options:
  // https://vuejs.org/v2/api/#Options-Data
  components: {
    Category,
    SimpleBooleanOption,
    WordsPerMinute,
    HideCrossovers,
    HideLanguages,
    StyleWidth,
  },
})
export default class OptionsPage extends Vue {
  optionIds = optionIds;
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
</style>
