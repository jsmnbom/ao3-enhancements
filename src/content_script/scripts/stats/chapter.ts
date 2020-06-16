import { Options, log, nbsp, htmlToElement, ADDON_CLASS } from '@/common';
import { formatFinishAt, formatTime } from './time';
import template from './chapter.pug';

export function addChapterStats(options: Options) {
  if (
    !(
      options.showChapterWords ||
      options.showChapterTime ||
      options.showChapterFinish
    )
  ) {
    return;
  }

  // Find all chapters (multiple can exist on same page when viewing entire work)
  const chapters = document.querySelectorAll('#chapters > div.chapter');
  log('Adding chapter times to chapters: ', chapters);

  for (const chapter of chapters) {
    // Find note after the chapter title and summary, notes etc.
    const lastPrefaceModule = chapter.querySelector(
      '.chapter.preface.group:first-of-type > :last-child'
    )!;

    const chapterStats = {} as { [key: string]: string };

    if (
      options.showChapterWords ||
      options.showChapterTime ||
      options.showChapterFinish
    ) {
      // Find the text element or abort
      const chapterTextElement = chapter.querySelector(
        '.userstuff[role="article"]'
      );
      if (!chapterTextElement) continue;

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

    const moduleNode = htmlToElement(
      template({
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
