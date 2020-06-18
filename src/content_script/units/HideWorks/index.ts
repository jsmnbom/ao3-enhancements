import pluralize from 'pluralize';
import { mdiEyeOff, mdiEye } from '@mdi/js';

import { log } from '@/common';
import { htmlToElement, ADDON_CLASS, icon } from '@/content_script/utils';
import msgTemplate from './msg.pug';
import Unit from '@/content_script/Unit';

export class HideWorks extends Unit {
  readonly blurbWrapperClass = `${ADDON_CLASS}--blurb-wrapper`;

  async clean(): Promise<void> {
    const blurbWrappers = document.querySelectorAll(
      `.${this.blurbWrapperClass}`
    );
    log('Cleaning blurbWrapers', blurbWrappers);
    for (const blurbWrapper of blurbWrappers) {
      (blurbWrapper.parentNode! as HTMLLIElement).hidden = false;
      blurbWrapper.parentNode!.append(...blurbWrapper.childNodes);
      blurbWrapper.remove();
    }
  }

  get enabled(): boolean {
    return (
      this.options.hideCrossovers ||
      this.options.hideLanguages ||
      this.options.hideAuthors ||
      this.options.hideTags
    );
  }

  async ready(): Promise<void> {
    log('Hiding works...');

    const blurbs = document.querySelectorAll('li.blurb');

    for (const blurb of blurbs) {
      const hideReasons = [];

      if (this.options.hideLanguages) {
        const language = blurb.querySelector('dd.language');
        if (
          language !== null &&
          !this.options.hideLanguagesList.some(
            (e) => e.text === language!.textContent!
          )
        ) {
          hideReasons.push(`Language: ${language!.textContent!}`);
        }
      }
      if (this.options.hideCrossovers) {
        const fandomCount = blurb.querySelectorAll('.fandoms a').length;
        if (fandomCount > this.options.hideCrossoversMaxFandoms) {
          hideReasons.push(`Too many fandoms: ${fandomCount}`);
        }
      }

      if (this.options.hideAuthors) {
        const authors = Array.from(
          blurb.querySelectorAll('.heading a[rel=author]')
        ).map((author) => author.textContent!.trim());
        const hidden = this.options.hideAuthorsList.filter((author) =>
          authors.includes(author)
        );
        if (hidden.length > 0) {
          hideReasons.push(
            `${pluralize('Author', hidden.length)}: ${hidden.join(', ')}`
          );
        }
      }

      if (this.options.hideTags) {
        const tags = Array.from(blurb.querySelectorAll('ul.tags .tag')).map(
          (tag) => tag.textContent
        );
        const denied = this.options.hideTagsDenyList.filter((deny) =>
          tags.includes(deny)
        );
        if (denied.length > 0) {
          if (
            !this.options.hideTagsAllowList.some((allow) =>
              tags.includes(allow)
            )
          ) {
            hideReasons.push(
              `${pluralize('Tag', denied.length)}: ${denied.join(', ')}`
            );
          }
        }
      }

      if (hideReasons.length > 0) {
        this.hideWork(blurb, hideReasons);
      }
    }
  }

  hideWork(blurb: Element, reasons: string[]): void {
    log('Hiding:', blurb);
    const blurbWrapper = document.createElement('div');
    blurbWrapper.classList.add(this.blurbWrapperClass);
    blurbWrapper.hidden = true;
    blurbWrapper.append(...blurb.childNodes);
    blurb.append(blurbWrapper);

    if (this.options.hideShowReason) {
      const msg = htmlToElement(
        msgTemplate({
          mdiEyeOff: icon(mdiEyeOff),
          mdiEye: icon(mdiEye),
          reasons,
        })
      );

      const hideButton = msg.querySelector('a');

      hideButton!.addEventListener('click', (e) => {
        const self = e.target as Element;
        const parent: Element = self.parentElement!;
        const spans = parent.previousElementSibling!.querySelectorAll('span');
        if (self.textContent!.includes('Hide')) {
          self.innerHTML = `${icon(mdiEye)} Show`;
          spans[0].hidden = false;
          spans[1].hidden = true;
          blurbWrapper.hidden = true;
        } else {
          self.innerHTML = `${icon(mdiEyeOff)} Hide`;
          spans[0].hidden = true;
          spans[1].hidden = false;
          blurbWrapper.hidden = false;
        }
      });

      blurb.insertBefore(msg, blurb.childNodes[0]);
    } else {
      (blurb as HTMLLIElement).hidden = true;
    }
  }
}
