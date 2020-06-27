import compare from 'just-compare';

import { error, groupCollapsed, groupEnd, isPrimitive, log } from '@/common';

type Item = { text: string; value: string };

export const DEFAULT_OPTIONS = {
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
  showStatsColumns: true,

  username: null as string | null,
  trackWorks: [] as string[],
};

export type OptionId = keyof typeof DEFAULT_OPTIONS;
export type Options = typeof DEFAULT_OPTIONS;

export const ALL_OPTIONS = Object.keys(DEFAULT_OPTIONS) as OptionId[];

export const OPTION_IDS = Object.fromEntries(
  Object.keys(DEFAULT_OPTIONS).map((key) => [key, key])
) as Record<OptionId, OptionId>;

export async function getOption<
  DO extends typeof DEFAULT_OPTIONS,
  T extends keyof DO,
  R extends DO[T]
>(id: T): Promise<R> {
  const optionId = `option.${id}`;
  const defaultValue = <R>(DEFAULT_OPTIONS as DO)[id];
  return await browser.storage.local
    .get({ [optionId]: defaultValue })
    .then((obj) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      let value = obj[optionId];
      if (!isPrimitive(defaultValue) && !compare(value, defaultValue)) {
        groupCollapsed(optionId, 'value is not primitive! Dejsonning.');
        log(value);
        groupEnd();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
  DO extends typeof DEFAULT_OPTIONS,
  T extends keyof DO,
  R extends DO[T]
>(id: T, value: R): Promise<void> {
  const optionId = `option.${id}`;
  if (!isPrimitive(value)) {
    log(optionId, value, 'is not primitive! Jsonning.');
    value = (JSON.stringify(value) as unknown) as R;
  }
  log(`Setting ${id} to ${value}.`);
  await browser.storage.local
    .set({ [optionId]: value })
    .catch((err) => {
      error(`Could not set ${optionId} with value ${value} to storage.`, err);
    });
}

export async function getOptions(optionIdsToGet: OptionId[]): Promise<Options> {
  const keys: { [key: string]: unknown } = Object.fromEntries(
    optionIdsToGet.map((key) => [`option.${key}`, DEFAULT_OPTIONS[key]])
  );
  const rawOptions = await browser.storage.local.get(keys);
  const options: { [key: string]: unknown } = {};
  for (const rawKey of Object.keys(rawOptions)) {
    const key = rawKey.substring(7);
    // Remove option. to find default
    const defaultValue = DEFAULT_OPTIONS[key as OptionId];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = rawOptions[rawKey];
    if (!isPrimitive(defaultValue) && !compare(value, defaultValue)) {
      groupCollapsed(key, 'value is not primitive! Dejsonning.');
      log(value);
      groupEnd();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      options[key] = JSON.parse(value);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      options[key] = value;
    }
  }
  log('Using options:', options);
  return <Options>options;
}

export async function setOptions(rawOptions: Partial<Options>): Promise<void> {
  const toSet: { [key: string]: unknown } = Object.fromEntries(
    Object.entries(rawOptions).map(([key, val]: [string, unknown]) => {
      if (!isPrimitive(DEFAULT_OPTIONS[key as OptionId])) {
        log(key, val, 'is not primitive! Jsonning.');
        val = JSON.stringify(val) as unknown;
      }
      return [`option.${key}`, val];
    })
  );
  await browser.storage.local.set(toSet);
}
