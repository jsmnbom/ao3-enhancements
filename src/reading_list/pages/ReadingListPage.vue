<template lang="pug">
div(style='z-index: 5; position: relative')
  .toolbar-wrapper(
    v-intersect='{ handler: onToolbarIntersect, options: { threshold: [1.0] } }'
  )
    v-toolbar.elevation-0(
      :class='{ "ao3-red-bg": $vuetify.breakpoint.xsOnly }'
    )
      v-app-bar-nav-icon(
        dark,
        @click.stop='$root.$children[0].drawer = !$root.$children[0].drawer',
        v-if='$vuetify.breakpoint.xsOnly'
      )
      v-row.flex-md-nowrap
        v-col.flex-grow-1.py-0.py-md-3(cols='auto')
          v-text-field(
            v-model='searchModel',
            solo,
            single-line,
            hide-details,
            :light='$vuetify.breakpoint.smAndDown',
            placeholder='Search works',
            :dense='$vuetify.breakpoint.smAndDown'
          )
            template(v-slot:prepend-inner)
              v-icon {{ $icons.mdiMagnify }}
        v-col.d-flex.justify-center.py-3(
          cols='auto',
          v-if='$vuetify.breakpoint.mdAndUp'
        )
          v-btn-toggle(v-model='filterStatusModel', mandatory)
            v-tooltip(v-for='item in filterStatus', bottom, :key='item.value')
              template(v-slot:activator='{ on, attrs }')
                v-btn(:value='item.value', v-bind='attrs', v-on='on')
                  v-icon(:class='`status--${item.value}`') {{ item.icon }}
              span {{ item.title }}
        v-col.d-flex.justify-center.py-0.pl-0(cols='auto', v-else)
          v-menu(offset-y)
            template(v-slot:activator='{ on, attrs }')
              v-btn(
                icon,
                small,
                fab,
                outlined,
                :dark='$vuetify.breakpoint.xsOnly',
                v-bind='attrs',
                v-on='on'
              )
                v-icon(
                  :class='`status--${filterStatus.find((x) => x.value === filterStatusModel).value}`'
                ) {{ filterStatus.find((x) => x.value === filterStatusModel).icon }}
            v-list(dense)
              v-subheader Filter works by status
              v-list-item-group(v-model='filterStatusModel')
                v-list-item(
                  v-for='item in filterStatus',
                  :key='item.value',
                  :value='item.value'
                )
                  v-list-item-icon: v-icon(:class='`status--${item.value}`') {{ item.icon }}
                  v-list-item-content: v-list-item-title {{ item.title }}
  v-card
    v-card-text.px-0.py-0
      v-data-iterator(
        :items='Object.values(workMapObject)',
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
        template(v-slot:default='{ groupedItems: groups }')
          template(v-for='{ name, items: groupedWorks } in groups')
            v-expansion-panels.sharp(accordion, v-model='open', ref='panels')
              .status-header.d-flex.justify-center
                .inner
                  v-tooltip(bottom)
                    template(v-slot:activator='{ on, attrs }')
                      v-icon(
                        :class='`status--${groupedWorks[0].status}`',
                        v-bind='attrs',
                        v-on='on',
                        :small='$vuetify.breakpoint.xsOnly'
                      ) {{ statusIcons[groupedWorks[0].status] }}
                    span {{ upperStatusText(groupedWorks[0].status) }}
                  span.py-2.subtitle-2.pl-2.font-weight-light(
                    v-if='$vuetify.breakpoint.xsOnly'
                  ) {{ upperStatusText(groupedWorks[0].status) }}
              reading-list-entry(
                v-for='(work, index) in groupedWorks',
                :work='workMapObject[work.workId]',
                :currentOffset.sync='currentOffset',
                :index='groups.slice( 0, groups.findIndex((group) => group.name === name) ).reduce((acc, cur) => acc + cur.items.length, 0) + index',
                :key='work.workId',
                @remove='remove(work.workId)',
                :style='index === 0 && $vuetify.breakpoint.smAndUp ? "margin-top: -64px" : ""'
              )
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch } from 'vue-property-decorator';
import Fuse from 'fuse.js';

import { Options } from '@/common/options';
import {
  upperStatusText,
  WorkMapObject,
  WorkStatus,
  WORK_STATUSES_ICONS,
} from '@/common/readingListData';

import ReadingListEntry from '../components/ReadingListEntry.vue';
import ReadingListWork from '../ReadingListWork';

