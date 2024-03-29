import React from 'dom-chef';
import classNames from 'classnames';
import {
  mdiBookshelf,
  mdiCheck,
  mdiCheckAll,
  mdiClose,
  mdiCloseCircleOutline,
  mdiListStatus,
} from '@mdi/js';
import DefaultSwal from 'sweetalert2/dist/sweetalert2.js';
import dayjs from 'dayjs';

import { ADDON_CLASS, htmlToElement, icon } from '@/content_script/utils';
import Unit from '@/content_script/Unit';
import iconSvgHtml from '@/icons/icon.svg';
import {
  BaseChapter,
  BaseWork,
  ContentDataWrapper,
  upperStatusText,
  WorkStatus,
  WORK_STATUSES,
  WORK_STATUSES_ICONS,
} from '@/common/readingListData';
import { Options } from '@/common/options';
import { createLogger } from '@/common/logger';

const Swal = DefaultSwal.mixin({
  customClass: { container: ADDON_CLASS },
});

const timeouts: number[] = [];

function clearTimeouts() {
  for (const i of timeouts) {
    clearTimeout(i);
  }
}

function timeout(ms: number) {
  return new Promise((resolve) => {
    timeouts.push(window.setTimeout(resolve, ms));
  });
}

function isScrolledIntoView(el: Element) {
  const rect = el.getBoundingClientRect();
  const elemTop = rect.top;
  const elemBottom = rect.bottom;
  return elemTop < window.innerHeight && elemBottom >= 0;
}

class ContentScriptWork extends BaseWork {
  get statusElements(): JSX.Element {
    return (
      <>
        {this.status && icon(WORK_STATUSES_ICONS[this.status])}
        {this.upperStatusText}.
      </>
    );
  }

  get progressElements(): JSX.Element {
    if (this.isAllChaptersRead && !this.isWorkWIP) {
      return (
        <>{this.chapterLink(this.lastReadChapterIndex!)} (last chapter).</>
      );
    } else if (this.isAllChaptersRead) {
      return (
        <>
          {this.chapterLink(this.lastReadChapterIndex!)}. Check back later for
          updates.
        </>
      );
    } else if (
      this.lastReadChapterIndex !== undefined &&
      this.firstUnreadChapterIndex !== undefined &&
      this.firstUnreadChapterIndex < this.lastReadChapterIndex
    ) {
      return (
        <>
          {this.chapterLink(this.lastReadChapterIndex)}.{' '}
          {this.chapterLink(this.firstUnreadChapterIndex)}.{' '}
          {this.lastReadChapterIndex + 1 < this.chapters.length &&
            this.chapterLink(this.lastReadChapterIndex + 1, true)}
        </>
      );
    } else if (this.lastReadChapterIndex !== undefined) {
      return (
        <>
          {this.chapterLink(this.lastReadChapterIndex)}.{' '}
          {this.lastReadChapterIndex + 1 < this.chapters.length &&
            this.chapterLink(this.lastReadChapterIndex + 1, true)}
        </>
      );
    } else {
      return <></>;
    }
  }

  chapterLink(chapterIndex: number, jump = false): JSX.Element {
    return (
      <>
        <a
          href={this.chapters[chapterIndex].getHref(false, true)}
          onclick={(e) => e.stopPropagation()}
        >
          {jump ? 'Jump to chapter' : 'Chapter'} {chapterIndex + 1}
          {jump ? '→' : ''}
        </a>
        {!jump && ` ${this.chapters[chapterIndex].readText}`}
      </>
    );
  }
}

type Button = {
  icon: SVGElement;
  label: string;
} & (
  | {
      onClick: (e: Event) => Promise<void>;
    }
  | {
      href?: string;
    }
);

abstract class BaseWorker {
  constructor(protected work: ContentScriptWork) {}

