import compare from 'just-compare';

import { isPrimitive } from '@/common';

import defaultLogger from './logger';

const logger = defaultLogger.child('Options');

type Item = { text: string; value: string };

export interface User {
  username: string;
  imgSrc: string;
  imgAlt: string;
}

export type StyleAlign = 'start' | 'end' | 'center' | 'justified';

export interface Options {
  showTotalTime: boolean;
  showTotalFinish: boolean;
  showChapterWords: boolean;
  showChapterTime: boolean;
  showChapterFinish: boolean;
  showChapterDate: boolean;
  wordsPerMinute: number;
  showKudosHitsRatio: boolean;

  hideShowReason: boolean;
  hideCrossovers: boolean;
  hideCrossoversMaxFandoms: number;
  hideLanguages: boolean;
  hideLanguagesList: Item[];
  hideAuthors: boolean;
  hideAuthorsList: string[];
  hideTags: boolean;
  hideTagsDenyList: string[];
  hideTagsAllowList: string[];

  styleWidthEnabled: boolean;
  styleWidth: number;
  showStatsColumns: boolean;
  styleAlignEnabled: boolean;
  styleAlign: StyleAlign;

  user: User | null;
  trackWorks: string[];

  verbose: boolean;
}

export const DEFAULT_OPTIONS: Options = {
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
  hideLanguagesList: [],
  hideAuthors: false,
  hideAuthorsList: [],
  hideTags: false,
  hideTagsDenyList: [],
  hideTagsAllowList: [],

  styleWidthEnabled: false,
  styleWidth: 40,
  showStatsColumns: true,
  styleAlignEnabled: false,
  styleAlign: 'start',

  user: null,
  trackWorks: [],

  verbose: false,
};

export type OptionId = keyof Options;

export const ALL_OPTIONS = Object.keys(DEFAULT_OPTIONS) as OptionId[];

export const OPTION_IDS = Object.fromEntries(
  Object.keys(DEFAULT_OPTIONS).map((key) => [key, key])
) as Record<OptionId, OptionId>;

export async function getOptions<K extends OptionId, R = ValueOf<Options, K>>(
  id: K
): Promise<R>;
export async function getOptions<
  K extends Array<OptionId>,
  R = Pick<Options, K[number]>
>(ids: K): Promise<R>;
export async function getOptions(ids: OptionId | OptionId[]): Promise<unknown> {
  const request = Object.fromEntries(
    (Array.isArray(ids) ? ids : [ids]).map((id: OptionId) => [
      `option.${id}`,
      DEFAULT_OPTIONS[id],
    ])
  );

  let res;
  try {
    res = await browser.storage.local.get(request);
  } catch (e) {
    logger.error(`Couldn't get: ${ids}`);
    throw e;
  }

  const ret = Object.fromEntries(
    Object.entries(res).map(([rawId, value]: [string, unknown]) => {
      // remove 'option.' from id
      const id: OptionId = rawId.substring(7) as OptionId;
      const defaultValue = DEFAULT_OPTIONS[id];
      if (!isPrimitive(defaultValue) && !compare(value, defaultValue)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value = JSON.parse(<string>value) as unknown;
      }
      return [id, value];
    })
  );

  logger.debugAlways(ret);

  if (Array.isArray(ids)) {
    return ret;
  } else {
    return ret[ids];
  }
}

export async function setOptions<T extends Partial<Options>>(
  obj: T
): Promise<void> {
  const set = Object.fromEntries(
    Object.entries(obj).map(([rawId, value]: [string, unknown]) => {
      const id = `option.${rawId}`;
      const defaultValue = DEFAULT_OPTIONS[rawId as OptionId];
      if (!isPrimitive(defaultValue)) {
        value = JSON.stringify(value) as unknown;
      }
      return [id, value];
    })
  );

  logger.debug('Setting:', set);

  try {
    await browser.storage.local.set(set);
  } catch (e) {
    logger.error(`Couldn't set: ${obj}`);
    throw e;
  }
}
