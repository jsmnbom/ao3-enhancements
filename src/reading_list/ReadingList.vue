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
    v-toolbar-title(v-if='$vuetify.breakpoint.xsOnly') Reading List
    v-toolbar-title(v-else) AO3 Enhancements Reading List
    v-spacer
    v-tooltip(bottom)
      template(v-slot:activator='{ on, attrs }')
        v-badge.mr-4(color='green', content='', overlap, :value='false')
          v-btn(
            v-bind='attrs',
            v-on='on',
            icon,
            disabled,
            v-if='$vuetify.breakpoint.xsOnly'
          )
            v-icon {{ icons.mdiReload }}
          v-btn(v-bind='attrs', v-on='on', plain, v-else, disabled)
            v-icon.mr-2.ml-0(right) {{ icons.mdiReload }}
            span Sync
      span Sync
    v-tooltip(bottom)
      template(v-slot:activator='{ on, attrs }')
        v-btn(
          href='options_ui.html',
          v-bind='attrs',
          v-on='on',
          icon,
          v-if='$vuetify.breakpoint.xsOnly'
        )
          v-icon {{ icons.mdiCog }}
        v-btn(href='options_ui.html', v-bind='attrs', v-on='on', plain, v-else)
          v-icon.mr-2.ml-0(right) {{ icons.mdiCog }}
          span Options
      span Open AO3 Enhancements Options
  v-main
    v-row(align='center', justify='center')
      v-col(cols='12', sm='10', md='10', lg='8', xl='6')
        .toolbar-wrapper(
          v-intersect='{ handler: onToolbarIntersect, options: { threshold: [1.0] } }'
        )
          v-toolbar.elevation-0
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
          div
            v-divider
            v-card-text.px-0.py-0
              v-data-iterator(
                :items='listItems',
                :items-per-page='-1',
                hide-default-footer,
                group-by='status',
                :custom-sort='sort',
                :custom-filter='filter',
                item-key='workId',
                :search='searchModel',
                ref='iterator'
              )
                template(v-slot:no-data)
                  v-row.pt-2.pb-4.px-3.px-sm-0(no-gutters)
                    v-spacer
                    v-col.text-center(cols='12', sm='6')
                      h1.text-subtitle-1 Works that you're reading and have read will show up here.
                      h1.text-subtitle-2 Goto AO3 to get started :)
                    v-spacer
                template(v-slot:no-results)
                  v-row.pt-2.pb-4.px-3.px-sm-0(no-gutters)
                    v-spacer
                    v-col.text-center(cols='12', sm='6')
                      h1.text-subtitle-1 No works found with current search and filter.
                    v-spacer
                template(v-slot:default='{ groupedItems }')
                  template(v-for='{ name, items } in groupedItems')
                    v-expansion-panels.sharp(
                      accordion,
                      v-model='open',
                      ref='panels'
                    )
                      .status-header.d-flex.justify-center
                        div
                          v-tooltip(bottom)
                            template(v-slot:activator='{ on, attrs }')
                              v-icon(
                                :class='`status--${items[0].status}`',
                                v-bind='attrs',
                                v-on='on'
                              ) {{ statusIcons[items[0].status] }}
                            span {{ upperStatusText(items[0].status) }}
                          span.py-2.subtitle-1.pl-2(
                            v-if='$vuetify.breakpoint.xsOnly'
                          ) {{ upperStatusText(items[0].status) }}
                      entry(
                        v-for='(item, index) in items',
                        :entry.sync='item',
                        :key='item.workId',
                        @remove='remove(item.workId)',
                        :style='index === 0 && $vuetify.breakpoint.smAndUp ? "margin-top: -64px" : ""'
                      )
          //- div(v-else)
          //-   v-row
          //-     v-col(cols='12')
          //-       v-icon.huge(color='error') {{ icons.mdiAlertOctagonOutline }}
          //-   v-card-text.text-center
          //-     h1.text-h5.text-sm-h4.text-md-h3 Reading list not set up correctly
          //-     p.text-subtitle-1 Login on AO3, then go to #[a(href='/options_ui.html#reading-list') options] to set up your personal reading list.
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
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
  mdiReload,
} from '@mdi/js';
import Fuse from 'fuse.js';

