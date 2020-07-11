<template lang="pug">
v-app
  v-snackbar(
    app,
    v-model='$notification.showing',
    :color='$notification.color',
    :timeout='5000'
  ) {{ $notification.text }}
  v-app-bar(app, dark, v-if='!$vuetify.breakpoint.mdAndUp', dense)
    v-app-bar-nav-icon(@click.stop='drawer = !drawer')
    v-toolbar-title AO3 Enhancements Options
  v-navigation-drawer#drawer(
    app,
    v-model='drawer',
    dark,
    width='320px',
    :permanent='$vuetify.breakpoint.mdAndUp'
  )
    v-list
      v-list-item
        v-list-item-icon.icon
          svg(preserveAspectRatio='xMidYMid meet', viewBox='0 0 24 24') )
            use(:href='iconUrl + "#ao3e-logo-main"')
        v-list-item-content
          v-list-item-title.title AO3 Enhancements
          v-list-item-subtitle Options
      v-divider
      user-list-item(:options.sync='options')/
      v-divider
      template(v-for='item in nav')
        v-list-item(
          :key='item.id',
          @click='$vuetify.goTo("#" + item.id)',
          :input-value='navActive(item.id)'
        )
          v-list-item-icon.mr-6.ml-2
            v-icon {{ item.icon }}
          v-list-item-content
            v-list-item-title {{ item.title }}
  v-main(:style='`padding-bottom: ${mainPadding}px;`')
    v-container(fluid)
      v-row(align='center', justify='center')
        v-col(cols='12', sm='10', md='10', lg='8', xl='6')
          v-alert(:class='["blue", $vuetify.theme.dark ? "darken-4" : "lighten-2"]', dense).
            Please note that AO3 Enhancements does not currently sync data and options between browsers.
            This means that you have to configure all devices that you install it on.
            Other restrictions may also apply (see note under the Track Works feature).
          v-alert(:class='["purple", $vuetify.theme.dark ? "darken-4" : "lighten-2"]', dense).
            If you find a bug or have a feature request please file an issue at the #[a(href='https://github.com/jsmnbom/ao3-enhancements', target="_blank") github repository].
            Or if you don't have a github account you can message me on twitter: #[a(href='https://twitter.com/jsmnbom', target="_blank") @jsmnbom]
          v-sheet.px-6.pb-6.rounded(
            elevation='4',
            v-if='ready',
            ref='components'
          )
            about-me(v-on='componentEvents', :options.sync='options')/
            blurb-stats(v-on='componentEvents', :options.sync='options')/
            chapter-stats(v-on='componentEvents', :options.sync='options')/
            hide-works(v-on='componentEvents', :options.sync='options')/
            style-tweaks(v-on='componentEvents', :options.sync='options')/
            track-works(v-on='componentEvents', :options.sync='options')/
            advanced(v-on='componentEvents', :options.sync='options')/
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import debounce from 'just-debounce-it';

import {
  OPTION_IDS,
  setOptions,
  Options as OptionsType,
  getOptions,
  ALL_OPTIONS,
  DEFAULT_OPTIONS,
} from '@/common';

import AboutMe from './components/AboutMe/AboutMe.vue';
import BlurbStats from './components/BlurbStats/BlurbStats.vue';
import ChapterStats from './components/ChapterStats/ChapterStats.vue';
import HideWorks from './components/HideWorks/HideWorks.vue';
import StyleTweaks from './components/StyleTweaks/StyleTweaks.vue';
import TrackWorks from './components/TrackWorks/TrackWorks.vue';
import ABtn from './components/ABtn.vue';
import UserListItem from './components/UserListItem.vue';
import Advanced from './components/Advanced/Advanced.vue';

type Nav = {
  id: string;
  title: string;
  icon: string;
};

@Component({
  components: {
    ABtn,
    AboutMe,
    BlurbStats,
    ChapterStats,
    HideWorks,
    StyleTweaks,
    TrackWorks,
    UserListItem,
    Advanced,
  },
})
export default class OptionsUI extends Vue {
  iconUrl = browser.runtime.getURL('icons/icon.svg');

  drawer = this.$vuetify.breakpoint.mdAndUp;

  option = OPTION_IDS;
  options = DEFAULT_OPTIONS;

  ready = false;
  mainPadding = 0;

  nav: Nav[] = [];
  intersecting: { [id: string]: boolean } = {};

  debouncedSetOptions = debounce(this.setOptions.bind(this), 250);

  componentEvents = {
    'category-add-nav': this.addNav.bind(this),
    'category-on-intersect': this.onIntersect.bind(this),
  };

  @Watch('options', { deep: true })
  watchOptions(newOptions: OptionsType): void {
    this.debouncedSetOptions(newOptions);
  }

  async created(): Promise<void> {
    this.options = await getOptions(ALL_OPTIONS);
    this.$nextTick(() => {
      this.ready = true;
      this.$nextTick(() => {
        this.fixMainPadding();
        window.addEventListener('resize', this.fixMainPadding.bind(this));
      });
    });
  }

  fixMainPadding(): void {
    const children = (this.$refs.components as Vue).$children;
    const lastChild = children[children.length - 1];
    const el = lastChild.$el;
    const height = el.getBoundingClientRect().height;
    this.mainPadding = window.innerHeight - height;
  }

  async setOptions(newOptions: OptionsType): Promise<void> {
    if (!this.ready) return;
    await setOptions(newOptions);
  }

  navActive(id: string): boolean {
    const intersecting = Object.entries(this.intersecting)
      .filter(([_key, val]) => val)
      .map(([key, _val]) => key)
      .sort(
        (a, b) =>
          this.nav.findIndex(({ id }) => id === a) -
          this.nav.findIndex(({ id }) => id === b)
      );
    if (intersecting.length > 0) {
      return intersecting[0] == id;
    } else {
      return id == this.nav[this.nav.length - 1].id;
    }
  }

  onIntersect({
    id,
    isIntersecting,
  }: {
    id: string;
    isIntersecting: boolean;
  }): void {
    this.$set(this.intersecting, id, isIntersecting);
  }

  addNav(nav: Nav): void {
    this.nav.push(nav);
  }
}
</script>

<style scoped>
.icon {
  margin-left: -6px !important;
  margin-right: 14px !important;
}
.icon svg {
  color: #970000;
  width: 48px;
  cursor: default;
}
</style>

<style>
.v-application p {
  margin-bottom: 8px;
}
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
