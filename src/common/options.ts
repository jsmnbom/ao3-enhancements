// @ts-ignore
import compare from 'just-compare';

import { log, error, isPrimitive } from '@/common';

type Item = { text: string; value: string };

export const defaultOptions = {
  showTotalTime: true,
  showTotalFinish: true,
  showChapterWords: true,
  showChapterTime: true,
  showChapterFinish: true,
  showChapterDate: true,
  wordsPerMinute: 200,
  showKudosHitsRatio: true,

  hideShowReason: true,
  hideCrossovers: false,
  hideCrossoversMaxFandoms: 4,
  hideLanguages: false,
  hideLanguagesList: [] as Item[],
  hideAuthors: false,
  hideAuthorsList: [] as string[],
  hideTags: false,
  hideTagsDenyList: [] as string[],
  hideTagsAllowList: [] as string[],

  styleWidthEnabled: false,
  styleWidth: 40,
};

export const optionIds = Object.fromEntries(
  Object.keys(defaultOptions).map((key) => [key, key])
) as Record<keyof typeof defaultOptions, keyof typeof defaultOptions>;

export type OptionId = keyof typeof defaultOptions;
export type Options = typeof defaultOptions;

export async function getOption<
  DO extends typeof defaultOptions,
  T extends keyof DO,
  R extends DO[T]
>(id: T): Promise<R> {
  const optionId = `option.${id}`;
  const defaultValue = <R>(defaultOptions as DO)[id];
  return await browser.storage.local
    .get({ [optionId]: defaultValue })
    .then((obj) => {
      let value = obj[optionId];
      if (!isPrimitive(defaultValue) && !compare(value, defaultValue)) {
        log(optionId, value, 'is not primitive! Dejsonning.');
        value = JSON.parse(value);
      }
      return <R>value;
    })
    .catch((err) => {
      error(
        `Could not read ${optionId} from storage. Setting to default ${defaultValue}.`,
        err
      );
      return defaultValue;
    });
}

export async function setOption<
  DO extends typeof defaultOptions,
  T extends keyof DO,
  R extends DO[T]
>(id: T, value: R): Promise<void> {
  const optionId = `option.${id}`;
  if (!isPrimitive(value)) {
    log(optionId, value, 'is not primitive! Jsonning.');
    // @ts-ignore
    value = JSON.stringify(value);
  }
  log(`Setting ${id} to ${value}.`);
  await browser.storage.local
    .set({ [optionId]: value })
    .catch((err) => {
      error(`Could not set ${optionId} with value ${value} to storage.`, err);
    });
}
