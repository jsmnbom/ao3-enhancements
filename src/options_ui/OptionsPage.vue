<template lang="pug">
v-app
  v-main.my-4.mx-1
    v-expansion-panels(tile, multiple, :value='[0, 1]')
      category
        template(v-slot:label)
          span #[em Reading] and #[em finish at] times
        words-per-minute/
        boolean-option(id='options.showTotalTime', :defaultValue='true')
          span Show #[em Reading time] for the entire fic.
        boolean-option(id='options.showTotalFinish', :defaultValue='true')
          span Show #[em Finish reading at] for the entire fic.
        boolean-option(id='options.showChapterWords', :defaultValue='true')
          span Show #[em Word count] for each chapter.
        boolean-option(id='options.showChapterTime', :defaultValue='true')
          span Show #[em Reading time] for each chapter.
        boolean-option(id='options.showChapterFinish', :defaultValue='true')
          span Show #[em Finish reading at] for each chapter.
      category
        template(v-slot:label)
          span Kodus/hit ratio
        boolean-option(id='options.showKudosHitsRatio', :defaultValue='true')
          span Show kudos/hit ratio.

</template>

<script lang="ts">
import Vue from 'vue';
import BooleanOption from './BooleanOption.vue';
import Category from './Category.vue';
import WordsPerMinute from './WordsPerMinute.vue';

export default Vue.extend({
  components: { BooleanOption, Category, WordsPerMinute },
});
</script>

<style lang="css">
/* @media (prefers-color-scheme: dark) {
  html,
  body {
    background-color: #202023;
    color: rgb(249, 249, 250);
    min-height: 300px;
  }
} */
</style>
