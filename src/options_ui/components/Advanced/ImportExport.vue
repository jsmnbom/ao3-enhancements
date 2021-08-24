<template lang="pug">
div
  v-row.mx-1.py-2.flex-nowrap
    v-col.flex-min-basis
      .d-flex.flex-column
        span(
          :class='["text-subtitle-2", $vuetify.theme.dark ? "white--text" : "black--text"].join(" ")'
        ) Data&nbsp;import/export
        span.text-subtitle-2.grey--text(
          v-html='`Approximate storage used: ${used}`'
        )
    v-col.flex-max-basis.mt-n2
      v-row.mt-1.mb-0.mx-0.justify-end.flex-wrap
        input(
          type='file',
          ref='importInput',
          accept='application/json',
          style='display: none',
          @change='onImportInputChange'
        )
        v-menu(offset-y)
          template(v-slot:activator='{ on, attrs }')
            v-btn.mx-2.mt-2(
              v-bind='attrs',
              v-on='on',
              outlined,
              :color='["deep-purple", $vuetify.theme.dark ? "darken-2" : "lighten-2"].join("")'
            ) Export data
          v-list
            v-list-item(two-line, @click='startExport("all")')
              v-list-item-content
                v-list-item-title Export all
                v-list-item-subtitle Recommended if exporting for backup
            v-list-item(two-line, @click='startExport("options")')
              v-list-item-content
                v-list-item-title Export only options
                v-list-item-subtitle 
            v-list-item(two-line, @click='startExport("readingList")')
              v-list-item-content
                v-list-item-title Export only reading list data
                v-list-item-subtitle 
            v-list-item(two-line, @click='startExport("cache")')
              v-list-item-content
                v-list-item-title Export only cache
                v-list-item-subtitle Internal recoverable data
        v-btn.mx-2.mt-2(
          outlined,
          :color='["deep-purple", $vuetify.theme.dark ? "darken-2" : "lighten-2"].join("")',
          @click='startImport'
        ) Import data
</template>
<script lang="ts">
import { Component, Vue, PropSync } from 'vue-property-decorator';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

import { Options } from '@/common/options';
import { formatBytes } from '@/common/utils';

@Component({})
export default class ImportExport extends Vue {
  @PropSync('options', { type: Object }) opts!: Options;

  usedBytes = 0;

  get used(): string {
    return formatBytes(this.usedBytes).replace(' ', '&nbsp;');
  }

  async created(): Promise<void> {
    const items = await browser.storage.local.get();
    this.usedBytes = JSON.stringify(items).length;
  }

  async startExport(
    type: 'all' | 'options' | 'cache' | 'readingList'
  ): Promise<void> {
    const items = await browser.storage.local.get();
    const typeToKeyPrefix = {
      options: 'option.',
      cache: 'cache.',
      readingList: 'readingList.',
    } as const;
    const filtered =
      type == 'all'
        ? items
        : Object.fromEntries(
            Object.entries(items).filter(([key, _val]) => {
              return key.startsWith(typeToKeyPrefix[type]);
            })
          );
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: 'application/json',
    });
    saveAs(
      blob,
      `AO3-Enhancements_${dayjs().format('YYYY-MM-DD_HH-MM')}_${type}.json`
    );
  }

  startImport(): void {
    const input = this.$refs.importInput as HTMLInputElement;
    input.click();
  }

  onImportInputChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const files = input.files!;
    if (files.length === 0) {
      this.$notification.add('No file to import selected.', 'error');
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target!.result! as string;
      const obj = JSON.parse(text) as { [key: string]: unknown };
      browser.storage.local.set(obj).then(() => {
        browser.runtime.reload();
      }).catch(e => this.$logger.error(e));
    };
    reader.readAsText(file);
  }
}
</script>

<style scoped>
.flex-min-basis {
  flex-basis: min-content;
}
.flex-max-basis {
  flex-basis: max-content;
}
</style>