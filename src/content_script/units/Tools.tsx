import { h as createElement } from 'dom-chef';
import classNames from 'classnames';
import { mdiOpenInNew } from '@mdi/js';

import { log } from '@/common';
import { ADDON_CLASS, icon } from '@/content_script/utils';
import Unit from '@/content_script/Unit';
import iconSvg from '@/icon.svg';

export class Tools extends Unit {
  get enabled(): boolean {
    return true;
  }

  async ready(): Promise<void> {
    log('Adding tools dropdown button.');
    const primaryNavigation = document.querySelector(
      '#header > ul.primary.navigation'
    )!;
    const lastDropdown = Array.from(
      primaryNavigation.querySelectorAll(':scope > li.dropdown')
    ).pop()!;

    const dropdownEl = (
      <li
        className={classNames('dropdown', ADDON_CLASS, `${ADDON_CLASS}--tools`)}
        aria-haspopup="true"
      >
        <a
          href={browser.runtime.getURL('options_ui/index.html')}
          className="dropdown-toggle"
          data-toggle="dropdown"
        >
          {iconSvg}
          <span>AO3 Enhancements</span>
        </a>
        <ul className="menu dropdown-menu" role="menu"></ul>
      </li>
    );

    primaryNavigation.insertBefore(dropdownEl, lastDropdown.nextElementSibling);

    this.addTool(
      'options',
      (
        <a
          href={browser.runtime.getURL('options_ui/index.html')}
          target="_blank"
        >
          <span>Options</span>
          {icon(mdiOpenInNew)}
        </a>
      ) as HTMLAnchorElement
    );
  }
  addTool(id: string, innerEl: Element): Element {
    const el = (
      <li role="menu-item" className={`${ADDON_CLASS}--tools--${id}`}>
        {innerEl}
      </li>
    );

    const toolsUl = document.querySelector(`.${ADDON_CLASS}--tools ul`)!;
    toolsUl.append(el);
    return el;
  }
}