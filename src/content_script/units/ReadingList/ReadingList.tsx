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
    if (
      this.chapters[chapterIndex].chapterId === undefined &&
      chapterIndex !== 0
    ) {
      return <>Err</>;
    }
    return (
      <>
        <a href={this.chapters[chapterIndex].getHref(false, true)}>
          {jump ? 'Jump to chapter' : 'Chapter'} {chapterIndex + 1}
          {jump ? '→' : ''}
        </a>
        {!jump && ` ${this.chapters[chapterIndex].readText}`}
      </>
    );
  }
}

class ReadingListWorkPage {
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

  constructor(
    private work: ContentScriptWork,
    dataWrapper: ContentDataWrapper<typeof ContentScriptWork>
  ) {
    this.headerElements = Array.from(
      document.querySelectorAll('div#header, div.work.meta.group')
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
      console.log(work);
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

  public run(): void {
    document.body.append(this.fab, this.fabNotification);
    const workMeta = document.querySelector('div.work.meta.group')!;
    workMeta.append(this.progressDT, this.progressDD);

    this.setupObserver();
  }

  private getCurrentChapter(): number {
    const chapterSelect = document.querySelector('#chapter_index select');
    if (!chapterSelect) {
      // Only 1 chapter or ?view_full_work=true
      // Either way find closest chapter container to bottom of screen
      const chapters = document.querySelectorAll('#chapters > div.chapter');
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

  private get chapterAlreadyRead(): boolean {
    return !!this.work.chapters[this.currentChapter].readDate;
  }

  private get shouldFABHide(): boolean {
    return !Array.from(this.intersections.values()).some((x) => x);
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

  private updateFAB(): void {
    if (this.shouldFABHide && !this.fab!.dataset.mfbState) {
      this.fab!.classList.add('mfb-hidden');
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
          'current'
        ),
      },
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
    const buttonElements = buttons.map((button) => {
      return (
        <li>
          <a
            href={button.href ? button.href : '#'}
            target={button.href ? '_blank' : undefined}
            data-mfb-label={button.label}
            className="mfb-component__button--child"
            onclick={
              button.onClick
                ? (e) => {
                    e.preventDefault();
                    button.onClick().catch((e) => console.error(e));
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
        this.updateFAB();
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

  private async showNotification(text: string): Promise<void> {
    if (this.fabNotification!.dataset.mfbState == 'active') {
      clearTimeouts();
      this.fabNotification!.dataset.mfbState = '';
      await timeout(500);
      this.fab!.dataset.mfbState = 'none';
    }
    this.fabNotification!.querySelector('span')!.textContent = text;
    this.fabNotification!.dataset.mfbState = 'active';
    await timeout(50);
    this.fab!.dataset.mfbState = 'check';
    await timeout(5000);
    this.fabNotification!.dataset.mfbState = '';
    await timeout(150);
    this.fab!.dataset.mfbState = '';
    this.updateFAB();
  }

  private async setChapterRead(
    setRead: boolean,
    which: 'all' | 'current'
  ): Promise<void> {
    const setChapterRead = (chapter: BaseChapter): void => {
      if (setRead) {
        chapter.readDate = dayjs();
      } else {
        delete chapter.readDate;
      }
    };
    let msg = '';
    if (which === 'current') {
      setChapterRead(this.work.chapters[this.currentChapter]);
      msg = `Chapter ${this.currentChapter + 1} marked as ${
        setRead ? 'read' : 'unread'
      }`;
      if (
        this.currentChapter === this.work.chapters.length - 1 &&
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

  private async changeWorkStatus(): Promise<void> {
    const inner = (status: WorkStatus) => {
      return async () => {
        Swal.close();
        this.work.status = status;
        await this.work.save();
        this.refresh();
        void this.showNotification(`Work marked as ${this.work.statusText}`);
      };
    };
    await Swal.fire({
      showConfirmButton: false,
      html: (
        <div className="choose-status">
          Change work status in reading list
          {WORK_STATUSES.map((status) => {
            return (
              <button
                type="button"
                className={classNames(
                  'swal2-styled',
                  'swal2-confirm',
                  'status-button',
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

  private refresh(): void {
    this.populateFAB();
    this.updateProgress();
  }
}

class ReadingListListingBlurb {
  private progress: JSX.Element;

  constructor(
    private work: ContentScriptWork,
    private blurb: HTMLElement,
    dataWrapper: ContentDataWrapper<typeof ContentScriptWork>
  ) {
    this.progress = this.createProgress();

    dataWrapper.addListener((_, work) => {
      if (work === null) {
        this.work = ContentScriptWork.fromListingBlurb(
          this.work.workId,
          this.blurb
        ) as ContentScriptWork;
      } else {
        this.work = work;
      }
      this.updateProgress();
    }, this.work.workId);
  }

  public run(): void {
    this.blurb.append(this.progress);
  }

  private createProgress(): JSX.Element {
    return (
      <div className={classNames('progress', ADDON_CLASS)}>
        {this.work.status !== undefined ? (
          <>
            {this.work.statusElements} {this.work.progressElements}
          </>
        ) : (
          <></>
        )}
      </div>
    );
  }

  private updateProgress(): void {
    this.progress.replaceChildren(
      this.work.statusElements,
      ' ',
      this.work.progressElements
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
    const classList = document.getElementById('main')!.classList;
    return (
      classList.contains('works-index') ||
      classList.contains('works-search') ||
      classList.contains('works-collected') ||
      classList.contains('tags-show') ||
      classList.contains('bookmarks-index') ||
      classList.contains('series-show')
    );
  }

  get enabled(): boolean {
    return this.isChapterPage || this.isWorkListing;
  }

  async ready(): Promise<void> {
    const dataWrapper = new ContentDataWrapper(ContentScriptWork);
    const workMap = await dataWrapper.get();

    if (this.isChapterPage) {
      const match = this.chapterRegex.exec(this.pathname)!;
      const workId = parseInt(match.groups!.workId);
      const blank = ContentScriptWork.fromWorkPage(
        workId,
        document
      ) as ContentScriptWork;
      const work = workMap.get(workId) || blank;
      if (workMap.has(workId)) {
        if (work.update(blank)) {
          await work.save();
        }
      }
      new ReadingListWorkPage(work, dataWrapper).run();
    } else if (this.isWorkListing) {
      const workBlurbs = Array.from(
        document.querySelectorAll('.work.blurb.group')
      ) as HTMLElement[];
      console.log(workBlurbs);
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
        console.log(work, workMap.has(workId), blank);
        if (workMap.has(workId)) {
          if (work.update(blank)) {
            await work.save();
          }
        }
        new ReadingListListingBlurb(work, blurb, dataWrapper).run();
      }
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
