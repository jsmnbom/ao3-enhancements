import Unit from '@/content_script/Unit';
import {
  getCache,
  setCache,
  CACHE_IDS,
  fetchAndParseDocument,
  error,
  log,
} from '@/common';
import {
  ADDON_CLASS,
  icon,
  htmlToElement,
  htmlToElements,
} from '@/content_script/utils';
import {
  mdiEyeCheckOutline,
  mdiBookOutline,
  mdiHeartMultipleOutline,
  mdiClockTimeEightOutline,
} from '@mdi/js';

import workMetaNotesTemplate from './workMetaNotes.template.pug';

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
    await this.readCache();
    // Add icons to blurbs
    const blurbs = document.querySelectorAll(
      'li.work.blurb, li.bookmark.blurb'
    );
    if (blurbs.length > 0) await this.addIconsToBlurbs(blurbs);

    // Add notes to work meta
    const workMetaGroup = document.querySelector('.work.meta.group');
    if (workMetaGroup) await this.addNotesToMeta(workMetaGroup);

    // Add event handlers to buttons
    if (this.options.trackWorks.includes('kudos')) {
      const kudoSubmitButton = document.getElementById('kudo_submit');
      if (kudoSubmitButton) {
        kudoSubmitButton.addEventListener('click', () => {
          const workId = parseInt(
            (document.getElementById(
              'kudo_commentable_id'
            )! as HTMLInputElement).value
          );
          void (async () => {
            if (!this._kudos_checked!.includes(workId)) {
              this._kudos_checked!.unshift(workId);
              await setCache(CACHE_IDS.kudosChecked, this._kudos_checked!);
            }
            if (!this._kudos_given!.includes(workId)) {
              this._kudos_given!.unshift(workId);
              await setCache(CACHE_IDS.kudosGiven, this._kudos_given!);
              if (workMetaGroup) await this.addNotesToMeta(workMetaGroup);
            }
          })();
        });
      }
    }
  }

  async readCache(): Promise<void> {
    if (this.options.trackWorks.includes('kudos')) {
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
    }
  }

  async addNotesToMeta(workMetaGroup: Element): Promise<void> {
    const workId = parseInt(window.location.pathname.split('/')[2]);

    const notes = [];

    if (this.options.trackWorks.includes('kudos')) {
      if (await this.hasKudos(workId)) {
        notes.push({
          icon: icon(mdiHeartMultipleOutline),
          text: "You've given kudos to this work",
        });
      }
    }

    if (notes.length > 0) {
      const elements = htmlToElements(
        workMetaNotesTemplate({
          notes,
        })
      );
      const statsDt = workMetaGroup.querySelector('.stats')!;
      statsDt.insertAdjacentElement('beforebegin', elements[0]);
      statsDt.insertAdjacentElement('beforebegin', elements[1]);
    }
  }

  async addIconsToBlurbs(blurbs: NodeListOf<Element>): Promise<void> {
    const promises = [];

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

      if (this.options.trackWorks.includes('kudos')) {
        promises.push(this.addKudosIcon(statusContainer, workId));
      }
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

  createStatus(iconPath: string, title: string): Element {
    const statusHTML = `<span class=${ADDON_CLASS} title="${title}">${icon(
      iconPath
    )}</span>`;
    return htmlToElement(statusHTML);
  }

  async addKudosIcon(statusContainer: Element, workId: number): Promise<void> {
    if (await this.hasKudos(workId)) {
      statusContainer.prepend(
        this.createStatus(
          mdiHeartMultipleOutline,
          "You've given kudos to this work."
        )
      );
    }
  }

  async hasKudos(workId: number): Promise<boolean> {
    if (this._kudos_checked!.includes(workId)) {
      if (this._kudos_given!.includes(workId)) {
        return true;
      }
    } else {
      let kudosElement = document.getElementById('kudos');
      if (!kudosElement) {
        log(`Fetching kudos for ${workId}`);
        const kudosUrl = `https://archiveofourown.org/works/${workId}/kudos`;
        try {
          const doc = await fetchAndParseDocument(kudosUrl);
          kudosElement = doc.getElementById('kudos')!;
        } catch (err) {
          error(err);
        }
      }
      const users: string[] = Array.from(
        kudosElement!.querySelectorAll('.kudos a')
      ).map((a) => a.textContent!);
      this._kudos_checked!.unshift(workId);
      await setCache(CACHE_IDS.kudosChecked, this._kudos_checked!);
      if (users.includes(this.options.username!)) {
        this._kudos_given!.unshift(workId);
        await setCache(CACHE_IDS.kudosGiven, this._kudos_given!);
        return true;
      }
    }

    return false;
  }
}