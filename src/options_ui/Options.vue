<template lang="pug">
v-expansion-panels(multiple, hover, :value='[0, 1, 2, 3, 4, 5]')
  category#about-me(
    :icon='icons.mdiAccountBox',
    title='About me',
    subtitle='Details used for calculation'
  )
    p.subtitle-1.mt-1.mb-1.font-italic Reading speed
    words-per-minute#about-me--wpm(v-bind.sync='options')/
    p.subtitle-1.mt-1.mb-1.font-italic AO3 username
    username#about-me--username(v-bind.sync='options')/

  category#blurb-stats(
    :icon='icons.mdiChartBar',
    title='Blurb statistics',
    subtitle='Add or improve work stats!'
  )
    p.text--secondary.subtitle See the 'Style tweaks' section for more
    p.subtitle-1.mt-1.mb-1.font-italic Reading and 'Finish reading at' times
    simple-boolean-option(v-bind.sync='options', :id='option.showTotalTime')
      span Show #[em Reading time] for the entire work.
    simple-boolean-option(v-bind.sync='options', :id='option.showTotalFinish')
      span Show #[em Finish reading at] for the entire work.
    p.subtitle-1.mt-5.mb-1 Kodus/hits ratio
    simple-boolean-option(
      v-bind.sync='options',
      :id='option.showKudosHitsRatio'
    )
      span Show kudos/hit ratio.

  category#chapter-stats(
    :icon='icons.mdiFileChart',
    title='Chapter statistics',
    subtitle='Add statistics to each chapter when reading.'
  )
    p.text--secondary.subtitle See the 'Style tweaks' section for more
    simple-boolean-option(v-bind.sync='options', :id='option.showChapterWords')
      span Show #[em Word count] for each chapter.
    simple-boolean-option(v-bind.sync='options', :id='option.showChapterTime')
      span Show #[em Reading time] for each chapter.
    simple-boolean-option(
      v-bind.sync='options',
      :id='option.showChapterFinish'
    )
      span Show #[em Finish reading at] for each chapter.
    simple-boolean-option(v-bind.sync='options', :id='option.showChapterDate')
      span Show #[em Updated date] for each chapter.

  category#hide-works(
    :icon='icons.mdiEyeOff',
    title='Hide works',
    subtitle='Hide works/blurbs based on various filters!'
  )
    hide-reason(v-bind.sync='options')/
    hide-crossovers(v-bind.sync='options')/
    hide-languages(v-bind.sync='options')/
    hide-authors(v-bind.sync='options')/
    hide-tags(v-bind.sync='options')/

  category#style-tweaks(
    :icon='icons.mdiPalette',
    title='Style tweaks',
    subtitle='Make reading easier!'
  )
    style-width(v-bind.sync='options')/
    simple-boolean-option(v-bind.sync='options', :id='option.showStatsColumns')
      span Show stats (both blurb and chapter, if enabled) as columns

  category#track-works(
    :icon='icons.mdiRadar',
    title='Track works',
    subtitle='Show which works you already know about.'
  )
    track-works(v-bind.sync='options')/
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import {
  mdiAccountBox,
  mdiChartBar,
  mdiEyeOff,
  mdiFileChart,
  mdiPalette,
  mdiRadar,
} from '@mdi/js';
import debounce from 'just-debounce-it';

import {
  OPTION_IDS,
  setOptions,
  Options as OptionsType,
  getOptions,
  ALL_OPTIONS,
  DEFAULT_OPTIONS,
} from '@/common';
import SimpleBooleanOption from './components/SimpleBooleanOption.vue';
import Category from './components/Category.vue';
import WordsPerMinute from './components/WordsPerMinute.vue';
import HideReason from './components/HideReason.vue';
import HideCrossovers from './components/HideCrossovers.vue';
import HideLanguages from './components/HideLanguages.vue';
import HideAuthors from './components/HideAuthors.vue';
import HideTags from './components/HideTags.vue';
import StyleWidth from './components/StyleWidth.vue';
import TrackWorks from './components/TrackWorks.vue';
import Username from './components/Username.vue';

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
    TrackWorks,
    Username,
  },
})
export default class Options extends Vue {
  option = OPTION_IDS;

  options = DEFAULT_OPTIONS;
  ready = false;

  icons = {
    mdiFileChart,
    mdiEyeOff,
    mdiPalette,
    mdiAccountBox,
    mdiChartBar,
    mdiRadar,
  };

  @Watch('options', { deep: true })
  watchOptions(newOptions: OptionsType): void {
    this.debouncedSetOptions(newOptions);
  }

  debouncedSetOptions = debounce(this.setOptions.bind(this), 250);

  async created(): Promise<void> {
    this.options = await getOptions(ALL_OPTIONS);
    this.$nextTick(() => {
      this.ready = true;
    });
  }

  async setOptions(newOptions: OptionsType): Promise<void> {
    if (!this.ready) return;
    await setOptions(newOptions);
  }
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
.column-slider .v-input__slot {
  flex-direction: column;
  align-items: stretch;
}
</style>
