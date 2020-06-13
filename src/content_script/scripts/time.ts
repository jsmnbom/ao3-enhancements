import dayjs from 'dayjs';

import { log, ADDON_CLASS, addItem } from '@/common';
import options from '../options';

const nbsp = '\u00A0';

/**
 * Turns minutes into days, hours and remaining minutes
 */
function processTime(delta: number) {
  const days = Math.floor(delta / 86400);
  delta -= days * 86400;
  const hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;
  let minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;

  if (days === 0 && hours == 0 && minutes === 0) {
    minutes = 1;
  }

  return [days, hours, minutes];
}

/**
 * Formats amount of minutes and string (with days, hours, minutes)
 */
function formatTime(totalSeconds: number) {
  const [days, hours, minutes] = processTime(totalSeconds);
  let s = '';
  if (days) s += `${days}${nbsp}days,${nbsp}`;
  if (hours) s += `${hours}${nbsp}hours,${nbsp}`;
  if (minutes) s += `${minutes}${nbsp}min`;
  return s;
}

/**
 * Formats minutes as a time when the reading will be finishe (assuming non-stop reading ofc.)
 */
function formatFinishAt(totalSeconds: number) {
  const now = dayjs();
  const completion = now.add(totalSeconds, 'second');
  let formatted = completion.format('HH:mm');
  const dateDiff = completion.diff(now, 'day');
  if (dateDiff === 1) {
    formatted = `tomorrow @${nbsp}${formatted}`;
  } else if (dateDiff > 1) {
    formatted = `in${nbsp}${dateDiff}${nbsp}days${nbsp}@${nbsp}${formatted}`;
  }
  //formatted = `${formatted}<svg viewBox="0 0 24 24" style="display: inline-block;top: 2px;position: relative;" height="14" width="14"><path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"></path></svg>`
  return formatted;
}

/**
 * Adds total (entire fic) times.
 *
 * Also adds to collections stats.
 */
function addTotal() {
  const statsElements = document.querySelectorAll('dl.stats');

  log('Adding total times to stats elements: ', statsElements);

  for (const statsElement of statsElements) {
    // Remove whitespace to fix line breaks in dl lists
    for (const child of statsElement.childNodes) {
      if (child.nodeType === 3 && !/\S/.test(child.nodeValue!)) {
        statsElement.removeChild(child);
      }
    }

    // Find wordcount elements
    let wordsElement = statsElement.querySelector('dd.words');
    if (!wordsElement) {
      wordsElement =
        Array.from(statsElement.querySelectorAll('dt')).find(
          (el) => el.textContent == 'Words:'
        ) || null;
      if (!wordsElement) continue;
      wordsElement = <Element>wordsElement.nextSibling;
    }

    // Get the word count, replacing any , with nothing
    const wordCount = parseInt(wordsElement.textContent!.replace(/,/g, ''));

    // Turn into total minutes
    const totalMinutes = wordCount / options.wordsPerMinute;
    // Calc total seconds
    const totalSeconds = totalMinutes * 60;

    let beforeNode = <Element>wordsElement.nextSibling!;
    const parentNode = <Element>wordsElement.parentNode!;

    // Format to string
    const readingTime = formatTime(totalSeconds);

    if (options.showTotalTime) {
      beforeNode = <Element>(
        addItem(
          'reading-time',
          `Reading${nbsp}time:`,
          readingTime,
          parentNode,
          beforeNode
        ).pop()!.nextSibling!
      );
    }

    if (options.showTotalFinish) {
      addItem(
        'finish-at',
        `Finish${nbsp}reading${nbsp}at:`,
        formatFinishAt(totalSeconds),
        parentNode,
        beforeNode
      );
    }

    // Add proper whitespaces
    for (const child of [...statsElement.childNodes]) {
      if (child.nodeName == 'DT') {
        statsElement.insertBefore(document.createTextNode(' '), child);
      } else if (child.nodeName == 'DD') {
        statsElement.insertBefore(document.createTextNode(nbsp), child);
      }
    }
  }
}

/**
 * Adds chapter times
 */
function addChapter() {
  // Find all chapters (multiple can exist on same page when viewing entire work)
  const chapters = document.querySelectorAll('#chapters > div.chapter');
  log('Adding chapter times to chapters: ', chapters);

  for (const chapter of chapters) {
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

    // Find note after the chapter title and summary, notes etc.
    const lastPrefaceModule = chapter.querySelector(
      '.chapter.preface.group:first-of-type > :last-child'
    )!;

    const wordsHtml = `<dt>Words:</dt>${nbsp}<dd>${chapterWordCount}</dd>`;
    const readingTimeHtml = `<dt>Reading${nbsp}time:</dt>${nbsp}<dd>${readingTime}</dd>`;
    const finishAtHtml = `<dt>Finish${nbsp}reading${nbsp}at:</dt>${nbsp}<dd>${formatFinishAt(
      totalSeconds
    )}</dd>`;

    // Create our own stats module
    const moduleNode = document.createElement('div');
    moduleNode.id = 'chapterstats';
    // @ts-ignore
    moduleNode.role = 'complementary';
    moduleNode.classList.add('module');
    moduleNode.classList.add(ADDON_CLASS);
    moduleNode.innerHTML = `<h3 class="heading">Chapter stats:</h3>
        <blockquote class="meta">
            <dl class="stats" style="text-align: left;">
                ${options.showChapterWords ? wordsHtml : ''}
                ${options.showChapterTime ? readingTimeHtml : ''}
                ${options.showChapterFinish ? finishAtHtml : ''}
            </dl>
        </blockquote>`;

    // Insert the stats mode at the end of the modules
    lastPrefaceModule.parentNode!.insertBefore(
      moduleNode,
      lastPrefaceModule.nextSibling
    );
  }
}

export function addTime() {
  if (options.showTotalTime || options.showTotalFinish) {
    addTotal();
  }
  if (
    options.showChapterWords ||
    options.showChapterTime ||
    options.showChapterFinish
  ) {
    addChapter();
  }
}
