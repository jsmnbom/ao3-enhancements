import { log } from '@/common';

type LanguageItem = { text: string; value: string };

let options = {
  showTotalTime: true,
  showTotalFinish: true,
  showChapterWords: true,
  showChapterTime: true,
  showChapterFinish: true,
  wordsPerMinute: 200,
  showKudosHitsRatio: true,
  hideCrossovers: false,
  hideCrossoversMaxFandoms: 4,
  hideLanguages: false,
  hideLanguagesList: [] as LanguageItem[],
};

export async function waitForOptions(): Promise<void> {
  await browser.storage.local.get().then((obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('options.')) {
        // @ts-ignore
        options[key.substring(8)] = value;
      }
    }
    options.hideLanguagesList = JSON.parse(
      (options.hideLanguagesList as unknown) as string
    );
    log('Using options:', options);
  });
}

export default options;
