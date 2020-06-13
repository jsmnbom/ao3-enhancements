import { log, addItem } from '@/common';
import options from '../options';

export function addKudosHitRatio() {
  if (options.showKudosHitsRatio) {
    const statsElements = document.querySelectorAll('dl.stats');

    log('Adding kudos/hit ratio to stats elements: ', statsElements);

    for (const statsElement of statsElements) {
      const kudosElement = statsElement.querySelector('dd.kudos');
      const hitsElement = statsElement.querySelector('dd.hits');

      if (kudosElement === null || hitsElement === null) {
        log('Skipping stats element: ', statsElement);
        continue;
      }

      const kudos = parseInt(kudosElement.textContent!.replace(/,/g, ''));
      const hits = parseInt(hitsElement.textContent!.replace(/,/g, ''));

      const ratio = kudos / hits;
      const ratioPercent = (ratio * 100).toFixed(2) + '%';

      addItem(
        'kudos-hits-ratio',
        'Kudos/Hits:',
        ratioPercent,
        statsElement,
        <Element>hitsElement.nextSibling!
      );
    }
  }
}
