<template lang="pug">
   v-app
      v-content.my-4.mx-1
        v-expansion-panels(tile multiple :value="[0, 1]")
          category
            template(v-slot:label)
              span <em>Reading</em> and <em>finish at</em> times
            words-per-minute
              boolean-option(id="options.showTotalTime" :defaultvalue="true")
                span Show <em>Reading time</em> for the entire fic.
              boolean-option(id="options.showTotalFinish" :defaultvalue="true")
                span Show <em>Finish reading at</em> for the entire fic.
              boolean-option(id="options.showChapterTime" :defaultvalue="true")
                span Show <em>Reading time</em> for each chapter.
              boolean-option(id="options.showChapterFinish" :defaultvalue="true")
                span Show <em>Finish reading at</em> for each chapter.
          category
            template(v-slot:label)
              span Kodus/hit ratio
            boolean-option(id="options.showKodusHitsRatio" :defaultvalue="true")
              span Show kodus/hit ratio.
</template>

<script lang="ts">
import Vue from 'vue';
import BooleanOption from './BooleanOption.vue';
import Category from './Category.vue';
import WordsPerMinute from './WordsPerMinute.vue';

export default Vue.extend({
  components: { BooleanOption, Category, WordsPerMinute },
  data() {
    return {
      test: '100',
    };
  },
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
