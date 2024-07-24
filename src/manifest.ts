import type { PartialDeep } from 'type-fest'

export default function (): PartialDeep<browser._manifest.WebExtensionManifest> {
  const firefox = process.env.BROWSER === 'firefox'
  const chrome = process.env.BROWSER === 'chrome'

  return {
    manifest_version: 3,
    name: 'AO3 Enhancements',
    description: 'Various tweaks and enhancements for ArchiveOfOurOwn.org',
    author: 'Jasmin Bom',
    icons: {
      ...firefox && {
        48: './icons/icon.svg',
        96: './icons/icon.svg',
      },
      ...chrome && {
        48: './icons/icon-48.png',
        96: './icons/icon-96.png',
        128: './icons/icon-128.png',
      },
    },
    background: {
      ...firefox && {
        scripts: ['./background/background.ts'],
        type: 'module',
      },
      ...chrome && {
        service_worker: './background/background.ts',
      },
    },
    options_ui: {
      page: './options_ui/options_ui.html',
      open_in_tab: true,
    },
    content_scripts: [
      {
        matches: ['*://*.archiveofourown.org/*'],
        js: ['./content_script/content_script.ts'],
        css: ['./content_script/content_script.css'],
        run_at: 'document_start',
      },
    ],
    web_accessible_resources: [
      {
        resources: [
          './icons/icon.svg',
          './options_ui/options_ui.html',
        ],
        matches: ['*://*.archiveofourown.org/*'],
      },
    ],
    permissions: [
      'storage',
      'unlimitedStorage',
      'contextMenus',
    ],
    host_permissions: [
      '*://*.archiveofourown.org/*',
    ],
    ...firefox && {
      browser_specific_settings: {
        gecko: {
          // Needed for proper storage
          id: 'ao3-enhancements@jsmnbom',
          // CSS nesting is only supported in FF117+
          strict_min_version: '117.0',
        },
        gecko_android: {
          strict_min_version: '117.0',
        },
      },
    },
    ...chrome && {
      // CSS nesting is only supported in Chrome 120+
      minimum_chrome_version: '120.0',
    },
  }
}
