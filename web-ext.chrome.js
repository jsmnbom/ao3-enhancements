module.exports = {
  sourceDir: './build/chrome',
  verbose: true,
  run: {
    target: ['chromium'],
    startUrl: [
      'https://archiveofourown.org/',
      'chrome://extensions/',
      'chrome://inspect/#extensions',
    ],
  },
};
