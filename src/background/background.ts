browser.runtime.onInstalled.addListener((details) => {
  if (details.reason == 'update') {
    void browser.storage.local.remove('cache.kudosChecked');
  }
});
