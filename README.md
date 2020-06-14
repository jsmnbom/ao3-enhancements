# AO3 Enhancements

This is a browser addon which adds various configurable tweaks and enhancements to the fanfiction website [ArchiveOfOurOwn.org](https://archiveofourown.org).

## Installation

[Install from AMO](https://addons.mozilla.org/en-US/firefox/addon/ao3-enhancements/)

Most of the work for a chrome/opera/edge version is done, it just hasn't been released. A release should be entirely be doable if requested.

## Current enhancements/features

- Adds **Reading time** and **Finish reading at** to works and even each chapter.
- Shows **Kudos/Hits ratio**, making it easier to find the amazing works.
- Allows **hiding works** when searching/browsing, based on:
  - The language of the work, *and/or*
  - How many fandoms the work is in (is it a crossover?), *and/or*
  - Is it written by certain authors?, *and/or*
  - Does it have certain tags?
- Various **style customizations**: (only the 1 for now)
  - Adjust the width of a work, making reading on large displays easier.

Furthermore i strive to make the addon at least as accessible as AO3 itself. Please do report an issue if that is not the case.

Most of these features are disabled by default. After installation go to [ArchiveOfOurOwn.org](https://archiveofourown.org) and click the new menu button *"AO3 Enhancements Options"* to go to the options screen.

## Screenshots

See the entry on [AMO](https://addons.mozilla.org/en-US/firefox/addon/ao3-enhancements/) for screenshots.

## Developing

<details>
<summary>
Expand this section for instructions on how to build the addon yourself
</summary>

Start by installing the required packages by `npm install`. Then continue to either development or releasing below depending on what you want to do.

### Development

Use `npm run watch:firefox` (will compile src/ to build/firefox/ and keep watching source files) and then when files have built `npm run start:firefox` (will launch firefox-developer-edition with the built extension and reload when the built files change - most of the time, pressing R may be required).

Use `npm run start-vue-devtools` to run the standalone vue-devtools. This requires the [mitmproxy](https://mitmproxy.org/) tool, to proxy from HTTPS to HTTP.

### Releasing

Use `npm run build:prod:firefox` (will compile src/ to build/firefox/) and when files have built `npm run start:firefox` to test that everything works. Then use `npm run dist:firefox` to package the extension to a .zip file that can then be uploaded on AMO.

<details>
<summary>Latest AMO is compiled using these software versions.
</summary>

```
Arch linux
Kernel: 5.6.15-arch1-1
Node: v14.3.0
Npm: 6.14.5

```

</details>
</details>

## Thanks to

The icon is a combination of the AO3 logo (svg version from IconFinder), and the Gear icon from the Octicons pack by Github.

This addon is inspired by various userscripts that i used to use to make the AO3 experience better:

- [AO3: Kudos/hits ratio](https://greasyfork.org/en/scripts/3144-ao3-kudos-hits-ratio) by `Min`
- [AO3: Estimated reading time](https://greasyfork.org/en/scripts/391940-ao3-estimated-reading-time) by `oulfis`
- [ao3 crossover savior](https://greasyfork.org/en/scripts/13274-ao3-crossover-savior) by `tegan`
