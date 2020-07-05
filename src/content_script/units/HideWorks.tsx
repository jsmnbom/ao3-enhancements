import pluralize from 'pluralize';
import { mdiEye, mdiEyeOff } from '@mdi/js';
import { h as createElement } from 'dom-chef';
import classNames from 'classnames';

import { ADDON_CLASS, icon } from '@/content_script/utils';
import Unit from '@/content_script/Unit';

export class HideWorks extends Unit {
  readonly blurbWrapperClass = `${ADDON_CLASS}--blurb-wrapper`;

  async clean(): Promise<void> {
    const blurbWrappers = document.querySelectorAll(
      `.${this.blurbWrapperClass}`
    );
    this.logger.debug('Cleaning blurbWrapers', blurbWrappers);
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
    this.logger.debug('Hiding works...');

    const blurbs = document.querySelectorAll('li.blurb');

    for (const blurb of blurbs) {
      const hideReasons = [];

      if (this.options.hideLanguages) {
        const language = blurb.querySelector('dd.language');
        if (
          language !== null &&
          !this.options.hideLanguagesList.some(
            (e) => e.text === language.textContent!
          )
        ) {
          hideReasons.push(`Language: ${language.textContent!}`);
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
    this.logger.debug('Hiding:', blurb);
    const blurbWrapper: HTMLDivElement = (
      <div className={this.blurbWrapperClass} hidden></div>
    );
    blurbWrapper.append(...blurb.childNodes);
    blurb.append(blurbWrapper);

    if (this.options.hideShowReason) {
      const isHiddenSpan: HTMLSpanElement = (
        <span title="This work is hidden.">{icon(mdiEyeOff)}</span>
      );
      const wasHiddenSpan: HTMLSpanElement = (
        <span title="This work was hidden.">{icon(mdiEye)}</span>
      );

      const onShowClick = () => {
        isHiddenSpan.parentNode!.replaceChild(wasHiddenSpan, isHiddenSpan);
        showButton.parentNode!.replaceChild(hideButton, showButton);
        blurbWrapper.hidden = false;
      };

      const onHideClick = () => {
        wasHiddenSpan.parentNode!.replaceChild(isHiddenSpan, wasHiddenSpan);
        hideButton.parentNode!.replaceChild(showButton, hideButton);
        blurbWrapper.hidden = true;
      };

      const showButton: HTMLAnchorElement = (
        <a onclick={onShowClick}>{icon(mdiEye)} Show</a>
      );
      const hideButton: HTMLAnchorElement = (
        <a onclick={onHideClick}>{icon(mdiEyeOff)} Hide</a>
      );

      const msg: HTMLDivElement = (
        <div
          className={classNames(
            ADDON_CLASS,
            `${ADDON_CLASS}--work-hidden--msg`
          )}
        >
          <span>
            {isHiddenSpan}
            <em>{reasons.join(' | ')}</em>
          </span>
          <div className="actions">{showButton}</div>
        </div>
      );

      blurb.insertBefore(msg, blurb.childNodes[0]);
    } else {
      (blurb as HTMLLIElement).hidden = true;
    }
  }
}
