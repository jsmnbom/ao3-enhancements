export default {
  sourceDir: './dist/chrome',
  artifactsDir: './dist/artifacts/chrome',
  ignoreFiles: ['**/*.map', '**/*.meta.json', '**/**.stats.html'],
  run: {
    target: ['chromium'],
    // When AO3 is behind cloudflare, non cached requests sometimes refuse to load without this flag
    // https://github.com/mozilla/web-ext/issues/3511
    args: ['--disable-blink-features=AutomationControlled'],
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
