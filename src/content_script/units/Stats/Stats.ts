import { Unit } from '#content_script/Unit.js'

import type { Options } from '#common'

import { ChapterStats } from './ChapterStats.tsx'
import { TotalStats } from './TotalStats.tsx'

export class Stats extends Unit {
  total: TotalStats
  chapter: ChapterStats

  constructor(options: Options) {
    super(options)

    this.total = new TotalStats(options)
    this.chapter = new ChapterStats(options)
  }

  get name() { return 'Stats' }
  get enabled() { return true }

  async clean(): Promise<void> {
    await this.total.clean()
    await this.chapter.clean()

    for (const statValueElement of document.querySelectorAll('dl.stats dd')) {
      const original = statValueElement.dataset.ao3eOriginal
      if (original)
        statValueElement.textContent = original

      delete statValueElement.dataset.ao3eOriginal
    }
  }

  async ready(): Promise<void> {
    if (this.total.enabled)
      await this.total.ready()
    if (this.chapter.enabled)
      await this.chapter.ready()

    // Fix thousands separators
    for (let statValueElement of document.querySelectorAll('dl.stats dd')) {
      if (statValueElement.querySelector('a'))
        statValueElement = statValueElement.querySelector('a')!

      // Get stat values as numbers if they are numbers
      // Make sure to split on / so we get both chapter counts
      const statNumericValues: [boolean, string][] = statValueElement
        .textContent!.replace(/,/g, '').split('/').map(val => [!Number.isNaN(+val), val])
      if (!statNumericValues.some(([isNum]) => isNum))
        continue
      statValueElement.dataset.ao3eOriginal = statValueElement.textContent!
      statValueElement.textContent = statNumericValues
        .map(([isNum, val]) => {
          if (isNum)
            return val.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009')
          else
            return val
        })
        .join('/')
    }
  }
}
