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
import {
  Chapter,
  getListData,
  ReadingListItem,
  ReadingStatus,
  STATUSES,
  upperStatusText,
  api,
} from '@/common';
import iconSvgHtml from '@/icons/icon.svg';

const Swal = DefaultSwal.mixin({
  customClass: { container: ADDON_CLASS },
});

// https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/985
interface ProperParentNode extends ParentNode {
  replaceChildren(...nodes: (Node | string)[]): void;
}

const timeouts: number[] = [];

function clearTimeouts() {
  for (const i of timeouts) {
    clearTimeout(i);
  }
}

function timeout(ms: number) {
  return new Promise((resolve) => {
    timeouts.push(setTimeout(resolve, ms));
  });
}

function chapterHref(workId: number, chapterId: number | null): string {
  if (chapterId === null) {
    return `/works/${workId}#workskin`;
  }
  return `/works/${workId}/chapters/${chapterId}#workskin`;
}

function getCurrentChapter(): number {
  const chapterSelect: HTMLSelectElement | null = document.querySelector(
    '#chapter_index select'
  );
  if (!chapterSelect) return 0;
  return Array.from(chapterSelect.options).findIndex(
    (option) => option.selected
  );
}

class ContentScriptReadingListItem extends ReadingListItem {
  static fromWorkPage(workId: number): ContentScriptReadingListItem {
    const chapterSelect: HTMLSelectElement | null = document.querySelector(
      '#chapter_index select'
    );
    const chapters = chapterSelect
      ? Array.from(chapterSelect.options).map(
          (option) => new Chapter(parseInt(option.value))
        )
      : [new Chapter(null)];
    const [_written, total] = document
      .querySelector('#main .work.meta.group .stats .chapters')!
      .textContent!.split('/');
    return new ContentScriptReadingListItem(
      workId,
      document.querySelector('#workskin .title')!.textContent!.trim(),
      document.querySelector('#workskin .byline')!.textContent!.trim(),
      'unread',
      // TODO: Somehow update chapters?
      chapters,
      total === '?' ? null : parseInt(total)
    );
  }

  static fromListingBlurb(
    workId: number,
    blurb: HTMLElement
  ): ContentScriptReadingListItem {
    const [written, total] = blurb
      .querySelector('.stats dd.chapters')!
      .textContent!.split('/');
    return new ContentScriptReadingListItem(
      workId,
      blurb.querySelector('.heading > a')!.textContent!,
      Array.from(blurb.querySelectorAll('.heading > [rel="author"]'))
        .map((a) => a.textContent)
        .join(', '),
      'unread',
      new Array(parseInt(written)).fill(undefined).map(() => new Chapter(null)),
      total === '?' ? null : parseInt(total)
    );
  }

  get statusElements(): JSX.Element {
    return <>{this.upperStatusText}.</>;
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
    if (this.chapters[chapterIndex].chapterId === undefined) {
      return <>Err</>;
    }
    return (
      <>
        <a
          href={chapterHref(
            this.workId,
            this.chapters[chapterIndex].chapterId!
          )}
        >
          {jump ? 'Jump to chapter' : 'Chapter'} {chapterIndex + 1}
          {jump ? '→' : ''}
        </a>
        {!jump &&
          (this.chapters[chapterIndex].readDate ? (
            <> read {this.chapters[chapterIndex].readText}</>
          ) : (
            ' still unread'
          ))}
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

  constructor(
    private item: ContentScriptReadingListItem,
    private currentChapter: number
  ) {
    [this.fab, this.fabList] = this.createFAB();
    this.fabNotification = this.createFABNotification();
    this.populateFAB();

    const [progressDT, progressDD] = this.createProgress();
    this.progressDT = progressDT;
    this.progressDD = progressDD;
  }

  public run(): void {
    document.body.append(this.fab, this.fabNotification);
    const workMeta = document.querySelector('.work.meta.group')!;
    workMeta.append(this.progressDT, this.progressDD);

    this.setupFABObserver();
  }

  private get chapterAlreadyRead(): boolean {
    return !!this.item.chapters[this.currentChapter].readDate;
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
            {list}
          </a>
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
      ...(!this.item.isAllChaptersRead
        ? [
            {
              icon: icon(mdiCheckAll),
              label: `Mark work (${this.item.chapters.length} chapters) as read`,
              onClick: this.setChapterRead.bind(this, true, 'all'),
            },
          ]
        : []),
      ...(this.item.isAnyChaptersRead
        ? [
            {
              icon: icon(mdiBookshelf),
              label: 'Edit in reading list',
              onClick: () => {
                // TODO: implement
                console.log('NYI');
              },
            },
          ]
        : []),
    ];
    const buttonElements = buttons.map((button) => {
      return (
        <li>
          <a
            href="#"
            data-mfb-label={button.label}
            className="mfb-component__button--child"
            onclick={(e) => {
              e.preventDefault();
              button.onClick();
            }}
          >
            <i className="mfb-component__child-icon">{button.icon}</i>
          </a>
        </li>
      );
    });
    (this.fabList as unknown as ProperParentNode).replaceChildren(
      ...buttonElements
    );
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
        {this.item.statusElements} {this.item.progressElements}
      </dd>,
    ];
  }

