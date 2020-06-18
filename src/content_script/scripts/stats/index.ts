import { Options } from '@/common';
import { cleanTotalStats, addTotalStats } from './total';
import { addChapterStats } from './chapter';

export function cleanStats() {
  cleanTotalStats();
  for (const statsElement of document.querySelectorAll('dl.stats')) {
    statsElement.classList.remove('columns');
  }

  for (const statValueElement of document.querySelectorAll('dl.stats dd')) {
    const original = (statValueElement as HTMLElement).dataset['ao3eOriginal'];
    if (original) {
      statValueElement.textContent = original;
    }
    delete (statValueElement as HTMLElement).dataset['ao3eOriginal'];
  }
}

export async function addStats(options: Options) {
  addTotalStats(options);
  await addChapterStats(options);

  if (options.showStatsColumns) {
    for (const statsElement of document.querySelectorAll('dl.stats')) {
      statsElement.classList.add('columns');
    }
  }

  // Fix thousands separators
  for (const statValueElement of document.querySelectorAll('dl.stats dd')) {
    // Get stat values as numbers if they are numbers
    // Make sure to split on / so we get both chapter counts
    const statNumericValues: [boolean, string][] = statValueElement
      .textContent!.replace(/\,/g, '')
      .split('/')
      .map((val) => [!isNaN(+val), val]);
    if (!statNumericValues.some(([isNum]) => isNum)) continue;
    (statValueElement as HTMLElement).dataset['ao3eOriginal'] = statValueElement.textContent!;
    statValueElement.textContent = statNumericValues
      .map(([isNum, val]) => {
        if (isNum) {
          return val.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');
        } else {
          return val;
        }
      })
      .join('/');
  }
}