import {
  ALL_OPTIONS,
  DEFAULT_OPTIONS,
  getOptions,
  ReadingListData,
  ReadingStatus,
  upperStatusText,
} from '@/common';

import Entry from './Entry.vue';
import ReadingListReadingListItem from './ReadingListReadingListItem';

@Component({
  components: { Entry },
})
export default class ReadingList extends Vue {
  iconUrl = browser.runtime.getURL('icons/icon.svg');
  readingList!: ReadingListData<typeof ReadingListReadingListItem>;
  statusIcons = {
    all: mdiAllInclusive,
    reading: mdiBookOpenVariant,
    toRead: mdiClock,
    onHold: mdiHandLeft,
    read: mdiCheckOutline,
    dropped: mdiThumbDownOutline,
  };
  upperStatusText = upperStatusText;
  filterStatus = Object.entries(this.statusIcons).map(([value, icon]) => ({
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
    mdiReload,
  };
  fuse!: Fuse<ReadingListReadingListItem>;
  searchModel = '';
  options = DEFAULT_OPTIONS;
  open: null | number = 1;
  items: Record<number, ReadingListReadingListItem> = {};

  get listItems(): ReadingListReadingListItem[] {
    return Array.from(Object.values(this.items));
  }

  get cardStyles(): unknown {
    if (this.$vuetify.breakpoint.lgAndUp) {
      return {
        zIndex: '5',
      };
    }
    return {};
  }

  setupFuse(): void {
    this.fuse = new Fuse(this.listItems, {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'author', weight: 0.3 },
      ],
    });
  }

  async created(): Promise<void> {
    this.options = await getOptions(ALL_OPTIONS);
    this.readingList = new ReadingListData(ReadingListReadingListItem);
    this.items = await this.readingList.get();
    console.log(this.items);
    this.setupFuse();

    this.readingList.addListener((workId, item) => {
      if (item === null) {
        Vue.delete(this.items, workId);
      } else {
        Vue.set(this.items, workId, item);
      }
    }, null);

    this.$nextTick(() => {
      // If got here via work link
      const query = new URL(window.location.href).searchParams;
      const show = query.get('show');
      if (show) {
        const workId = parseInt(show);
        const index = this.sort(this.filter()).findIndex(
          (item) => item.workId === workId
        );
        if (index !== null) {
          this.open = index;
          // TODO: Will this work now that it's multiple panels
          void this.$vuetify.goTo(
            (this.$refs.panels as Vue).$children[index].$el as HTMLElement
          );
        }
      }
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
      : this.listItems;
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

  remove(workId: number): void {
    Vue.delete(this.items, workId);
  }
}
</script>

<style>
/* * {
  animation: progress-circular-rotate 10s linear infinite;
} */
</style>

<style lang="scss" scoped>
@import '~vuetify/src/styles/settings/_variables';
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
.sharp {
  border-radius: 0;
  ::v-deep > *::before {
    box-shadow: none;
  }
  &:last-of-type {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
}
.toolbar-wrapper {
  position: sticky;
  top: -1px;
  z-index: 10;

  margin-top: -112px;
  padding-top: 65px;
  height: 173px;
  @media #{map-get($display-breakpoints, 'sm-and-up')} {
    padding-top: 49px;
    height: 113px;
  }
  @media #{map-get($display-breakpoints, 'lg-and-up')} {
    margin-top: -64px;
    padding-top: 1px;
    height: 64px;
  }

  .v-toolbar {
    height: 100% !important;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    ::v-deep .v-toolbar__content {
      height: 100% !important;
    }
  }
}
.status-header {
  position: sticky;
  width: 100%;
  top: 64px;
  // padding-top: 1px;
  height: 32px;
}
@media #{map-get($display-breakpoints, 'sm-and-up')} {
  .status-header {
    height: 64px;
  }
  .status-header > div {
    position: absolute;
    top: 0;
    left: -32px;
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