  protected async setChapterRead(
    setRead: boolean,
    which: 'all' | number
  ): Promise<void> {
    const setChapterRead = (chapter: BaseChapter): void => {
      if (setRead) {
        chapter.readDate = dayjs();
      } else {
        delete chapter.readDate;
      }
    };
    let msg = '';
    if (typeof which === 'number') {
      const chapter = which;
      setChapterRead(this.work.chapters[chapter]);
      msg = `Chapter ${chapter + 1} marked as ${setRead ? 'read' : 'unread'}`;
      if (
        chapter === this.work.chapters.length - 1 &&
        this.work.chapters.some(
          (chapter, index) =>
            !chapter.readDate && index !== this.work.chapters.length - 1
        )
      ) {
        const { isConfirmed } = await Swal.fire({
          text: 'You have read the last chapter of this fic. Should the remaining unread chapters be marked as read too?',
          icon: 'question',
          confirmButtonText: 'Yes',
          showDenyButton: true,
          denyButtonText: 'No',
        });
        if (isConfirmed) {
          which = 'all';
        }
      }
    }
    if (which === 'all') {
      msg = `All chapters marked as ${setRead ? 'read' : 'unread'}`;
      for (const chapter of this.work.chapters) {
        if (!chapter.readDate) {
          setChapterRead(chapter);
        }
      }
    }
    this.work.status = 'reading';
    await this.work.save();
    this.refresh();
    void this.showNotification(msg);
    if (this.work.isAllChaptersRead && !this.work.isWorkWIP) {
      const { isConfirmed } = await Swal.fire({
        text: 'You have read all chapters in this work. Would you like to mark it as fully read?',
        icon: 'question',
        confirmButtonText: 'Yes',
        showDenyButton: true,
        denyButtonText: 'No',
      });
      if (isConfirmed) {
        this.work.status = 'read';
        await this.work.save();
        this.refresh();
        void this.showNotification(`Work marked as ${this.work.statusText}`);
      }
    }
  }

  protected async changeWorkStatus(): Promise<void> {
    const inner = (status: WorkStatus) => {
      return async () => {
        Swal.close();
        this.work.status = status;
        await this.work.save();
        this.refresh();
        void this.showNotification(`Work marked as ${this.work.statusText}`);
      };
    };
    // TODO: Maybe add a "remove from reading list" button
    await Swal.fire({
      showConfirmButton: false,
      html: (
        <div className="buttons">
          Change work status in reading list
          {WORK_STATUSES.map((status) => {
            return (
              <button
                type="button"
                className={classNames(
                  'swal2-styled',
                  'swal2-confirm',
                  `status--${status}`
                )}
                onclick={inner(status)}
              >
                {icon(WORK_STATUSES_ICONS[status])}
                {upperStatusText(status)}
              </button>
            );
          })}
        </div>
      ),
    });
  }

  protected abstract showNotification(text: string): Promise<void>;
  protected abstract refresh(): void;

  protected get baseButtons(): Button[] {
    return [
      {
        icon: icon(mdiListStatus),
        label: 'Change status of work',
        onClick: this.changeWorkStatus.bind(this),
      },
      ...(!this.work.isAllChaptersRead
        ? [
            {
              icon: icon(mdiCheckAll),
              label: `Mark work (${this.work.chapters.length} chapters) as read`,
              onClick: this.setChapterRead.bind(this, true, 'all'),
            },
          ]
        : []),
      ...(this.work.isInList
        ? [
            {
              icon: icon(mdiBookshelf),
              label: 'Show in reading list',
              href: this.work.linkURL,
            },
          ]
        : []),
    ];
  }
}

class WorkPageWorker extends BaseWorker {
  private intersections: Map<Node, boolean> = new Map();
  private fabNotification: HTMLDivElement;
  private fab: HTMLUListElement;
  private fabList: HTMLUListElement;
  private progressDT: HTMLElement;
  private progressDD: HTMLElement;
  private currentChapter: number;
  private headerElements: HTMLElement[] = [];
  private chapterElements: HTMLElement[] = [];
  private footerElements: HTMLElement[] = [];
  private logger = createLogger('WorkPageWorker');

