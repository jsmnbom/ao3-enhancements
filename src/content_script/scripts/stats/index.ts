import { Options } from '@/common';
import { cleanTotalStats, addTotalStats } from './total';
import { addChapterStats } from './chapter';

export function cleanStats() {
  cleanTotalStats();
  for (const statsElement of document.querySelectorAll('dl.stats')) {
    statsElement.classList.remove('columns');
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
}
