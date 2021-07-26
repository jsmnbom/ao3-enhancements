<template lang="pug">
lazy-expansion-panel(
  :key='item.workId',
  :class='`status--${item.status} item`',
  :options='{ threshold: 0 }',
  transition='fade-transition'
)
  v-expansion-panel-header.pr-4(style='min-height: 70px')
    template(v-slot:default='{ open }')
      v-row.pr-1(style='max-width: 100%')
        v-col.d-flex.flex-column.justify-center.py-1(cols='9')
          v-rating(
            readonly,
            :value='item.rating',
            :length='item.rating',
            size='12px',
            :class='`status--${item.status}`'
          )
          span.text-subtitle-1(
            style='line-height: 1.1',
            :class='{ "text-ellipsis": !open }'
          ) {{ item.title }}
          span.text-subtitle-2(:class='{ "text-ellipsis": !open }') {{ item.author }}

        v-col.d-flex.align-center.justify-center.flex-wrap(cols='3')
          v-fade-transition
            v-tooltip(
              bottom,
              v-if='item.firstUnreadChapterIndex !== undefined'
            )
              template(v-slot:activator='{ on, attrs }')
                v-btn(
                  v-bind='attrs',
                  v-on='on',
                  plain,
                  :href='item.chapters[item.firstUnreadChapterIndex].getHref(true)',
                  target='_blank',
                  @click.stop,
                  :x-small='$vuetify.breakpoint.xsOnly'
                )
                  v-icon.mr-0(right) {{ icons.mdiBook }}
                  span Unread
              span Open first unread chapter
          v-spacer
          v-fade-transition
            .show-overflow.d-flex.align-center(
              :style='{ visibility: open ? "hidden" : "" }',
              v-if='$vuetify.breakpoint.smAndUp'
            )
              .pt-1
                sup.text-subtitle-1 {{ item.chaptersReadCount }}
                | /
                sub {{ item.chapters.length }}
            div(v-else)
              span {{ item.chaptersReadCount }}/{{ item.chapters.length }}
  v-expansion-panel-content(ref='content')
    v-divider
    v-row.mb-2
      v-col.d-flex.flex-column.pb-0.pt-6(cols=12, sm='8')
        p.text-h6.font-weight-light.mb-1 Chapters read:
        p {{ item.readChaptersText }}
        v-spacer
        v-row.flex-grow-0(no-gutters)
          v-col
            v-btn.my-1.mx-1(
              depressed,
              color='primary',
              :href='item.chapters[item.firstUnreadChapterIndex !== undefined ? item.firstUnreadChapterIndex : item.chapters.length - 1].getHref(true)',
              target='_blank'
            )
              span Open chapter {{ (item.firstUnreadChapterIndex !== undefined ? item.firstUnreadChapterIndex : item.chapters.length - 1) + 1 }}
              v-icon(right) {{ icons.mdiOpenInNew }}
      v-col.pr-8.py-4(
        cols=4,
        style='position: relative',
        v-if='$vuetify.breakpoint.smAndUp'
      )
        div(
          ref='chartLabel',
          style='position: absolute; z-index: 10; transform: translate(-50%, -50%); top: 53%; left: 50%'
        )
          sup.text-subtitle-1 {{ item.chaptersReadCount }}
          | /
          sub {{ item.chapters.length }}
        ccv-donut-chart(
          ref='chart',
          :data='chartData',
          :options='chartOptions'
        )
    v-divider
    v-row.pt-sm-7.pb-sm-3.px-sm-6.pt-5
      v-col.pa-0.d-flex.justify-center.justify-sm-start(cols='12', sm='auto')
        v-rating(
          clearable,
          v-model='item.rating',
          :length='5',
          size='32px',
          :class='`status--${item.status}`'
        )
      v-spacer
      v-col.px-0.pt-2.pt-sm-0.pb-1.pb-sm-0.d-flex.justify-space-between.justify-sm-start(
        cols=12,
        sm='auto'
      )
        v-btn(
          plain,
          :href='item.bookmarkHref',
          target='_blank',
          v-if='item.bookmarkHref'
        ) Open bookmark
        v-menu(offset-y)
          template(v-slot:activator='{ on, attrs }')
            v-btn(v-bind='attrs', v-on='on', plain, color='amber darken-4') Change status
          v-list
            v-list-item(
              v-for='{ value, text } in statusItems',
              :key='value',
              @click='item.status = value'
            )
              v-list-item-title {{ text }}
        v-btn(plain, color='primary', @click='dialog = true') Edit
  v-dialog(
    v-model='dialog',
    max-width='600px',
    :fullscreen='$vuetify.breakpoint.xsOnly'
  )
    v-toolbar(color='primary', dark, v-if='$vuetify.breakpoint.xsOnly')
      v-btn(icon, @click='dialog = false')
        v-icon {{ icons.mdiClose }}
      v-toolbar-title {{ item.title }}
    v-card
      v-card-title(v-if='!$vuetify.breakpoint.xsOnly') {{ item.title }}
      v-divider
      v-card-text
        v-row.pt-6.pb-4(align='center', justify='space-around')
          v-btn.mb-4(
            depressed,
            color='green accent-2',
            @click='item.setAllRead()'
          ) Mark all read
          v-btn.mb-4(
            depressed,
            color='red accent-2',
            @click='item.setAllUnread()'
          ) Mark all unread
        v-data-table.chapters-table(
          :items='item.chapterItems',
          :headers='chapterHeaders',
          :items-per-page='-1',
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
                :value='!!chapter.readText',
                @click='item.toggleRead(index)'
              )
          template(v-slot:item.text='{ item: chapter }')
            a(:href='chapter.href', target='_blank') {{ chapter.text }}
        v-row(align='center', justify='space-around')
          v-btn.my-4(color='error', plain) Delete work from reading list
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch } from 'vue-property-decorator';
// https://github.com/vuetifyjs/vuetify/issues/12224
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-named-as-default
import Ripple from 'vuetify/lib/directives/ripple';
import {
  mdiClose,
  mdiAlertOctagonOutline,
  mdiMenuOpen,
  mdiOpenInNew,
  mdiBook,
} from '@mdi/js';