  constructor(
    work: ContentScriptWork,
    dataWrapper: ContentDataWrapper<typeof ContentScriptWork>,
    private options: Options
  ) {
    super(work);
    this.headerElements = Array.from(
      document.querySelectorAll(
        'div#header, dl.work.meta.group, #workskin > div.preface.group'
      )
    );
    this.chapterElements = Array.from(
      document.querySelectorAll('#chapters > div.chapter')
    );
    this.footerElements = Array.from(
      document.querySelectorAll('div.feedback, div#footer')
    );
    this.currentChapter = this.getCurrentChapter();

    [this.fab, this.fabList] = this.createFAB();
    this.fabNotification = this.createFABNotification();
    this.populateFAB();

    const [progressDT, progressDD] = this.createProgress();
    this.progressDT = progressDT;
    this.progressDD = progressDD;

    dataWrapper.addListener((_, work) => {
      if (work === null) {
        this.work = ContentScriptWork.fromWorkPage(
          this.work.workId,
          document
        ) as ContentScriptWork;
      } else {
        this.work = work;
      }
      this.refresh();
    }, this.work.workId);
  }

  public async run(): Promise<void> {
    document.body.append(this.fab, this.fabNotification);
    const workMeta = document.querySelector('dl.work.meta.group')!;
    workMeta.append(this.progressDT, this.progressDD);

    await this.updateFAB(true);

    this.setupObserver();
  }

  async showNotification(text: string): Promise<void> {
    if (this.fabNotification!.dataset.mfbState == 'active') {
      clearTimeouts();
      this.fabNotification!.dataset.mfbState = '';
      await timeout(500);
      this.fab!.dataset.mfbState = 'none';
    }
    if (this.fab!.classList.contains('mfb-hidden')) {
      this.fab!.dataset.mfbState = 'none';
      await this.updateFAB();
      await timeout(200);
    }
    this.fabNotification!.querySelector('span')!.textContent = text;
    this.fabNotification!.dataset.mfbState = 'active';
    await timeout(50);
    this.fab!.dataset.mfbState = 'check';
    await timeout(5000);
    this.fabNotification!.dataset.mfbState = '';
    await timeout(150);
    this.fab!.dataset.mfbState = '';
    await this.updateFAB();
  }

  refresh(): void {
    this.populateFAB();
    this.updateProgress();
  }

  private get chapterAlreadyRead(): boolean {
    return !!this.work.chapters[this.currentChapter].readDate;
  }

  private getCurrentChapter(): number {
    const chapterSelect = document.querySelector('#chapter_index select');
    if (!chapterSelect) {
      // Only 1 chapter or ?view_full_work=true
      // Either way find closest chapter container to bottom of screen
      const chapters = document.querySelectorAll('#chapters > div.chapter');
      // Single chapter works have no div.chapter, the #chapters IS the chapter
      if (chapters.length === 0) return 0;
      const firstChapterInView = Array.from(chapters).find((x) =>
        isScrolledIntoView(x)
      );
      if (!firstChapterInView) {
        for (const el of this.footerElements) {
          if (this.intersections.get(el))
            return this.chapterElements.length - 1;
        }
        return 0;
      }
      return [...firstChapterInView.parentNode!.children].indexOf(
        firstChapterInView
      );
    }
    return Array.from(chapterSelect.options).findIndex(
      (option) => option.selected
    );
  }

  private get shouldFABHide(): boolean {
    if (this.options.readingListShowButton === 'always') return false;
    if (this.options.readingListShowButton === 'never') return true;
    const isReading = Array.from(this.intersections.values()).some((x) => x);
    return !isReading;
  }

  private createFAB(): [HTMLUListElement, HTMLUListElement] {
    const list = <ul className="mfb-component__list"></ul>;
    return [
      <ul
        id="menu"
        className={classNames('mfb-component', 'mfb-zoomin', ADDON_CLASS)}
        data-mfb-toggle="hover"
      >
        <li className="mfb-component__wrap">
          <a
            href="#"
            className="mfb-component__button--main"
            onclick={(e) => e.preventDefault()}
          >
            <i className="mfb-component__main-icon--resting">
              {htmlToElement(iconSvgHtml)}
            </i>
            <i className="mfb-component__main-icon--active">{icon(mdiClose)}</i>
            <div className="mfb-component__main-icon--check draw"></div>
          </a>
          {list}
        </li>
      </ul>,
      list,
    ];
  }

