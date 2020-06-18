import { Options, log } from '@/common';
import { addStatsItem, nbsp } from '../utils';
import { formatFinishAt, formatTime } from './time';

export function cleanTotalStats() {
  const statsElements = document.querySelectorAll('dl.stats');

  log('Cleaning stats elements: ', statsElements);

  for (const statsElement of statsElements) {
    const divs = statsElement.querySelectorAll('div');
    for (const div of divs) {
      statsElement.append(...div.childNodes);
      div.remove();
    }
  }
}

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

  log('Adding to stats elements: ', statsElements);

  for (const statsElement of statsElements) {
    fixDl(statsElement);

    if (options.showTotalTime || options.showTotalFinish) {
      addTotalTime(options, statsElement);
    }

    if (options.showKudosHitsRatio) {
      addKudosHitRatio(options, statsElement);
    }
  }
}

function fixDl(statsElement: Element) {
  // Remove whitespace only nodes
  // It's simply easier to style in css
  for (const child of statsElement.childNodes) {
    if (child.nodeType === 3 && !/\S/.test(child.nodeValue!)) {
      statsElement.removeChild(child);
    }
  }

  const dts = Array.from(statsElement.querySelectorAll('dt'));
  // We assume there's also one dd even though multiple would technically be valid
  const dds = Array.from(statsElement.querySelectorAll('dd'));

  const fragment = document.createDocumentFragment();

  for (const [dt, dd] of dts.map(function (e, i) {
    return [e, dds[i]];
  })) {
    const wrapper = document.createElement('div');
    wrapper.classList.add(...dt.classList);
    wrapper.append(dt);
    wrapper.append(dd);

    fragment.append(wrapper);
  }

  statsElement.append(fragment);
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

  let beforeNode = <Element>wordsElement.parentNode!.nextSibling;
  const parentNode = <Element>beforeNode.parentNode!;

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
      ).nextSibling!
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
