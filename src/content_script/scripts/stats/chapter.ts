import {
  Options,
  log,
  error,
  getCache,
  cacheIds,
  setCache,
} from '@/common';
import {  nbsp,
  htmlToElement,} from '../utils';
import { formatFinishAt, formatTime } from './time';
import chapterStatsTemplate from './chapterStats.pug';

type ChapterStats = { [text: string]: string };
 
export async function addChapterStats(options: Options) {
  if (
    !(
      options.showChapterWords ||
      options.showChapterTime ||
      options.showChapterFinish ||
      options.showChapterDate
    )
  ) {
    return;
  }

  // Find all chapters (multiple can exist on same page when viewing entire work)
  const chapters = document.querySelectorAll('#chapters > div.chapter');

  if (chapters.length === 0) {
    return;
  }

  log('Adding chapter stats to chapters: ', chapters);

  const chapterDates = options.showChapterDate
    ? await getChapterDates(chapters)
    : [];

  for (const chapter of chapters) {
    // Find note after the chapter title and summary, notes etc.
    const lastPrefaceModule = chapter.querySelector(
      '.chapter.preface.group:first-of-type > :last-child'
    )!;

    const chapterStats: ChapterStats = {};

    if (
      options.showChapterWords ||
      options.showChapterTime ||
      options.showChapterFinish
    ) {
      addWordsAndTime(options, chapter, chapterStats);
    }

    if (options.showChapterDate) {
      // TODO: Is it published or updated date?
      chapterStats['Published:'] =
        chapterDates[parseInt(chapter.id.substring(8)) - 1];
    }

    const moduleNode = htmlToElement(
      chapterStatsTemplate({
        stats: chapterStats,
      })
    );

    // Insert the stats mode at the end of the modules
    lastPrefaceModule.parentNode!.insertBefore(
      moduleNode,
      lastPrefaceModule.nextSibling
    );
  }
}

function addWordsAndTime(
  options: Options,
  chapter: Element,
  chapterStats: ChapterStats
) {
  // Find the text element or abort
  const chapterTextElement = chapter.querySelector(
    '.userstuff[role="article"]'
  );
  if (!chapterTextElement) return;

  // Count the amount of words
  const chapterText = chapterTextElement.textContent!;
  const chapterWordCount = chapterText.split(/\s+/).length;

  // Turn into total minutes
  const totalMinutes = chapterWordCount / options.wordsPerMinute;
  // Calc total seconds
  const totalSeconds = totalMinutes * 60;

  if (options.showChapterWords) {
    chapterStats['Words:'] = `${chapterWordCount}`;
  }
  if (options.showChapterTime) {
    chapterStats[`Reading${nbsp}time:`] = `${formatTime(totalSeconds)}`;
  }
  if (options.showChapterFinish) {
    chapterStats[`Finish${nbsp}reading${nbsp}at:`] = `${formatFinishAt(
      totalSeconds
    )}`;
  }
}

async function getChapterDates(chapters: NodeListOf<Element>) {
  // Get last (usually current) chapter number
  const lastChapter = chapters[chapters.length - 1];
  const lastChapterNum = parseInt(lastChapter.id.substring(8)) - 1;

  const workId = lastChapter
    .querySelector('.title a')!
    .getAttribute('href')!
    .split('/')[2];
  const chapterDatesCache = await getCache(cacheIds.chapterDates);
  let chapterDates = chapterDatesCache[workId];

  if (chapterDates === undefined || chapterDates.length < lastChapterNum) {
    chapterDates = [];
    log('Cached chapterDates was', chapterDates, 'Fetching...');
    try {
      const response = await fetch(
        `https://archiveofourown.org/works/${workId}/navigate`
      );
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const chapterDatetimes = doc.querySelectorAll(
        '.chapter.index li .datetime'
      );
      for (const chapterDatetime of chapterDatetimes) {
        chapterDates.push(chapterDatetime.textContent!.slice(1, -1));
      }
      chapterDatesCache[workId] = chapterDates;
      setCache(cacheIds.chapterDates, chapterDatesCache);
    } catch (err) {
      error(err);
    }
  }

  return chapterDates;
}
