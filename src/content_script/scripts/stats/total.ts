import { Options, log, addStatsItem, nbsp } from '@/common';
import { formatFinishAt, formatTime } from './time';

export function addTotalStats(options: Options) {
  if (
    !(
      options.showTotalTime ||
      options.showTotalFinish ||
      options.showKudosHitsRatio
    )
  ) {
    return;
  }

  const statsElements = document.querySelectorAll('dl.stats');

  log('Adding total times to stats elements: ', statsElements);

  for (const statsElement of statsElements) {
    // Remove whitespace to fix line breaks in dl lists
    for (const child of statsElement.childNodes) {
      if (child.nodeType === 3 && !/\S/.test(child.nodeValue!)) {
        statsElement.removeChild(child);
      }
    }

    if (options.showTotalTime || options.showTotalFinish) {
      addTotalTime(options, statsElement);
    }

    if (options.showKudosHitsRatio) {
      addKudosHitRatio(options, statsElement);
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

function addTotalTime(options: Options, statsElement: Element) {
  // Find wordcount elements
  let wordsElement = statsElement.querySelector('dd.words');
  if (!wordsElement) {
    wordsElement =
      Array.from(statsElement.querySelectorAll('dt')).find(
        (el) => el.textContent == 'Words:'
      ) || null;
    if (!wordsElement) return;
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
      addStatsItem(
        'reading-time',
        `Reading${nbsp}time:`,
        readingTime,
        parentNode,
        beforeNode
      ).pop()!.nextSibling!
    );
  }

  if (options.showTotalFinish) {
    addStatsItem(
      'finish-at',
      `Finish${nbsp}reading${nbsp}at:`,
      formatFinishAt(totalSeconds),
      parentNode,
      beforeNode
    );
  }
}

function addKudosHitRatio(options: Options, statsElement: Element) {
  const kudosElement = statsElement.querySelector('dd.kudos');
  const hitsElement = statsElement.querySelector('dd.hits');

  if (kudosElement === null || hitsElement === null) {
    return;
  }

  const kudos = parseInt(kudosElement.textContent!.replace(/,/g, ''));
  const hits = parseInt(hitsElement.textContent!.replace(/,/g, ''));

  const ratio = kudos / hits;
  const ratioPercent = (ratio * 100).toFixed(2) + '%';

  addStatsItem(
    'kudos-hits-ratio',
    'Kudos/Hits:',
    ratioPercent,
    statsElement,
    <Element>hitsElement.nextSibling!
  );
}
