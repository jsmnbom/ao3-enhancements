<template lang="pug">
div(style='z-index: 5; position: relative')
  v-card.pa-0.sharp.mt-0.mt-sm-n16
    v-toolbar.elevation-0.ao3-red-bg(v-if='$vuetify.breakpoint.xsOnly', dark) 
      v-app-bar-nav-icon(
        @click.stop='$root.$children[0].drawer = !$root.$children[0].drawer'
      )
      v-toolbar-title Statistics

  v-row.totals
    v-col(cols='6')
      v-card.purple-box(dark)
        v-card-text.d-flex.flex-column
          span.text-subtitle-2 total words read
          span.text-h3 {{ totalWords }}
          v-icon.mr-4(size='80') {{ $icons.mdiNumeric }}
    v-col(cols='6')
      v-card.orange-box(dark)
        v-card-text.d-flex.flex-column
          span.text-subtitle-2 total chapters read
          span.text-h3 {{ totalChapters }}
          v-icon.mb-2.mr-4(size='80') {{ $icons.mdiBook }}
</template>

<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';

import { Options } from '@/common/options';
import { formatNumber } from '@/common/utils';
import { WorkMapObject } from '@/common/readingListData';

import ReadingListEntry from '../components/ReadingListEntry.vue';
import ReadingListWork from '../ReadingListWork';

@Component({
  components: { ReadingListEntry },
})
export default class StatisticsPage extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @PropSync('works', { type: Object })
  workMapObject!: WorkMapObject<ReadingListWork>;

  get totalWords(): string {
    return formatNumber(
      Object.values(this.workMapObject)
        .map((work) => {
          const wordsPerChapter = (work.wordCount || 0) / work.chapters.length;
          return (
            wordsPerChapter *
            work.chapters.filter((chapter) => chapter.readDate).length
          );
        })
        .reduce((a, b) => a + b, 0),
      1
    );
  }

  get totalChapters(): string {
    return formatNumber(
      Object.values(this.workMapObject)
        .map((work) => {
          return work.chapters.filter((chapter) => chapter.readDate).length;
        })
        .reduce((a, b) => a + b, 0),
      1
    );
  }
}
</script>

<style lang="scss" scoped>
.purple-box {
  background-image: linear-gradient(135deg, #ee9ae5 10%, #5961f9 100%);
}
.orange-box {
  background-image: linear-gradient(135deg, #ffd3a5 10%, #fd6585 100%);
}
.totals span {
  color: white !important;
  text-transform: capitalize;
  font-variant: small-caps;
}
.totals .v-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  color: rgba(255, 255, 255, 0.5) !important;
}
</style>