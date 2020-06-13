import { log, htmlToElement, ADDON_CLASS } from '@/common';
import options from '../options';

const blurbWrapperClass = `${ADDON_CLASS}--blurb-wrapper`;

export function cleanHidden() {
  const blurbWrappers = document.querySelectorAll(`.${blurbWrapperClass}`);
  for (const blurbWrapper of blurbWrappers) {
    blurbWrapper.parentNode!.append(...blurbWrapper.childNodes);
    blurbWrapper.remove();
  }
}

function hideWork(blurb: Element, reason: string) {
  const blurbWrapper = document.createElement('div');
  blurbWrapper.classList.add(blurbWrapperClass);
  blurbWrapper.hidden = true;
  blurbWrapper.append(...blurb.childNodes);
  blurb.append(blurbWrapper);

  const msg = htmlToElement(
    `<div class="ao3-enhancement work-hidden--msg">
      <p>This work <span>is</span><span hidden>was</span> hidden. <em>(${reason})</em></p>
      <a class="action">Unhide</a>
    </div>`
  );

  const hideButton = msg.querySelector('a');

  hideButton!.addEventListener('click', (e) => {
    const self = e.target as Element;
    const spans = self.previousElementSibling!.querySelectorAll('span');
    if (self.textContent == 'Hide') {
      self.textContent = 'Unhide';
      spans[0].hidden = false;
      spans[1].hidden = true;
      blurbWrapper.hidden = true;
    } else {
      self.textContent = 'Hide';
      spans[0].hidden = true;
      spans[1].hidden = false;
      blurbWrapper.hidden = false;
    }
  });

  blurb.insertBefore(msg, blurb.childNodes[0]);
}

export function hideWorks() {
  if (!(options.hideCrossovers || options.hideLanguages)) {
    return;
  }

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
        hideReasons.push(`Language not allowed: ${language!.textContent!}`);
      }
    }
    if (options.hideCrossovers) {
      const fandomCount = blurb.querySelectorAll('.fandoms a').length;
      if (fandomCount > options.hideCrossoversMaxFandoms) {
        hideReasons.push(`Too many fandoms: ${fandomCount}`);
      }
    }

    if (hideReasons.length > 0) {
      hideWork(blurb, hideReasons.join(' | '));
    }
  }
}
