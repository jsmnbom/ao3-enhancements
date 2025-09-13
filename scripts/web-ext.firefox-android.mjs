export default {
  sourceDir: './dist/firefox',
  artifactsDir: './dist/artifacts/firefox',
  ignoreFiles: ['**/*.map', '**/*.meta.json', '**/**.stats.html'],
  run: {
    target: ['firefox-android'],
    pref: [
      `extensions.webextensions.base-content-security-policy.v3=script-src 'self' 'wasm-unsafe-eval' http://localhost:* http://127.0.0.1:*; object-src 'self';`,
      `extensions.webextensions.default-content-security-policy.v3=script-src 'self' 'wasm-unsafe-eval' http://localhost:* http://127.0.0.1:*; object-src 'self';`,
    ],
  },
  build: {
    overwriteDest: true,
  },
}
