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
          @click='$vuetify.goTo("#" + item.id, { offset: 16 })',
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
          v-alert(
            :color='["blue", $vuetify.theme.dark ? "darken-4" : "lighten-2"].join(" ")',
            dense,
            border='left',
            elevation='2',
            colored-border
          ).
            Please note that AO3 Enhancements does not currently sync data and options between browsers.
            This means that you have to configure all devices that you install it on.
          v-alert(
            :color='["purple", $vuetify.theme.dark ? "darken-4" : "lighten-2"].join(" ")',
            dense,
            border='left',
            elevation='2',
            colored-border
          ).
            If you find a bug or have a feature request please file an issue at the #[a(href='https://github.com/jsmnbom/ao3-enhancements', target='_blank') github repository].
            Or if you don't have a github account you can message me on twitter: #[a(href='https://twitter.com/jsmnbom', target='_blank') @jsmnbom]
          div(v-if='ready', ref='components')
            about-me(v-on='componentEvents', :options.sync='options')/
            readingList(v-on='componentEvents', :options.sync='options')/
            blurb-stats(v-on='componentEvents', :options.sync='options')/
            chapter-stats(v-on='componentEvents', :options.sync='options')/
            hide-works(v-on='componentEvents', :options.sync='options')/
            style-tweaks(v-on='componentEvents', :options.sync='options')/
            advanced(v-on='componentEvents', :options.sync='options')/
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import pDebounce from 'p-debounce';

import { options, Options } from '@/common/options';

import AboutMe from './components/AboutMe/AboutMe.vue';
import BlurbStats from './components/BlurbStats/BlurbStats.vue';
import ChapterStats from './components/ChapterStats/ChapterStats.vue';
import HideWorks from './components/HideWorks/HideWorks.vue';
import StyleTweaks from './components/StyleTweaks/StyleTweaks.vue';
import ABtn from './components/ABtn.vue';
import UserListItem from './components/UserListItem.vue';
import Advanced from './components/Advanced/Advanced.vue';
import ReadingList from './components/ReadingList/ReadingList.vue';

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
    UserListItem,
    Advanced,
    ReadingList,
  },
})
export default class OptionsUI extends Vue {
  iconUrl = browser.runtime.getURL('icons/icon.svg');

  drawer = this.$vuetify.breakpoint.mdAndUp;

  option = options.IDS;
  options = options.DEFAULT;

  ready = false;
  mainPadding = 0;

  nav: Nav[] = [];
  intersecting: { [id: string]: boolean } = {};

  debouncedSetOptions = pDebounce(this.setOptions.bind(this), 250);

  componentEvents = {
    'category-add-nav': this.addNav.bind(this),
    'category-on-intersect': this.onIntersect.bind(this),
  };

  @Watch('options', { deep: true })
  async watchOptions(newOptions: Options): Promise<void> {
    await this.debouncedSetOptions(newOptions);
  }

  async created(): Promise<void> {
    this.options = await options.get(options.ALL);
    this.$nextTick(() => {
      this.ready = true;
      this.$nextTick(() => {
        this.fixMainPadding();
        window.addEventListener('resize', this.fixMainPadding.bind(this));
      });
    });
  }

  fixMainPadding(): void {
    const children = (this.$refs.components as HTMLDivElement).children;
    const lastChild = children[children.length - 1];
    const height = lastChild.getBoundingClientRect().height;
    this.mainPadding = window.innerHeight - height - 44;
  }

  async setOptions(newOptions: Options): Promise<void> {
    if (!this.ready) return;
    await options.set(newOptions);
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

<style lang='scss'>
html {
  overflow-y: auto !important;
}
#app {
  background-color: #e4e4e4;
  background-repeat: repeat;
  background-size: auto auto;
  background-image: url('background.svg');
}
.theme--dark {
  &#app {
    background-color: #0a0a0a;
  }
  .v-slider__tick {
    background-color: rgba(255, 255, 255, 0.5) !important;
  }
  .v-slider__tick--filled {
    background-color: rgba(0, 0, 0, 0.5) !important;
  }
}
.v-application p {
  margin-bottom: 8px;
}
.v-select.v-input--dense .v-chip {
  margin: 4px !important;
}
.column-slider .v-input__slot {
  flex-direction: column;
  align-items: stretch;
}
.switch .v-input__control .v-input__slot {
  flex-direction: row-reverse;
}
</style>
