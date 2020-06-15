module.exports = {
  sourceDir: './build/chrome',
  artifactsDir: './dist/firefox',
  verbose: true,
  run: {
    target: ['chromium'],
    startUrl: [
      'https://archiveofourown.org/',
      'chrome://extensions/',
      'chrome://inspect/#extensions',
    ],
  },
  build: {
    overwriteDest: true,
  },
};
