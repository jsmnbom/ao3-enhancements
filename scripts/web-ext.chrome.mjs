export default {
  sourceDir: './dist/chrome',
  artifactsDir: './dist/artifacts/chrome',
  ignoreFiles: ['**/*.map', '**/*.meta.json', '**/**.stats.html'],
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
