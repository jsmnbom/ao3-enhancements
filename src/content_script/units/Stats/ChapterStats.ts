import { cacheIds, error, getCache, log, setCache } from '@/common';
import { htmlToElement } from '@/content_script/utils';
import Unit from '@/content_script/Unit';
import { formatFinishAt, formatTime } from './utils';
import chapterStatsTemplate from './chapterStats.pug';

type StatElements = { [text: string]: string };

export class ChapterStats extends Unit {
  get enabled(): boolean {
    return (
      this.options.showChapterWords ||
      this.options.showChapterTime ||
      this.options.showChapterFinish ||
      this.options.showChapterDate
    );
  }

  async ready(): Promise<void> {
    // Find all chapters (multiple can exist on same page when viewing entire work)
    const chapters = document.querySelectorAll('#chapters > div.chapter');

    if (chapters.length === 0) {
      return;
    }

    log('Adding chapter stats to chapters: ', chapters);

    const chapterDates = this.options.showChapterDate
      ? await this.getChapterDates(chapters)
      : [];

    for (const chapter of chapters) {
      // Find note after the chapter title and summary, notes etc.
      const lastPrefaceModule = chapter.querySelector(
        '.chapter.preface.group:first-of-type > :last-child'
      )!;

      const chapterStats: StatElements = {};

      if (
        this.options.showChapterWords ||
        this.options.showChapterTime ||
        this.options.showChapterFinish
      ) {
        this.addWordsAndTime(chapter, chapterStats);
      }

      if (this.options.showChapterDate) {
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

  addWordsAndTime(chapter: Element, chapterStats: StatElements): void {
    // Find the text element or abort
    const chapterTextElement = chapter.querySelector(
      '.userstuff[role="article"]'
    );
    if (!chapterTextElement) return;

    // Count the amount of words
    const chapterText = chapterTextElement.textContent!;
    const chapterWordCount = chapterText.split(/\s+/).length;

    // Turn into total minutes
    const totalMinutes = chapterWordCount / this.options.wordsPerMinute;
    // Calc total seconds
    const totalSeconds = totalMinutes * 60;

    if (this.options.showChapterWords) {
      chapterStats['Words:'] = `${chapterWordCount}`;
    }
    if (this.options.showChapterTime) {
      chapterStats['Reading time:'] = `${formatTime(totalSeconds)}`;
    }
    if (this.options.showChapterFinish) {
      chapterStats['Finish reading at:'] = `${formatFinishAt(totalSeconds)}`;
    }
  }

  async getChapterDates(chapters: NodeListOf<Element>): Promise<string[]> {
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
        await setCache(cacheIds.chapterDates, chapterDatesCache);
      } catch (err) {
        error(err);
      }
    }

    return chapterDates;
  }
}
