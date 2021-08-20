<template lang="pug">
v-dialog(
  :value='!!conflict',
  max-width='600px',
  persistent,
  :fullscreen='$vuetify.breakpoint.xsOnly'
): v-card(
  v-if='conflict'
)
  v-toolbar(
    color='secondary',
    dark,
    dense,
    style='position: sticky; top: 0; z-index: 10'
  )
    v-toolbar-title Sync conflict
  v-divider
  v-card-text
    p.text-h6.mb-0.text--primary {{ conflict.local.title }} by {{ conflict.local.author }}
    p.text--secondary.mb-0 Please choose which version you would like to keep.
    p.text--secondary Help: the conflicts is marked with dashed border. Disregard the other values, they will be merged properly, even if different.
    v-row.mb-4
      v-col.d-flex.justify-center
        v-btn(color='blue lighten-3', @click='$emit("resolve", "local")') Keep local
      v-col.d-flex.justify-center
        v-btn(color='purple lighten-3', @click='$emit("resolve", "remote")') Keep remote
    sync-conflict-table(:table='table')
      template(#status='{ data }') {{ upperStatusText(data) }}
      template(#rating='{ data }')
        v-rating(readonly, :value='parseInt(data)', size='12px')
      template(#bookmark='{ data }')
        a(:href='data[1]', target='_blank') {{ data[0] }}
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { mdiClose } from '@mdi/js';
import dayjs, { Dayjs } from 'dayjs';

import {
  SyncConflict,
  BaseWork,
  upperStatusText,
} from '@/common/readingListData';

import SyncConflictTable from './SyncConflictTable.vue';

const zip = <T, Q, R>(
  a: Array<T>,
  b: Array<Q>,
  c: Array<R>
): Array<[T, Q, R]> =>
  Array.from(Array(Math.max(a.length, b.length, c.length)), (_, i) => [
    a[i],
    b[i],
    c[i],
  ]);

type Table = Array<{
  key: string;
  text: string;
  local: unknown;
  remote: unknown;
  conflict: boolean;
}>;

@Component({
  components: { SyncConflictTable },
})
export default class SyncConflictDialog extends Vue {
  @Prop() conflict: SyncConflict | null = null;

  simple: Array<[keyof BaseWork, string]> = [
    ['status', 'Status'],
    ['rating', 'Rating'],
    ['totalChapters', 'Total Chapters'],
  ];

  icons = {
    mdiClose,
  };

  upperStatusText = upperStatusText;

  get table(): Table {
    const formatSimple = (x: unknown) =>
      x === undefined || x === null ? '' : String(x);
    const formatChapter = (date: Dayjs | undefined | true) =>
      date
        ? date instanceof dayjs
          ? `read at ${(date as Dayjs).format('YYYY-MM-DD HH:mm')}`
          : 'read'
        : 'unread';

    return [
      { key: '', text: '', local: 'Local', remote: 'Remote', conflict: false },
      ...this.simple.map(([key, text]) => {
        const conflict = this.conflict!.checkPath([key]);
        const local = this.conflict!.local[key];
        const remote = this.conflict!.remote[key];
        const result = this.conflict!.result[key];
        return {
          key,
          text,
          local: formatSimple(conflict ? local : result),
          remote: formatSimple(conflict ? remote : result),
          conflict,
        };
      }),
      ...[0].map((_) => {
        const conflict = this.conflict!.checkPath(['bookmarkId']);
        const local = [
          this.conflict!.local.bookmarkId,
          this.conflict!.local.bookmarkHref,
        ];
        const remote = [
          this.conflict!.remote.bookmarkId,
          this.conflict!.remote.bookmarkHref,
        ];
        const result = [
          this.conflict!.result.bookmarkId,
          this.conflict!.result.bookmarkHref,
        ];
        return {
          key: 'bookmark',
          text: 'Bookmark',
          local: conflict ? local : result,
          remote: conflict ? remote : result,
          conflict,
        };
      }),
      ...zip(
        this.conflict!.local.chapters,
        this.conflict!.remote.chapters,
        this.conflict!.result.chapters
      ).map(([local, remote, result], i) => {
        const conflict = this.conflict!.checkPath(['chapters', i]);
        return {
          key: 'chapter',
          text: `Chapter ${i + 1}`,
          local: formatChapter((conflict ? local : result)?.readDate),
          remote: formatChapter((conflict ? remote : result)?.readDate),
          conflict,
        };
      }),
    ];
  }
}
</script>

<style lang="scss" scoped>
.v-rating::v-deep .v-icon {
  padding: 0px;
}
</style>