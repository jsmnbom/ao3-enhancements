<template lang="pug">
v-app
  v-app-bar(
    app,
    extended,
    flat,
    color='primary',
    dark,
    extension-height='48',
    height='64'
  )
    v-toolbar-items
      svg.icon(preserveAspectRatio='xMidYMid meet', viewBox='0 0 24 24')
        use(:href='iconUrl + "#ao3e-logo-main"')
    v-toolbar-title AO3 Enhancements Reading List
    v-spacer

    v-spacer
    v-tooltip(bottom)
      template(v-slot:activator='{ on, attrs }')
        v-btn(
          icon,
          href='options_ui.html#reading-list',
          v-bind='attrs',
          v-on='on'
        )
          v-icon {{ icons.mdiCog }}
      span Open Reading List Options
  v-main
    v-row(align='center', justify='center')
      v-col(cols='12', sm='10', md='10', lg='8', xl='6')
        .toolbar-wrapper(
          :style='toolbarWrapperStyles',
          v-intersect='{ handler: onToolbarIntersect, options: { threshold: [1.0] } }'
        )
          v-toolbar.elevation-0(style='height: 100%')
            v-row.flex-sm-nowrap
              v-col.flex-grow-1.pt-0.pt-sm-3(cols='12', sm='auto')
                v-text-field(
                  v-model='searchModel',
                  solo,
                  single-line,
                  hide-details,
                  placeholder='Search works',
                  :dense='$vuetify.breakpoint.xsOnly'
                )
                  template(v-slot:prepend-inner)
                    v-icon {{ icons.mdiMagnify }}
              v-col.d-flex.justify-center.py-0.py-sm-3(cols='12', sm='auto')
                v-btn-toggle(
                  v-model='filterStatusModel',
                  :dense='$vuetify.breakpoint.xsOnly',
                  mandatory
                )
                  v-tooltip(
                    v-for='item in filterStatus',
                    bottom,
                    :key='item.value'
                  )
                    template(v-slot:activator='{ on, attrs }')
                      v-btn(:value='item.value', v-bind='attrs', v-on='on')
                        v-icon(:class='`status--${item.value}`') {{ item.icon }}
                    span {{ item.title }}
        v-card(:style='cardStyles')
          div(v-if='options.user')
            v-divider
            v-card-text.px-0.py-0
              <!-- // TODO: Add pretty empty state -->
              v-data-iterator(
                :items='items',
                :items-per-page='-1',
                hide-default-footer,
                group-by='status',
                :custom-sort='sort',
                :custom-filter='filter',
                item-key='workId',
                :search='searchModel'
              )
                template(v-slot:default='{ items, isExpanded, expand }')
                  v-expansion-panels.sharp-top(accordion)
                    template(v-for='(item, index) in items')
                      entry(:entry.sync='item')
          div(v-else)
            v-row
              v-col(cols='12')
                v-icon.huge(color='error') {{ icons.mdiAlertOctagonOutline }}
            v-card-text.text-center
              h1.text-h5.text-sm-h4.text-md-h3 Reading list not set up correctly
              p.text-subtitle-1 Login on AO3, then go to #[a(href='/options_ui.html#reading-list') options] to set up your personal reading list.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// https://github.com/vuetifyjs/vuetify/issues/12224
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-named-as-default
import Ripple from 'vuetify/lib/directives/ripple';
import {
  mdiPencil,
  mdiTrashCan,
  mdiClose,
  mdiCog,
  mdiAllInclusive,
  mdiBookOpenVariant,
  mdiThumbDownOutline,
  mdiCheckOutline,
  mdiClock,
  mdiMagnify,
  mdiAlertOctagonOutline,
  mdiMenuOpen,
  mdiOpenInNew,
  mdiBook,
  mdiHandLeft,
} from '@mdi/js';
import Fuse from 'fuse.js';

import {
  ALL_OPTIONS,
  DEFAULT_OPTIONS,
  getListData,
  getOptions,
  ReadingStatus,
  upperStatusText,
} from '@/common';

import Entry from './Entry.vue';
import ReadingListReadingListItem from './ReadingListReadingListItem';

