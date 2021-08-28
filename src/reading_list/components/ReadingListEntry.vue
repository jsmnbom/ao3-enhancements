
<template lang="pug">
lazy-expansion-panel(
  :value='work.workId',
  :class='`status--${work.status} work elevation-0`',
  :options='{ threshold: 0 }',
  transition='fade-transition',
  ref='panel'
)
  v-expansion-panel-header.pr-4(style='min-height: 90px', ref='header')
    template(v-slot:default='{ open }')
      v-row.pr-1(style='max-width: 100%')
        v-col.d-flex.flex-column.justify-center.py-1.header(
          cols='9',
          :class='{ "header-ellipsis": !open }'
        )
          v-rating(
            readonly,
            :value='work.rating',
            :length='work.rating',
            size='12px',
            :class='`status--${work.status}`'
          )
          span.text-subtitle-1 {{ work.title }}
          span.text-subtitle-2.font-weight-regular by {{ work.author }}
          span.font-weight-light {{ work.fandoms ? work.fandoms.join(", ") : "unknown fandom" }}
        v-col.d-flex.align-center.justify-center.flex-wrap(cols='3')
          v-fade-transition
            v-tooltip(
              bottom,
              v-if='work.firstUnreadChapterIndex !== undefined'
            )
              template(v-slot:activator='{ on, attrs }')
                v-btn(
                  v-bind='attrs',
                  v-on='on',
                  plain,
                  :href='work.chapters[work.firstUnreadChapterIndex].getHref(true)',
                  target='_blank',
                  @click.stop,
                  :x-small='$vuetify.breakpoint.xsOnly'
                )
                  v-icon.mr-0(right) {{ $icons.mdiBook }}
                  span Unread
              span Open first unread chapter
          v-spacer
          v-fade-transition
            .show-overflow.d-flex.align-center.flex-grow-1.justify-end(
              :style='{ visibility: open ? "hidden" : "" }',
              v-if='$vuetify.breakpoint.smAndUp'
            )
              .mt-n2
                sup.text-subtitle-1(style='top: 0') {{ work.chaptersReadCount }}
                | /
                sub {{ work.chapters.length }}
            div.flex-grow-1.text-right(v-else)
              span {{ work.chaptersReadCount }}/{{ work.chapters.length }}
  v-expansion-panel-content(ref='content')
    v-divider
    .my-3.mx-1
      donut-chart.float-right.mr-4.mb-2(
        ref='chart',
        :data='chartData',
        :options='chartOptions',
        v-if='$vuetify.breakpoint.smAndUp',
        @hook:mounted='chartMounted'
      )
        .chart-label(ref='chartLabel')
          sup.text-subtitle-1(style='top: 0') {{ work.chaptersReadCount }}
          | /
          sub {{ work.chapters.length }}
          br
          span.text-caption
            span(v-if='work.totalChapters === work.chapters.length') (complete)
            span(v-else): abbr(title='Work in progress') (WIP)
      div(v-if='work.tags')
        p.text-subtitle-1.font-weight-light.mb-0 Tags
        clamped-text(:lines='5'): p.pre.font-weight-light {{ work.tags.join(", ") }}
      div(v-if='work.description')
        p.text-subtitle-1.font-weight-light.mb-0 Summary
        clamped-text(:lines='10'): p.pre.font-weight-light {{ work.description }}
      div(v-if='work.isAnyChaptersRead')
        p.text-subtitle-1.font-weight-light.mb-2 Read chapters: {{ work.readChaptersText }}
      v-spacer
      v-row.flex-grow-0(no-gutters)
        v-col
          v-btn.my-1(
            depressed,
            color='primary',
            :href='work.chapters[work.firstUnreadChapterIndex !== undefined ? work.firstUnreadChapterIndex : work.chapters.length - 1].getHref(true)',
            target='_blank'
          )
            span Open chapter {{ (work.firstUnreadChapterIndex !== undefined ? work.firstUnreadChapterIndex : work.chapters.length - 1) + 1 }}
            v-icon(right) {{ $icons.mdiOpenInNew }}
    v-divider
    v-row.pt-sm-7.pb-sm-3.px-sm-6.pt-5
      v-col.pa-0.d-flex.justify-center.justify-sm-start(cols='12', sm='auto')
        v-rating(
          clearable,
          v-model='work.rating',
          :length='5',
          size='32px',
          :class='`status--${work.status}`'
        )
      v-spacer
      v-col.px-0.pt-2.pt-sm-0.pb-1.pb-sm-0.d-flex.justify-space-between.justify-sm-start(
        cols=12,
        sm='auto'
      )
        v-btn(
          plain,
          :href='work.bookmarkHref',
          target='_blank',
          v-if='work.bookmarkHref'
        ) Open bookmark
        v-menu(offset-y)
          template(v-slot:activator='{ on, attrs }')
            v-btn(v-bind='attrs', v-on='on', plain, color='amber darken-4') Change status
          v-list(dense)
            v-list-item(
              v-for='{ value, text } in statusItems',
              :key='value',
              @click='work.status = value'
            )
              v-list-item-icon: v-icon(:class='`status--${value}`') {{ statusIcons[value] }}
              v-list-item-content: v-list-item-title {{ text }}
        v-btn(plain, color='primary', @click='editDialog = true') Edit
  v-dialog(
    v-model='editDialog',
    max-width='600px',
    :fullscreen='$vuetify.breakpoint.xsOnly'
  )
    v-card
      v-toolbar(
        color='secondary',
        dark,
        dense,
        style='position: sticky; top: 0; z-index: 10'
      )
        v-btn(icon, @click='editDialog = false')
          v-icon {{ $icons.mdiClose }}
        v-toolbar-title {{ work.title }}
      v-divider
      v-card-text
        v-row.pt-8.pb-4(align='center', justify='space-around')
          v-btn.mb-4(depressed, color='success', @click='work.setAllRead()') Mark all read
          v-btn.mb-4(depressed, color='error', @click='work.setAllUnread()') Mark all unread
        v-data-table.chapters-table(
          :items='work.chapterItems',
          :headers='chapterHeaders',
          :works-per-page='-1',
          disable-pagination,
          disable-sort,
          disable-filtering,
          dense,
          hide-default-footer,
          :mobile-breakpoint='0'
        )
          template(v-slot:item.readText='{ item: chapter, index }')
            .d-flex.align-center.justify-end
              span(v-if='chapter.readText') {{ chapter.readText }}
              v-simple-checkbox.pl-2(
                :value='!!chapter.readDate',
                @click='work.toggleRead(index)'
              )
          template(v-slot:item.text='{ item: chapter }')
            a(:href='chapter.href', target='_blank') {{ chapter.text }}
        v-row(align='center', justify='space-around')
          v-btn.my-4(color='error', plain, @click='deleteDialog = true') Delete work from reading list
  v-dialog(
    v-model='deleteDialog',
    max-width='200px',
    @keydown.esc='deleteDialog = false'
  )
    v-card
      v-card-text.pa-4 Are you sure you want to delete {{ work.title }}?
      v-card-actions.pt-0
        v-spacer
        v-btn(color='error darken-1', text, @click='remove') Yes
        v-btn(color='grey', @click='deleteDialog = false') Cancel
