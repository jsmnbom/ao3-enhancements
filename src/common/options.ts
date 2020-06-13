type LanguageItem = { text: string; value: string };

export const defaultOptions = {
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

  styleWidthEnabled: false,
  styleWidth: 40,
};

export const optionIds = Object.fromEntries(
  Object.keys(defaultOptions).map((key) => [key, key])
) as Record<keyof typeof defaultOptions, keyof typeof defaultOptions>;

export type OptionId = keyof typeof defaultOptions;
export type Options = typeof defaultOptions;
