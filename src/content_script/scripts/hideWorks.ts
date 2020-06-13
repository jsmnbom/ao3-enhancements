import { log, htmlToElement, ADDON_CLASS, Options, icon } from '@/common';

import pluralize from 'pluralize';
import { mdiEyeOff, mdiEye, mdiBulletinBoard } from '@mdi/js';

const blurbWrapperClass = `${ADDON_CLASS}--blurb-wrapper`;

export function cleanHidden() {
  const blurbWrappers = document.querySelectorAll(`.${blurbWrapperClass}`);
  log('Cleaning blurbWrapers', blurbWrappers);
  for (const blurbWrapper of blurbWrappers) {
    (blurbWrapper.parentNode! as HTMLLIElement).hidden = false;
    blurbWrapper.parentNode!.append(...blurbWrapper.childNodes);
    blurbWrapper.remove();
  }
}

function hideWork(options: Options, blurb: Element, reason: string) {
  log('Hiding:', blurb);
  const blurbWrapper = document.createElement('div');
  blurbWrapper.classList.add(blurbWrapperClass);
  blurbWrapper.hidden = true;
  blurbWrapper.append(...blurb.childNodes);
  blurb.append(blurbWrapper);

  if (options.hideShowReason) {
    const msg = htmlToElement(
      `<div class="ao3-enhancement work-hidden--msg">
        <span>
          <span title="This work is hidden.">${icon(mdiEyeOff)}</span>
          <span hidden title="This work was hidden.">${icon(mdiEye)}</span>
          <em>(${reason})</em>
        </span>
        <a class="action">${icon(mdiEye)} Unhide</a>
      </div>`
    );

    const hideButton = msg.querySelector('a');

    hideButton!.addEventListener('click', (e) => {
      const self = e.target as Element;
      const spans = self.previousElementSibling!.querySelectorAll('span');
      if (self.textContent!.includes('Hide')) {
        self.innerHTML = `${icon(mdiEye)} Unhide`;
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

export function hideWorks(options: Options) {
  if (
    !(
      options.hideCrossovers ||
      options.hideLanguages ||
      options.hideAuthors ||
      options.hideTags
    )
  ) {
    return;
  }

  log('Hiding works...');

  const blurbs = document.querySelectorAll('li.blurb');

  for (const blurb of blurbs) {
    const hideReasons = [];

    if (options.hideLanguages) {
      const language = blurb.querySelector('dd.language');
      if (
        language !== null &&
        !options.hideLanguagesList.some(
          (e) => e.text === language!.textContent!
        )
      ) {
        hideReasons.push(`Language: ${language!.textContent!}`);
      }
    }
    if (options.hideCrossovers) {
      const fandomCount = blurb.querySelectorAll('.fandoms a').length;
      if (fandomCount > options.hideCrossoversMaxFandoms) {
        hideReasons.push(`Too many fandoms: ${fandomCount}`);
      }
    }

    if (options.hideAuthors) {
      const authorEl = blurb.querySelector('.heading a[rel=author]')!;
      const author = authorEl.textContent!.trim();
      if (options.hideAuthorsList.includes(author)) {
        hideReasons.push(`Author: ${author}`);
      }
    }

    if (options.hideTags) {
      const tags = Array.from(blurb.querySelectorAll('ul.tags .tag')).map(
        (tag) => tag.textContent
      );
      const denied = options.hideTagsDenyList.filter((deny) =>
        tags.includes(deny)
      );
      if (denied.length > 0) {
        if (!options.hideTagsAllowList.some((allow) => tags.includes(allow))) {
          hideReasons.push(
            `${pluralize('Tag', denied.length)}: ${denied.join(', ')}`
          );
        }
      }
    }

    if (hideReasons.length > 0) {
      hideWork(options, blurb, hideReasons.join(' | '));
    }
  }
}
