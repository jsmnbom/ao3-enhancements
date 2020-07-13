browser.runtime.onInstalled.addListener((details) => {
  if (details.reason == 'update') {
    // Changed to cache.workPagesChecked and has
    // other meaning so remove completely
    void browser.storage.local.remove('cache.kudosChecked');
  }
});
