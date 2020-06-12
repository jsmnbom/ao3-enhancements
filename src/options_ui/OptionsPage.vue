<template lang="pug">
v-app
  v-main.my-4.mx-1
    v-expansion-panels(tile, multiple, :value='[0, 1, 2]')
      category
        template(v-slot:label)
          span #[em Reading] and #[em finish at] times
        words-per-minute/
        simple-boolean-option(id='options.showTotalTime', :defaultValue='true')
          span Show #[em Reading time] for the entire work.
        simple-boolean-option(id='options.showTotalFinish', :defaultValue='true')
          span Show #[em Finish reading at] for the entire work.
        simple-boolean-option(id='options.showChapterWords', :defaultValue='true')
          span Show #[em Word count] for each chapter.
        simple-boolean-option(id='options.showChapterTime', :defaultValue='true')
          span Show #[em Reading time] for each chapter.
        simple-boolean-option(id='options.showChapterFinish', :defaultValue='true')
          span Show #[em Finish reading at] for each chapter.
      category
        template(v-slot:label)
          span Kodus/hits ratio
        simple-boolean-option(id='options.showKudosHitsRatio', :defaultValue='true')
          span Show kudos/hit ratio.
      category
        template(v-slot:label)
          span Hide works
        hide-crossovers

</template>

<script lang="ts">
import Vue from 'vue';
import SimpleBooleanOption from './SimpleBooleanOption.vue';
import Category from './Category.vue';
import WordsPerMinute from './WordsPerMinute.vue';
import HideCrossovers from './HideCrossovers.vue';

export default Vue.extend({
  components: {
    SimpleBooleanOption,
    Category,
    WordsPerMinute,
    HideCrossovers,
  },
});
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
