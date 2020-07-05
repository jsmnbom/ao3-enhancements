import { mdiHeartMultipleOutline } from '@mdi/js';
import { h as createElement } from 'dom-chef';
import classNames from 'classnames';

import Unit from '@/content_script/Unit';
import { getCache, setCache, fetchAndParseDocument } from '@/common';
import { ADDON_CLASS, icon } from '@/content_script/utils';

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
    return this.options.trackWorks.length > 0 && !!this.options.user;
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
              await setCache({ kudosChecked: this._kudos_checked! });
            }
            if (!this._kudos_given!.includes(workId)) {
              this._kudos_given!.unshift(workId);
              await setCache({ kudosGiven: this._kudos_given! });
              if (workMetaGroup) await this.addNotesToMeta(workMetaGroup);
            }
          })();
        });
      }
    }
  }

  async readCache(): Promise<void> {
    if (this.options.trackWorks.includes('kudos')) {
      const cached = await getCache(['kudosChecked', 'kudosGiven']);
      this._kudos_checked = cached.kudosChecked;
      this._kudos_given = cached.kudosGiven;
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
      const statsDt = workMetaGroup.querySelector('.stats')!;
      statsDt.insertAdjacentElement(
        'beforebegin',
        <dt className={ADDON_CLASS}>AO3 Enhancements notes:</dt>
      );
      statsDt.insertAdjacentElement(
        'beforebegin',
        <dd className={ADDON_CLASS}>
          <ul className="commas">
            {notes.map((note) => (
              <li>
                <span>{note.icon}</span>
                <span>{note.text}</span>
              </li>
            ))}
          </ul>
        </dd>
      );
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
    const statusContainer: HTMLParagraphElement = (
      <p className={classNames('status', ADDON_CLASS)}></p>
    );
    blurb.prepend(statusContainer);
    blurb.classList.add('has-status');
    return statusContainer;
  }

  createStatus(iconPath: string, title: string): HTMLSpanElement {
    return (
      <span className={ADDON_CLASS} title={title}>
        {icon(iconPath)}
      </span>
    );
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
        this.logger.debug(`Fetching kudos for ${workId}`);
        const kudosUrl = `https://archiveofourown.org/works/${workId}/kudos`;
        try {
          const doc = await fetchAndParseDocument(kudosUrl);
          kudosElement = doc.getElementById('kudos')!;
        } catch (err) {
          this.logger.error(err);
        }
      }
      const users: string[] = Array.from(
        kudosElement!.querySelectorAll('.kudos a')
      ).map((a) => a.textContent!);
      this._kudos_checked!.unshift(workId);
      await setCache({ kudosChecked: this._kudos_checked! });
      if (users.includes(this.options.user!.username)) {
        this._kudos_given!.unshift(workId);
        await setCache({ kudosGiven: this._kudos_given! });
        return true;
      }
    }

    return false;
  }
}