  private async updateFAB(initial = false): Promise<void> {
    if (this.shouldFABHide && !this.fab!.dataset.mfbState) {
      if (initial) {
        const old = this.fab!.style.transition;
        this.fab!.style.transition = '';
        this.fab!.classList.add('mfb-hidden');
        await timeout(10);
        this.fab!.style.transition = old;
      } else {
        this.fab!.classList.add('mfb-hidden');
      }
    } else {
      this.fab!.classList.remove('mfb-hidden');
    }
  }

  private populateFAB(): void {
    const buttons = [
      {
        icon: icon(this.chapterAlreadyRead ? mdiCloseCircleOutline : mdiCheck),
        label: `Mark chapter ${this.currentChapter + 1} as ${
          this.chapterAlreadyRead ? 'unread' : 'read'
        }`,
        onClick: this.setChapterRead.bind(
          this,
          !this.chapterAlreadyRead,
          this.currentChapter
        ),
      },
      ...this.baseButtons,
    ];
    const buttonElements = buttons.map((button) => {
      return (
        <li>
          <a
            href={'href' in button ? button.href : '#'}
            target={'href' in button ? '_blank' : undefined}
            data-mfb-label={button.label}
            className="mfb-component__button--child"
            onclick={
              'onClick' in button
                ? (e) => {
                    e.preventDefault();
                    button.onClick(e).catch((e) => console.error(e));
                  }
                : undefined
            }
          >
            <i className="mfb-component__child-icon">{button.icon}</i>
          </a>
        </li>
      );
    });
    this.fabList.replaceChildren(...buttonElements);
  }

  private createFABNotification(): HTMLDivElement {
    return (
      <div className={classNames('mfb-notification', ADDON_CLASS)}>
        <div className="mfb-notification__wrap">
          <span></span>
        </div>
      </div>
    );
  }

  private createProgress(): [HTMLElement, HTMLElement] {
    return [
      <dt className={classNames('progress', ADDON_CLASS)}>
        Reading progress:
      </dt>,
      <dd className={classNames('progress', ADDON_CLASS)}>
        {this.work.statusElements} {this.work.progressElements}
      </dd>,
    ];
  }

  private updateProgress(): void {
    this.progressDD.replaceChildren(
      this.work.statusElements,
      ' ',
      this.work.progressElements
    );
  }

  private setupObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          this.intersections.set(target, isIntersecting);
        }
        const prevChapter = this.currentChapter;
        this.currentChapter = this.getCurrentChapter();
        if (prevChapter !== this.currentChapter) {
          this.populateFAB();
        }
        const atBottom =
          this.footerElements.some((el) => this.intersections.get(el)) &&
          !this.headerElements.every((el) => this.intersections.get(el));
        if (prevChapter !== this.currentChapter || atBottom) {
          this.maybeMarkAsRead(
            atBottom ? this.currentChapter : prevChapter
          ).catch((e) => this.logger.error(e));
        }
        this.updateFAB().catch((e) => this.logger.error(e));
      },
      { threshold: 0.0 }
    );
    for (const el of [
      ...this.headerElements,
      ...this.chapterElements.map((el) =>
        el.querySelector('div.preface.group')
      ),
      ...this.footerElements,
    ]) {
      if (el) observer.observe(el);
    }
  }
  private async maybeMarkAsRead(chapter: number): Promise<void> {
    if (
      this.options.readingListAutoRead &&
      this.work.status === 'reading' &&
      !this.work.chapters[chapter].readDate
    ) {
      await this.setChapterRead(true, chapter);
    }
  }
}

class ListingWorker extends BaseWorker {
  private progress: JSX.Element;

  constructor(
    work: ContentScriptWork,
    private blurb: HTMLElement,
    dataWrapper: ContentDataWrapper<typeof ContentScriptWork>,
    private options: Options
  ) {
    super(work);
    this.progress = (
      <div
        className={classNames('progress', ADDON_CLASS)}
        onclick={this.openMenu.bind(this)}
      ></div>
    );
    this.updateProgress();

    dataWrapper.addListener((_, work) => {
      if (work === null) {
        this.work = ContentScriptWork.fromListingBlurb(
          this.work.workId,
          this.blurb
        ) as ContentScriptWork;
      } else {
        this.work = work;
      }
      this.refresh();
    }, this.work.workId);
  }

