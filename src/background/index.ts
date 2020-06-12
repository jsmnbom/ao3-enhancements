import { Message, Command, error } from '@/common';

browser.runtime.onMessage.addListener((msg: Message) => {
  if (msg.cmd == Command.openOptionsPage) {
    browser.runtime.openOptionsPage().catch((err) => {
      error('Could not open options page. ', err);
    });
  }
});
