import { h as createElement } from 'dom-chef';
import classNames from 'classnames';

import { ADDON_CLASS } from '@/content_script/utils';
import Unit from '@/content_script/Unit';

import { formatTime, finishAtValueElement } from './utils';

export class TotalStats extends Unit {
  get enabled(): boolean {
    return true;
  }

  async clean(): Promise<void> {
    const statsElements = document.querySelectorAll('dl.stats');

    this.logger.debug('Cleaning stats elements: ', statsElements);

    for (const statsElement of statsElements) {
      const divs = statsElement.querySelectorAll('div');
      for (const div of divs) {
        statsElement.append(...div.childNodes);
        div.remove();
      }
    }
  }

  async ready(): Promise<void> {
    const statsElements = document.querySelectorAll('dl.stats');

    this.logger.debug('Adding to stats elements: ', statsElements);

    for (const statsElement of statsElements) {
      this.fixDl(statsElement);

      if (this.options.showTotalTime || this.options.showTotalFinish) {
        this.addTotalTime(statsElement);
      }

      if (this.options.showKudosHitsRatio) {
        this.addKudosHitsRatio(statsElement);
      }
    }
  }

  fixDl(statsElement: Element): void {
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
      const wrapper = (
        <div className={dt.className}>
          {dt}
          {dd}
        </div>
      );

      fragment.append(wrapper);
    }

    statsElement.append(fragment);
  }

  addTotalTime(statsElement: Element): void {
    // Find wordcount elements
    let wordsElement = statsElement.querySelector('dd.words');
    if (!wordsElement) {
      wordsElement =
        Array.from(statsElement.querySelectorAll('dt')).find(
          (el) => el.textContent == 'Words:'
        ) || null;
      if (!wordsElement) return;
      wordsElement = wordsElement.nextSibling as Element;
    }

    // Get the word count, replacing any , with nothing
    const wordCount = parseInt(wordsElement.textContent!.replace(/,/g, ''));

    // Turn into total minutes
    const totalMinutes = wordCount / this.options.wordsPerMinute;
    // Calc total seconds
    const totalSeconds = totalMinutes * 60;

    let beforeNode = wordsElement.parentNode!.nextSibling as Element;
    const parentNode = beforeNode.parentNode! as Element;

    // Format to string
    const readingTime = formatTime(totalSeconds);

    if (this.options.showTotalTime) {
      beforeNode = this.addStatsItem(
        'reading-time',
        'Reading time:',
        readingTime,
        parentNode,
        beforeNode
      ).nextSibling! as Element;
    }

    if (this.options.showTotalFinish) {
      this.addStatsItem(
        'finish-at',
        'Finish reading at:',
        finishAtValueElement(totalSeconds),
        parentNode,
        beforeNode
      );
    }
  }

  addKudosHitsRatio(statsElement: Element): void {
    const kudosElement = statsElement.querySelector('dd.kudos');
    const hitsElement = statsElement.querySelector('dd.hits');

    if (kudosElement === null || hitsElement === null) {
      return;
    }

    const kudos = parseInt(kudosElement.textContent!.replace(/,/g, ''));
    const hits = parseInt(hitsElement.textContent!.replace(/,/g, ''));

    if (hits < 1) {
      return;
    }

    const ratio = kudos / hits;
    const ratioPercent = (ratio * 100).toFixed(2) + '%';

    this.addStatsItem(
      'kudos-hits-ratio',
      'Kudos/Hits:',
      ratioPercent,
      statsElement,
      hitsElement.nextSibling! as Element
    );
  }

  addStatsItem(
    klass: string,
    label: string,
    value: string | Element,
    parent: Element,
    beforeElement: Element
  ): Element {
    const element = (
      // Need ADDON_CLASS on children too, as this.clean removes the wrapper div
      <div className={ADDON_CLASS}>
        <dt className={classNames(klass, ADDON_CLASS)}>{label}</dt>
        <dd className={classNames(klass, ADDON_CLASS)}>{value}</dd>
      </div>
    );

    parent.insertBefore(element, beforeElement);

    return element;
  }
}