import { STATUSES, upperStatusText } from '@/common';

import CcvDonutChart from './DonutChart.vue';
import ReadingListReadingListItem from './ReadingListReadingListItem';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import LazyExpansionPanel from './LazyExpansionPanel';

@Component({
  directives: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    Ripple,
  },
  components: { CcvDonutChart, LazyExpansionPanel },
})
export default class Entry extends Vue {
  @PropSync('entry', { type: Object }) item!: ReadingListReadingListItem;

  dialog = false;
  icons = {
    mdiClose,
    mdiAlertOctagonOutline,
    mdiMenuOpen,
    mdiOpenInNew,
    mdiBook,
  };
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
    width: 'auto',
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
  statusItems = STATUSES.map((status) => ({
    text: upperStatusText(status),
    value: status,
  }));
  chartInnerSVG!: SVGElement;

  get chartData(): unknown {
    const readCount = this.item.chapters.filter((item) => item.readDate).length;
    let data = [
      {
        group: 'Read',
        value: readCount,
      },
      {
        group: 'Unread',
        value: this.item.chapters.length - readCount,
      },
    ];
    if (this.item.totalChapters) {
      data.push({
        group: 'Unpublished',
        value: this.item.totalChapters - this.item.chapters.length,
      });
    }
    return data;
  }

  @Watch('item', { deep: true })
  onItemChange(item: ReadingListReadingListItem): void {
    console.log(item);
    item.save().catch((e) => console.error(e));
  }

  mounted(): void {
    const chartInnerSVGObserver = new MutationObserver((mutations) => {
      for (const _ of mutations) {
        const chartLabel = this.$refs.chartLabel as HTMLElement;
        if (!chartLabel) {
          chartInnerSVGObserver.disconnect();
          return;
        }
        const offset = parseInt(this.chartInnerSVG.getAttribute('y')!) + 12;
        chartLabel.style.top = `${offset}px`;
      }
    });
    this.$watch(
      // eslint-disable-next-line
      () => (this.$refs.content as any)?.isActive,
      (val: boolean) => {
        if (val) {
          this.chartInnerSVG = (
            (this.$refs.chart as Vue).$el as HTMLElement
          ).querySelector('svg > svg')! as SVGElement;
          chartInnerSVGObserver.observe(this.chartInnerSVG, {
            attributes: true,
          });
        } else {
          chartInnerSVGObserver.disconnect();
        }
      }
    );
  }
}
</script>

<style lang="scss">
@import '@carbon/charts/styles.css';
.ccv-donut-chart .legend .bx--cc--legend {
  justify-content: right;
}
</style>

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

.item {
  min-height: 64px;
}
.text-ellipsis {
  white-space: nowrap;
  overflow-x: hidden;
  overflow-y: visible;
  text-overflow: ellipsis;
}
</style>
