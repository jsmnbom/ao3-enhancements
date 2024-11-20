import { Unit } from '#content_script/Unit.js'

import Icon from '~icons/ao3e/icon.jsx'
import MdiOpenInNew from '~icons/mdi/openInNew.jsx'

import { ADDON_CLASS, api } from '#common'
import React from '#dom'

export class Tools extends Unit {
  get name() { return 'Tools' }
  get enabled() { return true }

  async ready(): Promise<void> {
    this.logger.debug('Adding dropdown button.')
    const primaryNavigation = document.querySelector(
      '#header ul.primary.navigation',
    )!
    const lastDropdown = Array.from(
      primaryNavigation.querySelectorAll(':scope > li.dropdown'),
    ).pop()!

    const dropdownEl = (
      <li
        class={`dropdown ${ADDON_CLASS} ${ADDON_CLASS}--tools`}
        aria-haspopup="true"
      >
        <a
          href="#"
          class="dropdown-toggle"
          data-toggle="dropdown"
        >
          <Icon />
          <span>AO3 Enhancements</span>
        </a>
        <ul class="dropdown-menu menu" role="menu"></ul>
      </li>
    )

    primaryNavigation.insertBefore(dropdownEl, lastDropdown.nextElementSibling)

    this.addTool(
      'options',
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault()
          void api.openOptionsPage.sendToBackground()
        }}
      >
        <span>Options</span>
        <MdiOpenInNew />
      </a>,
    )
  }

  addTool(id: string, innerEl: Element): Element {
    const el = (
      <li role="menuitem" class={`${ADDON_CLASS}--tools--${id}`}>
        {innerEl}
      </li>
    )

    const toolsUl = document.querySelector(`.${ADDON_CLASS}--tools ul`)!
    toolsUl.append(el)
    return el
  }
}