  private updateProgress(): void {
    (this.progressDD as unknown as ProperParentNode).replaceChildren(
      this.item.statusElements,
      ' ',
      this.item.progressElements
    );
  }

  private setupFABObserver(): void {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          this.intersections.set(target, isIntersecting);
        }
        this.updateFAB();
      },
      { threshold: 0.0 }
    );
    for (const el of document.querySelectorAll(
      '#header, .work.meta.group, .chapter .title, .feedback, #footer'
    )) {
      observer.observe(el);
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
    const setChapterRead = (chapter: Chapter): void => {
      if (setRead) {
        chapter.readDate = dayjs();
      } else {
        delete chapter.readDate;
      }
    };
    let msg = '';
    if (which === 'current') {
      setChapterRead(this.item.chapters[this.currentChapter]);
      msg = `Chapter ${this.currentChapter + 1} marked as ${
        setRead ? 'read' : 'unread'
      }`;
      if (
        this.currentChapter === this.item.chapters.length - 1 &&
        this.item.chapters.some((chapter) => !chapter.readDate)
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
      for (const chapter of this.item.chapters) {
        if (!chapter.readDate) {
          setChapterRead(chapter);
        }
      }
    }
    this.item.status = 'reading';
    await this.item.save();
    this.refresh();
    void this.showNotification(msg);
    if (this.item.isAllChaptersRead && !this.item.isWorkWIP) {
      const { isConfirmed } = await Swal.fire({
        text: 'You have read all chapters in this work. Would you like to mark it as fully read?',
        icon: 'question',
        confirmButtonText: 'Yes',
        showDenyButton: true,
        denyButtonText: 'No',
      });
      if (isConfirmed) {
        this.item.status = 'read';
        await this.item.save();
        this.refresh();
        void this.showNotification(`Work marked as ${this.item.statusText}`);
      }
    }
    await api.processBookmark.sendBG(this.item);
  }

  private async changeWorkStatus(): Promise<void> {
    const inner = (status: ReadingStatus) => {
      return async () => {
        Swal.close();
        this.item.status = status;
        await this.item.save();
        this.refresh();
        void this.showNotification(`Work marked as ${this.item.statusText}`);
      };
    };
    await Swal.fire({
      showConfirmButton: false,
      html: (
        <div className="choose-status">
          Change work status in reading list
          {STATUSES.map((status) => {
            return (
              <button
                type="button"
                className="swal2-styled swal2-confirm"
                onclick={inner(status)}
              >
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
    private item: ContentScriptReadingListItem,
    private blurb: HTMLElement
  ) {
    this.progress =
      this.item.status !== undefined ? this.createProgress() : <></>;
  }

  public run(): void {
    this.blurb.append(this.progress);
  }

  private createProgress(): JSX.Element {
    return (
      <div className={classNames('progress', ADDON_CLASS)}>
        {this.item.statusElements} {this.item.progressElements}
      </div>
    );
  }
}

export class ReadingList extends Unit {
  private pathname = new URL(document.location.toString()).pathname;
  private chapterRegex =
    /^(\/collections\/[^/]+)?\/works\/(?<workId>\d+)(\/chapters\/\d+)?/;

  private get isChapterPage(): boolean {
    // TODO: Figure out how to handle ?show_full_work=true
    const match = this.chapterRegex.exec(this.pathname);
    return !!match;
  }

  private get isWorkListing(): boolean {
    const classList = document.getElementById('main')!.classList;
    return (
      classList.contains('works-index') ||
      classList.contains('works-collected') ||
      classList.contains('bookmarks-index') ||
      classList.contains('series-show')
    );
  }

  get enabled(): boolean {
    return (
      this.options.user !== null &&
      this.options.readingListCollectionId !== null &&
      this.options.readingListPsued !== null &&
      (this.isChapterPage || this.isWorkListing)
    );
  }

  async ready(): Promise<void> {
    const readingList = await getListData(ContentScriptReadingListItem);

    if (this.isChapterPage) {
      const match = this.chapterRegex.exec(this.pathname)!;
      const workId = parseInt(match.groups!.workId);
      const item =
        readingList.find((item) => item.workId === workId) ||
        ContentScriptReadingListItem.fromWorkPage(workId);
      new ReadingListWorkPage(item, getCurrentChapter()).run();
    } else if (this.isWorkListing) {
      const workBlurbs = document.querySelectorAll('.work.blurb.group');
      for (const blurb of workBlurbs) {
        const workIdStr = Array.from(blurb.classList)
          .find((c) => c.startsWith('work-'))
          ?.split('-')[1];
        if (!workIdStr) continue;
        const workId = parseInt(workIdStr);
        const item =
          readingList.find((item) => item.workId === workId) ||
          ContentScriptReadingListItem.fromListingBlurb(
            workId,
            blurb as HTMLElement
          );
        new ReadingListListingBlurb(item, blurb as HTMLElement).run();
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
