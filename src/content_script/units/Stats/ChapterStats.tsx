import { h as createElement } from 'dom-chef';
import classNames from 'classnames';

import Unit from '@/content_script/Unit';
import { getCache, setCache, fetchAndParseDocument } from '@/common';
import { ADDON_CLASS } from '@/content_script/utils';

import { formatTime, finishAtValueElement } from './utils';

type StatElements = {
  label: string;
  value: string | Element;
  klass: string;
}[];

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

    this.logger.debug('Adding to chapters: ', chapters);

    const chapterDates = this.options.showChapterDate
      ? await this.getChapterDates(chapters)
      : [];

    for (const chapter of chapters) {
      // Find note after the chapter title and summary, notes etc.
      const lastPrefaceModule = chapter.querySelector(
        '.chapter.preface.group:first-of-type > :last-child'
      )!;

      const chapterStats: StatElements = [];

      if (
        this.options.showChapterWords ||
        this.options.showChapterTime ||
        this.options.showChapterFinish
      ) {
        this.addWordsAndTime(chapter, chapterStats);
      }

      if (this.options.showChapterDate) {
        // TODO: Is it published or updated date?
        const indexAnchor = document
          .getElementById('chapter_index')!
          .querySelector('a')!;
        const value = chapterDates[parseInt(chapter.id.substring(8)) - 1];
        chapterStats.push({
          label: 'Published:',
          value: <a href={indexAnchor.href}>{value}</a>,
          klass: 'published',
        });
      }

      const moduleElement = (
        <div
          id="chapter-stats"
          className={classNames('module', ADDON_CLASS)}
          role="complementary"
        >
          <h3 className="heading">Chapter stats:</h3>
          <blockquote className="meta">
            <dl className="stats">
              {chapterStats.map(({ label, value, klass }) => {
                return (
                  <div>
                    <dt className={klass}>{label}</dt>
                    <dd className={klass}>{value}</dd>
                  </div>
                );
              })}
            </dl>
          </blockquote>
        </div>
      );

      // Insert the stats mode at the end of the modules
      lastPrefaceModule.parentNode!.insertBefore(
        moduleElement,
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
      chapterStats.push({
        label: 'Words:',
        value: `${chapterWordCount}`,
        klass: 'words',
      });
    }
    if (this.options.showChapterTime) {
      chapterStats.push({
        label: 'Reading time:',
        value: `${formatTime(totalSeconds)}`,
        klass: 'reading-time',
      });
    }
    if (this.options.showChapterFinish) {
      chapterStats.push({
        label: 'Finish reading at:',
        value: finishAtValueElement(totalSeconds),
        klass: 'finish-at',
      });
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
    const chapterDatesCache = await getCache('chapterDates');
    let chapterDates = chapterDatesCache[workId];

    if (chapterDates === undefined || chapterDates.length < lastChapterNum) {
      chapterDates = [];
      this.logger.debug('Cached chapterDates was', chapterDates, 'Fetching...');
      try {
        const navigateUrl = `https://archiveofourown.org/works/${workId}/navigate`;
        const doc = await fetchAndParseDocument(navigateUrl);
        const chapterDatetimes = doc.querySelectorAll(
          '.chapter.index li .datetime'
        );
        for (const chapterDatetime of chapterDatetimes) {
          chapterDates.push(chapterDatetime.textContent!.slice(1, -1));
        }
        chapterDatesCache[workId] = chapterDates;
        await setCache({ chapterDates: chapterDatesCache });
      } catch (err) {
        this.logger.error(err);
      }
    }

    return chapterDates;
  }
}
