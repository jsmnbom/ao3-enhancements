import Unit from '@/content_script/Unit';
import {
  getCache,
  setCache,
  CACHE_IDS,
  fetchAndParseDocument,
  error,
  log,
} from '@/common';
import { ADDON_CLASS, icon, htmlToElement } from '@/content_script/utils';
import {
  mdiEyeCheckOutline,
  mdiBookOutline,
  mdiHeartMultipleOutline,
  mdiClockTimeEightOutline,
} from '@mdi/js';

export class TrackWorks extends Unit {
  _kudos_checked = null as null | number[];
  _kudos_given = null as null | number[];

  async clean(): Promise<void> {
    const blurbs = document.querySelectorAll('li.blurb');

    for (const blurb of blurbs) {
      blurb.classList.remove('has-status');
    }
  }

  get enabled(): boolean {
    return this.options.trackWorks.length > 0 && !!this.options.username;
  }

  async ready(): Promise<void> {
    await this.addIconsToBlurbs();
  }
  async addIconsToBlurbs(): Promise<void> {
    const blurbs = document.querySelectorAll(
      'li.work.blurb, li.bookmark.blurb'
    );

    const promises = [];

    if (this._kudos_checked === null) {
      this._kudos_checked = ((await getCache(
        CACHE_IDS.kudosChecked
      )) as unknown) as number[];
    }
    if (this._kudos_given === null) {
      this._kudos_given = ((await getCache(
        CACHE_IDS.kudosGiven
      )) as unknown) as number[];
    }

    for (const blurb of blurbs) {
      const isBookmark = blurb.classList.contains('bookmark');
      const statusContainer = isBookmark
        ? blurb.querySelector('p.status')!
        : this.createStatusContainer(blurb);

      if (statusContainer.hasAttribute('title')) {
        const title = statusContainer.getAttribute('title')!;
        for (const status of statusContainer.children) {
          status.setAttribute('title', title);
        }
        statusContainer.removeAttribute('title');
      }

      const workId = parseInt(
        new URL(
          (blurb.querySelector('.heading a')! as HTMLAnchorElement).href
        ).pathname.substring(7)
      );

      promises.push(this.addKudosIcon(statusContainer, workId));
    }

    await Promise.allSettled(promises);
  }

  createStatusContainer(blurb: Element): Element {
    const statusContainer = document.createElement('p');
    statusContainer.classList.add('status', ADDON_CLASS);
    blurb.prepend(statusContainer);
    blurb.classList.add('has-status');
    return statusContainer;
  }

  createStatus(iconPath: string): Element {
    const statusHTML = `<span class=${ADDON_CLASS}>${icon(iconPath)}</span>`;
    return htmlToElement(statusHTML);
  }

  async addKudosIcon(statusContainer: Element, workId: number): Promise<void> {
    if (await this.hasKudos(workId)) {
      statusContainer.prepend(this.createStatus(mdiHeartMultipleOutline));
    }
  }

  async hasKudos(workId: number): Promise<boolean> {
    if (this._kudos_checked!.includes(workId)) {
      if (this._kudos_given!.includes(workId)) {
        return true;
      }
    } else {
      log(`Fetching kudos for ${workId}`);
      const kudosUrl = `https://archiveofourown.org/works/${workId}/kudos`;
      try {
        const doc = await fetchAndParseDocument(kudosUrl);
        const users: string[] = Array.from(
          doc.getElementById('kudos')!.querySelectorAll('.kudos a')
        ).map((a) => a.textContent!);
        this._kudos_checked!.unshift(workId);
        await setCache(CACHE_IDS.kudosChecked, this._kudos_checked!);
        if (users.includes(this.options.username!)) {
          this._kudos_given!.unshift(workId);
          await setCache(CACHE_IDS.kudosGiven, this._kudos_given!);
          return true;
        }
      } catch (err) {
        error(err);
      }
    }

    return false;
  }
}
