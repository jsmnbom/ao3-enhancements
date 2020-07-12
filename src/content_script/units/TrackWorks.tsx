import {
  mdiHeartMultipleOutline,
  mdiBookOutline,
  mdiBellCheckOutline,
} from '@mdi/js';
import { h as createElement } from 'dom-chef';
import classNames from 'classnames';
import PQueue from 'p-queue';

import Unit from '@/content_script/Unit';
import { getCache, setCache, fetchAndParseDocument } from '@/common';
import { ADDON_CLASS, icon } from '@/content_script/utils';

interface WorkData {
  kudosGiven: boolean;
  bookmarked: boolean;
  subscribed: boolean;
}

export class TrackWorks extends Unit {
  workPagesChecked = null as null | number[];
  kudosGiven = null as null | number[];
  bookmarked = null as null | number[];
  subscribed = null as null | number[];

  META_NOTES_CLASS = 'track-works-meta-notes';

  queue = new PQueue({
    concurrency: 2,
    intervalCap: 1,
    interval: 500,
  });

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

    if (this.isWorkPage(document)) {
      const workId = parseInt(window.location.pathname.split('/')[2]);
      this.logger.log('Is work page. Workid:', workId);

      // Add notes to work meta
      const workMetaGroup = document.querySelector('.work.meta.group')!;
      this.logger.log('Adding meta to', workMetaGroup);
      await this.addNotesToMeta(workMetaGroup);
      // Add event handlers to buttons
      const checkAfterNotice = () => {
        this.logger.log('Waiting for notice.');
        const observer = new MutationObserver((_mutationList, observer) => {
          void (async () => {
            observer.disconnect();
            this.logger.log('Rechecking work page.');
            await this.checkWorkPage(document, workId);
            document
              .querySelectorAll(`.${ADDON_CLASS}.${this.META_NOTES_CLASS}`)
              .forEach((element) => element.remove());
            await this.addNotesToMeta(workMetaGroup);
          })();
        });
        observer.observe(
          document.getElementById('main')!.querySelector('.flash')!,
          { childList: true }
        );
      };
      const addBookmark = async () => {
        this.arrAddToFront(this.bookmarked!, workId);
        await setCache({
          bookmarked: this.bookmarked!,
        });
      };
      const eventElements: [
        Element | null | undefined,
        string,
        () => void
      ][] = [
        [document.getElementById('kudo_submit'), 'click', checkAfterNotice],
        [
          document
            .getElementById('bookmark-form')
            ?.querySelector('.submit.actions > input'),
          'click',
          addBookmark,
        ],
        [
          document.querySelector('.subscribe input[type=submit]'),
          'click',
          checkAfterNotice,
        ],
        [
          document.getElementById('bookmark-form')!.querySelector('form'),
          'submit',
          addBookmark,
        ],
        [
          document.querySelector('.subscribe > form'),
          'submit',
          checkAfterNotice,
        ],
      ];
      this.logger.log('Attaching handlers to', eventElements);
      for (const eventElement of eventElements) {
        if (eventElement[0]) {
          eventElement[0].addEventListener(eventElement[1], eventElement[2]);
        }
      }
    } else {
      // Add icons to blurbs
      const blurbs = document.querySelectorAll(
        'li.work.blurb, li.bookmark.blurb'
      );
      await this.addIconsToBlurbs(blurbs);
    }
    // Check if on sub or bookmarks page
    const mainElement = document.getElementById('main')!;
    // Are we on a subscription page
    if (mainElement.classList.contains('subscriptions-index')) {
      for (const form of mainElement.querySelectorAll('dd form')) {
        const titleLinkElementHref = form.parentElement?.previousElementSibling?.querySelector(
          'a'
        )?.href;
        if (titleLinkElementHref) {
          const pathname = new URL(titleLinkElementHref).pathname;
          if (pathname.startsWith('/works/')) {
            const workId = parseInt(pathname.split('/')[2]);
            const unsubscribe = () => {
              this.logger.log('Deleting subscribtion for', workId);
              this.subscribed = this.arrRemove(this.subscribed!, workId);
              void setCache({
                subscribed: this.subscribed,
              });
            };
            form.addEventListener('submit', unsubscribe);
            form
              .querySelector('input[type=submit]')!
              .addEventListener('click', unsubscribe);
          }
        }
      }
    }
    // Are we on a bookmarks page
    if (
      mainElement.classList.contains('bookmarks-show') ||
      mainElement.classList.contains('bookmarks-index')
    ) {
      for (const blurb of mainElement.querySelectorAll('.bookmark.blurb')) {
        const workId = parseInt(
          new URL(
            (blurb.querySelector('.heading a')! as HTMLAnchorElement).href
          ).pathname.split('/')[2]
        );
        const deleteButton = blurb.querySelector(
          '.own.user .actions a[data-method=delete]'
        ) as HTMLElement;
        deleteButton?.addEventListener('click', (e) => {
          const shouldDelete = window.confirm(deleteButton.dataset.confirm);
          if (shouldDelete) {
            this.logger.log('Deleting bookmark for', workId);
            this.bookmarked = this.arrRemove(this.bookmarked!, workId);
            void setCache({
              bookmarked: this.bookmarked,
            });
            deleteButton.dataset.confirm = '';
          } else {
            e.stopImmediatePropagation();
            e.preventDefault();
            return false;
          }
        });
      }
    }
  }

  async readCache(): Promise<void> {
    const cached = await getCache([
      'workPagesChecked',
      'kudosGiven',
      'bookmarked',
      'subscribed',
    ]);
    this.workPagesChecked = cached.workPagesChecked;
    this.kudosGiven = cached.kudosGiven;
    this.bookmarked = cached.bookmarked;
    this.subscribed = cached.subscribed;
  }

  async addNotesToMeta(workMetaGroup: Element): Promise<void> {
    const workId = parseInt(window.location.pathname.split('/')[2]);

    const notes = [];

    const data = await this.workData(workId);

    if (this.options.trackWorks.includes('kudos') && data.kudosGiven) {
      notes.push({
        icon: icon(mdiHeartMultipleOutline),
        text: "You've given kudos to this work",
      });
    }

    if (this.options.trackWorks.includes('bookmarked') && data.bookmarked) {
      notes.push({
        icon: icon(mdiBookOutline),
        text: "You've bookmarked this work",
      });
    }
    if (this.options.trackWorks.includes('subscribed') && data.subscribed) {
      notes.push({
        icon: icon(mdiBellCheckOutline),
        text: "You're subscribed to this work",
      });
    }

    if (notes.length > 0) {
      const statsDt = workMetaGroup.querySelector('.stats')!;
      statsDt.insertAdjacentElement(
        'beforebegin',
        <dt className={classNames(ADDON_CLASS, this.META_NOTES_CLASS)}>
          AO3 Enhancements notes:
        </dt>
      );
      statsDt.insertAdjacentElement(
        'beforebegin',
        <dd className={classNames(ADDON_CLASS, this.META_NOTES_CLASS)}>
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
      const pathname = new URL(
        (blurb.querySelector('.heading a')! as HTMLAnchorElement).href
      ).pathname;

      if (!pathname.startsWith('/works/')) {
        continue;
      }

      const workId = parseInt(pathname.split('/')[2]);

      promises.push(
        this.queue.add(async () => {
          const data = await this.workData(workId);
          this.logger.debug('Work data for', workId, ':', data);
          if (data.kudosGiven || data.bookmarked || data.subscribed) {
            const statusContainer = this.getStatusContainer(blurb);

            if (this.options.trackWorks.includes('kudos') && data.kudosGiven) {
              statusContainer.prepend(
                this.createStatus(
                  mdiHeartMultipleOutline,
                  "You've given kudos to this work."
                )
              );
            }
            if (
              this.options.trackWorks.includes('bookmarked') &&
              data.bookmarked
            ) {
              statusContainer.prepend(
                this.createStatus(
                  mdiBookOutline,
                  "You've bookmarked this work."
                )
              );
            }
            if (
              this.options.trackWorks.includes('subscribed') &&
              data.subscribed
            ) {
              statusContainer.prepend(
                this.createStatus(
                  mdiBellCheckOutline,
                  "You're subscribed to this work."
                )
              );
            }
          }
        })
      );
    }

    await Promise.allSettled(promises);
  }

  getStatusContainer(blurb: Element): Element {
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
    return statusContainer;
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

  isWorkPage(doc: Document): boolean {
    const mainElement = doc.getElementById('main');
    return !!(
      mainElement?.classList.contains('works-shows') ||
      mainElement?.classList.contains('chapters-show')
    );
  }

  async workData(workId: number): Promise<WorkData> {
    // Check if we are on a work page with the info we need
    if (this.isWorkPage(document)) {
      return await this.checkWorkPage(document, workId);
    }
    // We're not. So check if we have it cached
    if (this.workPagesChecked?.includes(workId)) {
      return {
        kudosGiven: !!this.kudosGiven?.includes(workId),
        bookmarked: !!this.bookmarked?.includes(workId),
        subscribed: !!this.subscribed?.includes(workId),
      };
    }
    // We do not have it cached, fetch it
    this.logger.debug(`Fetching data for ${workId}`);
    const workPage = `https://archiveofourown.org/works/${workId}`;
    try {
      const doc = await fetchAndParseDocument(workPage);
      return await this.checkWorkPage(doc, workId);
    } catch (err) {
      this.logger.error(err);
      return {
        kudosGiven: false,
        bookmarked: false,
        subscribed: false,
      };
    }
  }

  async checkWorkPage(doc: Document, workId: number): Promise<WorkData> {
    const data: WorkData = {
      kudosGiven: false,
      bookmarked: false,
      subscribed: false,
    };
    // Check for kudos
    const kudosElement = doc.getElementById('kudos');
    const users: string[] = Array.from(
      kudosElement!.querySelectorAll('.kudos a')
    ).map((a) => a.textContent!);
    data.kudosGiven = users.includes(this.options.user!.username);
    if (data.kudosGiven) {
      this.kudosGiven = this.arrAddToFront(this.kudosGiven!, workId);
    } else {
      this.kudosGiven = this.arrRemove(this.kudosGiven!, workId);
    }

    // Check for bookmark
    const bookmarkForm = doc
      .getElementById('bookmark-form')!
      .querySelector('form')!;
    const formAction = new URL(bookmarkForm.action).pathname;
    // Actions is /bookmarks/ID if bookmarked
    // /works/id/bookmarks if not
    data.bookmarked = formAction.startsWith('/bookmarks/');
    if (data.bookmarked) {
      this.bookmarked = this.arrAddToFront(this.bookmarked!, workId);
    } else {
      this.bookmarked = this.arrRemove(this.bookmarked!, workId);
    }

    // Check for subscribtion
    const subButtonMethod = doc.querySelector(
      '.subscribe input[name=_method]'
    ) as HTMLInputElement;
    // If the _method input exists and has delete as value
    data.subscribed = subButtonMethod?.value === 'delete';
    if (data.subscribed) {
      this.subscribed = this.arrAddToFront(this.subscribed!, workId);
    } else {
      this.subscribed = this.arrRemove(this.subscribed!, workId);
    }

    this.workPagesChecked = this.arrAddToFront(this.workPagesChecked!, workId);

    await setCache({
      workPagesChecked: this.workPagesChecked,
      kudosGiven: this.kudosGiven,
      bookmarked: this.bookmarked,
      subscribed: this.subscribed,
    });

    return data;
  }

  arrRemove<V extends unknown, A extends Array<V>>(arr: A, value: V): A {
    if (arr.includes(value)) {
      return arr.filter((id) => id !== value) as A;
    }
    return arr;
  }

  arrAddToFront<V extends unknown, A extends Array<V>>(arr: A, value: V): A {
    arr = this.arrRemove(arr, value);
    arr.unshift(value);
    return arr;
  }
}