</template>

<script lang="ts">
import { Component, Vue, Prop, Ref, PropSync } from 'vue-property-decorator';
import ripple from 'vuetify/lib/directives/ripple';

import {
  WORK_STATUSES,
  upperStatusText,
  WORK_STATUSES_ICONS,
} from '@/common/readingListData';

import ReadingListWork from '../ReadingListWork';

import LazyExpansionPanel from './LazyExpansionPanel';
import ClampedText from './ClampedText.vue';

@Component({
  directives: {
    // https://github.com/vuetifyjs/vuetify/issues/12224
    ripple,
  },
  components: {
    DonutChart: () => import('./DonutChart.vue'),
    LazyExpansionPanel,
    ClampedText,
  },
})
export default class ReadingListEntry extends Vue {
  @PropSync('currentOffset') currentOffsetSync!: [number, number];
  @Prop() work!: ReadingListWork;
  @Prop() index!: number;
  @Ref() readonly panel!: Vue & { isActive: boolean; isShown: boolean };
  @Ref() readonly header!: Vue;
  @Ref() readonly content!: Vue;
  @Ref() readonly chart!: Vue;
  @Ref() readonly chartLabel!: HTMLElement;

  editDialog = false;
  deleteDialog = false;
  statusIcons = WORK_STATUSES_ICONS;
  chartOptions = {
    resizable: true,
    donut: {
      center: { label: '', numberFormatter: (): string => '' },
      alignment: 'center',
    },
    pie: {
      labels: {
        formatter: ({ data }: { data: { group: string } }): string =>
          data.group,
      },
    },
    height: '200px',
    width: '200px',
    legend: { enabled: false },
    tooltips: { showTotal: true },
    color: {
      scale: {
        Read: 'green',
        Unread: 'grey',
        Unpublished: 'black',
      },
    },
  };
  chapterHeaders = [
    { text: 'Chapter', value: 'text' },
    { text: 'Read', value: 'readText', align: 'end' },
  ];
  statusItems = WORK_STATUSES.map((status) => ({
    text: upperStatusText(status),
    value: status,
  }));

