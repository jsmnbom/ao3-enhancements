module.exports = {
  sourceDir: './dist/chrome',
  artifactsDir: './dist/artifacts/chrome',
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
}
