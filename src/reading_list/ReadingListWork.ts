import { Vue } from 'vue-property-decorator';
import dayjs from 'dayjs';

import { BaseWork } from '@/common/readingListData';

type ChapterItem = {
  chapterId: number | null | undefined;
  text: string;
  readText?: string;
  href: string;
};

export default class ReadingListWork extends BaseWork {
  get chapterItems(): ChapterItem[] {
    return this.chapters.map((chapter, index) => ({
      chapterId: chapter.chapterId,
      text: `Chapter ${index + 1}`,
      readText: chapter.readText,
      href: chapter.getHref(true),
    }));
  }

  toggleRead(chapterIndex: number): void {
    const chapter = this.chapters[chapterIndex];
    if (chapter.readDate) {
      delete chapter.readDate;
    } else {
      chapter.readDate = dayjs();
    }
    Vue.set(this.chapters, chapterIndex, chapter);
  }

  setAllRead(): void {
    this.chapters = this.chapters.map((chapter) => {
      if (!chapter.readDate) {
        chapter.readDate = dayjs();
      }
      return chapter;
    });
  }
  setAllUnread(): void {
    this.chapters = this.chapters.map((chapter) => {
      if (chapter.readDate) {
        delete chapter.readDate;
      }
      return chapter;
    });
  }

  get readChaptersText(): string {
    const arr = this.chapters
      .map((chapter, index) => [index + 1, chapter.readDate])
      .filter((x) => x[1])
      .map((x) => x[0]) as number[];
    return arr
      .reduce((acc: (number | string)[], val, idx, arr) => {
        if (idx === 0 || idx == arr.length - 1) return [...acc, val];
        if (val + 1 === arr[idx + 1]) {
          if (val - 1 === arr[idx - 1]) {
            if (acc[acc.length - 1] === '-') return acc;
            return [...acc, '-'];
          }
          if (val - 1 !== arr[idx - 1]) {
            return [...acc, ', ', val, '-'];
          }
        }
        return [...acc, val];
      }, [])
      .join('');
  }
}
