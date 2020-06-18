import { mdiOpenInNew } from '@mdi/js';
import { log } from '@/common';
import { htmlToElement, ADDON_CLASS, icon } from './utils';

export function addToolsDropdown() {
  log('Adding tools dropdown button.');
  const primaryNavigation = document.querySelector(
    '#header > ul.primary.navigation'
  )!;
  const lastDropdown = Array.from(
    primaryNavigation.querySelectorAll(':scope > li.dropdown')
  ).pop()!;

  const dropdownEl = htmlToElement(`
      <li class="dropdown ${ADDON_CLASS} ${ADDON_CLASS}--tools" aria-haspopup="true">
          <a href="${browser.runtime.getURL(
            'options_ui/index.html'
          )}" class="dropdown-toggle" data-toggle="dropdown">
            <svg viewbox="0 0 24 24">
              <use href="${browser.runtime.getURL('icon.svg')}#main"></use>
            </svg>
            <span>AO3 Enhancements</span>
          </a>
          <ul class="menu dropdown-menu" role="menu">
          </ul>
      </li>`);

  primaryNavigation.insertBefore(dropdownEl, lastDropdown.nextElementSibling);

  addTool(
    'options',
    `<a href="${browser.runtime.getURL(
      'options_ui/index.html'
    )}" target="_blank">
    <span>Options</span>
    ${icon(mdiOpenInNew)}
  </a>`
  );
}

export function addTool(id: string, html: string): Element {
  const el = htmlToElement(`<li role="menu-item" class="${ADDON_CLASS}--tools--${id}">
    ${html}
  </li>`);

  const toolsUl = document.querySelector(`.${ADDON_CLASS}--tools ul`)!;
  toolsUl.append(el);
  return el;
}
