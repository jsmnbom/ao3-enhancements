import { Options, log, nbsp, htmlToElement, ADDON_CLASS } from '@/common';
import { formatFinishAt, formatTime } from './time';

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

    const chapterStats = [];

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
      // Format to string
      const readingTime = formatTime(totalSeconds);

      if (options.showChapterWords)
        chapterStats.push(`<dt>Words:</dt>${nbsp}<dd>${chapterWordCount}</dd>`);
      if (options.showChapterTime)
        chapterStats.push(
          `<dt>Reading${nbsp}time:</dt>${nbsp}<dd>${readingTime}</dd>`
        );
      if (options.showChapterFinish)
        chapterStats.push(
          `<dt>Finish${nbsp}reading${nbsp}at:</dt>${nbsp}<dd>${formatFinishAt(
            totalSeconds
          )}</dd>`
        );
    }

    const moduleNode = htmlToElement(`<div id="chapterstats" role="complementary" class="module ${ADDON_CLASS}">
      <h3 class="heading">Chapter stats:</h3>
      <blockquote class="meta">
          <dl class="stats" style="text-align: left;">
              ${chapterStats.join('')}
          </dl>
      </blockquote>
    </div>
    `)

    // Insert the stats mode at the end of the modules
    lastPrefaceModule.parentNode!.insertBefore(
      moduleNode,
      lastPrefaceModule.nextSibling
    );
  }
}