@Component({
  components: { ReadingListEntry },
})
export default class ReadingListApp extends Vue {
  @PropSync('options', { type: Object }) syncOptions!: Options;
  @PropSync('works', { type: Object })
  workMapObject!: WorkMapObject<ReadingListWork>;

  statusIcons = WORK_STATUSES_ICONS;
  upperStatusText = upperStatusText;
  filterStatus = Object.entries(this.statusIcons).map(([value, icon]) => ({
    icon,
    value,
    title: value === 'all' ? 'All' : upperStatusText(value as WorkStatus),
  }));
  filterStatusModel = 'all';
  fuse!: Fuse<ReadingListWork>;
  searchModel = '';
  open: null | number = 1;
  currentOffset = [0, 0];
  appBarOffset = 0;

  @Watch('open')
  async onOpen(): Promise<void> {
    if (this.open === undefined) this.currentOffset = [0, 0];
    if (this.open) {
      await this.$router.replace(`/show/${this.open}`);
    } else {
      await this.$router.replace('/');
    }
  }

  @Watch('$route')
  onRouteChange(): void {
    if (this.$route.params && this.$route.params.workId) {
      if (parseInt(this.$route.params.workId) !== this.open) {
        this.open = parseInt(this.$route.params.workId);
      }
    }
  }

  setupFuse(): void {
    this.fuse = new Fuse(Object.values(this.workMapObject), {
      keys: [
        { name: 'title', weight: 0.7 },
        { name: 'author', weight: 0.3 },
      ],
    });
  }

  async created(): Promise<void> {
    this.setupFuse();

    await this.$nextTick();

    this.onRouteChange();
  }

  sort(works: ReadingListWork[]): ReadingListWork[] {
    const statusOrder = ['reading', 'toRead', 'onHold', 'read', 'dropped'];
    return works.sort((a: ReadingListWork, b: ReadingListWork) => {
      const status =
        statusOrder.indexOf(a.status!) - statusOrder.indexOf(b.status!);
      if (status !== 0) return status;
      const unread =
        (a.firstUnreadChapterIndex !== undefined ? -1 : 0) -
        (b.firstUnreadChapterIndex !== undefined ? -1 : 0);
      if (unread !== 0) return unread;
      if (this.searchModel) return 0;
      return a.title.localeCompare(b.title);
    });
  }

  filter(): ReadingListWork[] {
    let works = this.searchModel
      ? this.fuse.search(this.searchModel).map((r) => r.item)
      : Object.values(this.workMapObject);
    if (this.filterStatusModel !== 'all') {
      works = works.filter((work) => work.status === this.filterStatusModel);
    }
    return works;
  }

  onToolbarIntersect([{ intersectionRatio, target }]: [
    IntersectionObserverEntry
  ]): void {
    target.children[0].classList.toggle('elevation-5', intersectionRatio < 1);
    target.children[0].classList.toggle('elevation-0', intersectionRatio >= 1);
  }

  async remove(workId: number): Promise<void> {
    this.$emit('remove', workId);
  }
}
</script>

<style lang="scss">
@import '~vuetify/src/styles/settings/_variables';
.sharp {
  border-radius: 0 !important;
  ::v-deep > *::before {
    box-shadow: none;
  }
  &:last-of-type {
    border-bottom-left-radius: 4px !important;
    border-bottom-right-radius: 4px !important;
  }
}
.toolbar-wrapper {
  position: sticky;
  z-index: 5;
  top: -1px;

  margin-top: 0px;
  padding-top: 1px;
  height: 64px;
  pointer-events: none;
  @media #{map-get($display-breakpoints, 'sm-and-up')} {
    margin-top: -64px;
    padding-top: 1px;
    height: 64px;
  }

  .v-toolbar {
    pointer-events: all;
    height: 100% !important;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    ::v-deep .v-toolbar__content {
      height: 100% !important;
    }

    @media #{map-get($display-breakpoints, 'xs-only')} {
      border-top-left-radius: 0px;
      border-top-right-radius: 0px;
      margin-top: -1px;
    }
  }
}
.status-header {
  position: sticky;
  width: 100%;
  top: 64px;
  height: 28px;
  border-top: thin solid rgba(0, 0, 0, 0.12);
  z-index: 4;
  pointer-events: none;
  .inner {
    @media #{map-get($display-breakpoints, 'xs-only')} {
      padding: 0 5px;
      background: rgba(255, 255, 255, 0.88);
      height: min-content;
      border-radius: 5px;
      margin-top: 2px;
    }
  }
}
.theme--dark .status-header .inner {
  @media #{map-get($display-breakpoints, 'xs-only')} {
    background: rgba(30, 30, 30, 0.88);
  }
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
