import {
  Command,
  sendMessage,
  log,
  htmlToElement,
  ADDON_CLASS,
} from '@/common';

export function addOptionsButton() {
  log('Adding options button.');
  const primaryNavigation = document.querySelector(
    '#header > ul.primary.navigation'
  )!;
  const lastDropdown = Array.from(
    primaryNavigation.querySelectorAll(':scope > li.dropdown')
  ).pop()!;

  const optionsElement = htmlToElement(`
      <li class="dropdown ${ADDON_CLASS}">
          <a href="#" class="dropdown-toggle">AO3 Enhancement Options</a>
      </li>`);

  primaryNavigation.insertBefore(
    optionsElement,
    lastDropdown.nextElementSibling
  );

  const optionsButton = optionsElement.querySelector('a')!;
  optionsButton.addEventListener('click', () => {
    log('Opening options page!');
    sendMessage({ cmd: Command.openOptionsPage });
    optionsButton.blur();
  });
}
