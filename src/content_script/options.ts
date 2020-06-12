import { log } from '@/common';

let options = {
  showTotalTime: true,
  showTotalFinish: true,
  showChapterWords: true,
  showChapterTime: true,
  showChapterFinish: true,
  wordsPerMinute: 200,
  showKudosHitsRatio: true,
};

export async function waitForOptions(): Promise<void> {
  await browser.storage.local.get().then((obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('options.')) {
        // @ts-ignore
        options[key.substring(8)] = value;
      }
    }
    log('Using options:', options);
  });
}

export default options;