@Component({
  directives: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Ripple,
  },
  components: { Entry },
})
export default class ReadingList extends Vue {
  iconUrl = browser.runtime.getURL('icons/icon.svg');
  readingList: ReadingListReadingListItem[] = [];
  filterStatus = Object.entries({
    all: mdiAllInclusive,
    reading: mdiBookOpenVariant,
    toRead: mdiClock,
    onHold: mdiHandLeft,
    read: mdiCheckOutline,
    dropped: mdiThumbDownOutline,
  }).map(([value, icon]) => ({
    icon,
    value,
    title: value === 'all' ? 'All' : upperStatusText(value as ReadingStatus),
  }));
  filterStatusModel = 'all';
  icons = {
    mdiPencil,
    mdiTrashCan,
    mdiClose,
    mdiCog,
    mdiMagnify,
    mdiAlertOctagonOutline,
    mdiMenuOpen,
    mdiOpenInNew,
    mdiBook,
  };
  fuse!: Fuse<ReadingListReadingListItem>;
  searchModel = '';
  options = DEFAULT_OPTIONS;

  get items(): ReadingListReadingListItem[] {
    if (!this.readingList) return [];
    return this.readingList;
  }

  get toolbarWrapperStyles(): unknown {
    if (this.$vuetify.breakpoint.lgAndUp) {
      return {
        marginTop: '-64px',
        paddingTop: '1px',
        height: '64px',
      };
    }
    if (this.$vuetify.breakpoint.smAndUp) {
      return {
        marginTop: '-112px',
        paddingTop: '49px',
        height: '113px',
      };
    }
    return {
      marginTop: '-112px',
      paddingTop: '65px',
      height: '173px',
    };
  }

  get cardStyles(): unknown {
    if (this.$vuetify.breakpoint.lgAndUp) {
      return {
        zIndex: '5',
      };
    }
    return {};
  }

  async created(): Promise<void> {
    this.options = await getOptions(ALL_OPTIONS);
    this.readingList = await getListData(ReadingListReadingListItem);
    console.log(this.readingList);
    this.fuse = new Fuse(this.readingList, {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'author', weight: 0.3 },
      ],
    });
  }

  sort(items: ReadingListReadingListItem[]): ReadingListReadingListItem[] {
    const statusOrder = ['reading', 'toRead', 'onHold', 'read', 'dropped'];
    return items.sort(
      (a: ReadingListReadingListItem, b: ReadingListReadingListItem) => {
        const status =
          statusOrder.indexOf(a.status!) - statusOrder.indexOf(b.status!);
        if (status !== 0) return status;
        const unread =
          (a.firstUnreadChapterIndex !== undefined ? -1 : 0) -
          (b.firstUnreadChapterIndex !== undefined ? -1 : 0);
        if (unread !== 0) return unread;
        if (this.searchModel) return 0;
        return a.title.localeCompare(b.title);
      }
    );
  }

  filter(): ReadingListReadingListItem[] {
    let items = this.searchModel
      ? this.fuse.search(this.searchModel).map((r) => r.item)
      : this.readingList;
    if (this.filterStatusModel !== 'all') {
      items = items.filter((item) => item.status === this.filterStatusModel);
    }
    return items;
  }

  onToolbarIntersect([{ intersectionRatio, target }]: [
    IntersectionObserverEntry
  ]): void {
    target.children[0].classList.toggle('elevation-5', intersectionRatio < 1);
    target.children[0].classList.toggle('elevation-0', intersectionRatio >= 1);
  }

  private async setItem(item: ReadingListReadingListItem): Promise<void> {
    await item.save();
  }
}
</script>

<style>
/* * {
  animation: progress-circular-rotate 10s linear infinite;
} */
</style>

<style lang="scss" scoped>
.icon {
  margin-left: -6px !important;
  margin-right: 14px !important;
}
.icon {
  color: #970000;
  width: 48px;
  cursor: default;
}
.v-icon.huge {
  width: 100%;
  ::v-deep svg {
    width: 100%;
    height: 100%;
    max-height: 30vh;
  }
}
.sharp-top {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.toolbar-wrapper {
  position: sticky;
  top: -1px;
  z-index: 10;
  .v-toolbar {
    height: 100% !important;
    ::v-deep .v-toolbar__content {
      height: 100% !important;
    }
  }
}
</style>

<style lang="scss">
@use "sass:map";
$status-colors: (
  'read': hsl(240, 50%, 50%),
  'toRead': hsl(0, 0%, 50%),
  'reading': hsl(120, 50%, 50%),
  'dropped': hsl(0, 50%, 50%),
  'onHold': hsl(60, 50%, 50%),
);

@each $name, $color in $status-colors {
  .status--#{$name} {
    &.v-expansion-panel {
      border-left: 5px solid $color;
    }
    &.v-icon,
    &.v-rating .v-icon {
      color: $color !important;
      caret-color: $color !important;
    }
  }
}
</style>