  chartMounted(): void {
    if (this.chartLabel && !this.chartLabel.style.marginTop) {
      const chartInnerSVG = this.chart.$el.querySelector('svg > svg')!;
      const height = this.chart.$el.clientHeight - 10;
      let offset = parseInt(chartInnerSVG.getAttribute('y')!);
      if (offset > height / 2) {
        offset -= height / 2;
      }
      this.chartLabel.style.marginTop = `${offset}px`;
    }
  }

  get chartData(): unknown {
    const readCount = this.work.chapters.filter((work) => work.readDate).length;
    let data = [
      {
        group: 'Read',
        value: readCount,
      },
      {
        group: 'Unread',
        value: this.work.chapters.length - readCount,
      },
    ];
    if (this.work.totalChapters) {
      data.push({
        group: 'Unpublished',
        value: this.work.totalChapters - this.work.chapters.length,
      });
    }
    return data;
  }

  remove(): void {
    this.$emit('remove');
  }

  mounted(): void {
    this.$watch(
      () => this.panel?.isActive,
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (val: boolean) => {
        if (!val) return;

        let needsBoot = this.panel.isActive && !this.panel.isShown;
        if (needsBoot) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }

        await this.$nextTick();

        let appOffset = 64;
        if (this.$vuetify.breakpoint.smAndUp) appOffset = 112;
        if (this.$vuetify.breakpoint.lgAndUp) appOffset = 64;

        const contentEl = this.content.$el as HTMLElement;
        contentEl.style.display = 'block';
        contentEl.style.overflow = 'hidden';
        const contentHeight = contentEl.offsetHeight;

        const headerEl = this.header.$el as HTMLElement;
        const headerHeight = headerEl.offsetHeight;

        const height = contentHeight + headerHeight;
        let top = headerEl.getBoundingClientRect().y + window.pageYOffset;
        if (this.currentOffsetSync[0] < this.index) {
          top -= this.currentOffsetSync[1];
        }
        const bottom = top + height;

        let scrollTop = document.scrollingElement!.scrollTop;
        if (window.innerHeight + scrollTop < bottom) {
          scrollTop = bottom - window.innerHeight + 90;
        }
        if (top < scrollTop + appOffset || needsBoot) {
          scrollTop = top - appOffset;
        }

        this.currentOffsetSync = [this.index, contentHeight];

        setTimeout(() => {
          void this.$vuetify.goTo(scrollTop, {
            container: document.scrollingElement! as HTMLElement,
            appOffset: false,
            duration: 275,
          });
        }, 25);
      },
      { immediate: true }
    );
  }
}
</script>

<style lang="scss" scoped>
.show-overflow {
  overflow: visible;
}
.v-expansion-panel-header .v-rating {
  margin-top: -4px;
  &::v-deep::after {
    content: ' ';
    height: 12px;
    display: inline-block;
    width: 1px;
  }
}
.v-rating::v-deep .v-icon {
  padding: 0px;
}
.header > span {
  line-height: 1.1;
  margin: 2px 0px;
}
.header-ellipsis > span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chart-label {
  position: absolute;
  z-index: 10;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 53%;
  text-align: center;
  ::v-deep .text-caption {
    position: relative;
    top: -6px;
  }
}
p.pre {
  white-space: break-spaces;
  letter-spacing: 0.25px;
}
</style>