  public run(): void {
    this.blurb.append(this.progress);
  }

  protected async showNotification(text: string): Promise<void> {
    console.log('TODO: BLahh', text);
  }

  protected refresh(): void {
    this.updateProgress();
  }

  private openMenu(): void {
    Swal.fire({
      showConfirmButton: false,
      html: (
        <div className="buttons">
          {this.baseButtons.map((button) => {
            return (
              <button
                type="button"
                className={classNames('swal2-styled', 'swal2-confirm')}
                onclick={(e) => {
                  e.preventDefault();
                  if ('onClick' in button) {
                    button.onClick(e).catch((e) => console.error(e));
                  } else {
                    window.open(button.href, '_blank');
                  }
                }}
              >
                {button.icon}
                {button.label}
              </button>
            );
          })}
        </div>
      ),
    }).catch((e) => console.error(e));
  }

  private updateProgress(): void {
    this.progress.classList.toggle(
      'hidden',
      !this.options.readingListShowNeverReadInListings &&
        this.work.status === undefined
    );
    this.progress.replaceChildren(
      <>
        {this.work.statusElements} {this.work.progressElements}
      </>
    );
  }
}

export class ReadingList extends Unit {
  private pathname = new URL(document.location.toString()).pathname;
  private chapterRegex =
    /^(\/collections\/[^/]+)?\/works\/(?<workId>\d+)(\/chapters\/\d+)?/;

  private get isChapterPage(): boolean {
    const match = this.chapterRegex.exec(this.pathname);
    return !!match;
  }

  private get isWorkListing(): boolean {
    const main = document.getElementById('main')!;
    const classList = main.classList;
    return (
      classList.contains('works-index') ||
      classList.contains('works-search') ||
      classList.contains('works-collected') ||
      classList.contains('tags-show') ||
      classList.contains('bookmarks-index') ||
      classList.contains('series-show') ||
      (classList.contains('works-show') &&
        !!main.querySelector('.work.index .blurb.work'))
    );
  }

  get enabled(): boolean {
    return this.isChapterPage || this.isWorkListing;
  }

  async ready(): Promise<void> {
    const dataWrapper = new ContentDataWrapper(ContentScriptWork);
    const workMap = await dataWrapper.get();

    if (this.isWorkListing) {
      const workBlurbs = Array.from(
        document.querySelectorAll('.work.blurb.group')
      ) as HTMLElement[];
      for (const blurb of workBlurbs) {
        const workIdStr = Array.from(blurb.classList)
          .find((c) => c.startsWith('work-'))
          ?.split('-')[1];
        if (!workIdStr) continue;
        const workId = parseInt(workIdStr);
        const blank = ContentScriptWork.fromListingBlurb(
          workId,
          blurb
        ) as ContentScriptWork;
        const work = workMap.get(workId) || blank;
        if (workMap.has(workId)) {
          if (work.update(blank)) {
            this.logger.log('Saving updated work.', work);
            await work.save();
          }
        }
        new ListingWorker(work, blurb, dataWrapper, this.options).run();
      }
    } else if (this.isChapterPage) {
      const match = this.chapterRegex.exec(this.pathname)!;
      const workId = parseInt(match.groups!.workId);
      const blank = ContentScriptWork.fromWorkPage(
        workId,
        document
      ) as ContentScriptWork;
      const work = workMap.get(workId) || blank;
      if (workMap.has(workId)) {
        if (work.update(blank)) {
          this.logger.log('Saving updated work.', work);
          await work.save();
        }
      }
      await new WorkPageWorker(work, dataWrapper, this.options).run();
    }
  }

  async clean(): Promise<void> {
    for (const elm of document.querySelectorAll(
      '.swal2-shown, .swal2-height-auto'
    )) {
      elm.classList.remove('swal2-shown', 'swal2-height-auto');
    }
  }
}
