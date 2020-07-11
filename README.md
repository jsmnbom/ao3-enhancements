# AO3 Enhancements

This is a browser addon which adds various configurable tweaks and enhancements to the fanfiction website [ArchiveOfOurOwn.org](https://archiveofourown.org).

## Installation

- [Install for Firefox][amo] [<img valign="middle" src="https://img.shields.io/amo/v/ao3-enhancements.svg?label=">][amo]
- [Install for Chrome][cws] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/eljennickgdbghppcaenkcinjafmnfoi.svg?label=">][cws]

The Chrome version should also work in Opera (using [this](https://addons.opera.com/en/extensions/details/download-chrome-extension-9/)) and Edge.

### Development builds

There is also [development builds available](https://github.com/jsmnbom/ao3-enhancements/releases).

<details>
<summary>
These builds are not signed, and will therefore have to install them manually (expand this section for info).
</summary>

This can be done two ways:

- Go to about:debugging and choose "Load Temporary Add-on", and select the downloaded file. The addon will be loaded until you restart your browser.
- If you want to install as a regular addon you need Firefox Nightly. On Nightly go to about:config and set "xpinstall.signatures.required" to false. Then go to about:addons and press "Load Add-on from file" and select the downloaded file.

</details>

## Current enhancements/features

- Improves blurb (work) stats:
  - Shows **Reading time** and **Finish reading at**
  - Shows **Kudos/Hits ratio**, making it easier to find the amazing works.
- Adds whole new **Chapter stats** to each chapter
  - Shows **Reading time** and **Finish reading at**
  - Shows **Published date** for each chapter
- Allows **hiding works** when searching/browsing, based on:
  - The language of the work, _and/or_
  - How many fandoms the work is in (is it a crossover?), _and/or_
  - Is it written by certain authors?, _and/or_
  - Does it have certain tags?
- Can **show icons for works you already know about**.
  - Works that you have given kudos to
  - Works that you have subscribed to
  - Works that you have bookmarked
- Various **style customizations**:
  - Adjust the width of a work, making reading on large displays easier
  - Show stats as columns to make them easier to read at a glance
  - Force allignment of work text

Furthermore i strive to make the addon at least as accessible as AO3 itself. Please do report an issue if that is not the case.

Most of these features are disabled by default. After installation go to [ArchiveOfOurOwn.org](https://archiveofourown.org) and click the new menu button _"AO3 Enhancements Options"_ to go to the options screen.

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

First make sure to bump the version number using `npm version VERSION`. Then to make github actions build and ready a dist package for you, simply `git push && git push --tags`. Then go to the created release, download the two files and upload them to AMO.

Alternatively use `npm run build:prod:firefox` (will compile src/ to build/firefox/) and when files have built `npm run start:firefox` to test that everything works. Then use `npm run dist:firefox` to package the extension to a .zip (found at dist/firefox/) file that can then be uploaded on AMO.

<details>
<summary>
Latest AMO is compiled using these software versions.
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
The options page background is CC-BY-4.0 by [Hero Patterns](http://www.heropatterns.com/).

This addon is inspired by various userscripts that i used to use to make the AO3 experience better:

- [AO3: Kudos/hits ratio](https://greasyfork.org/en/scripts/3144-ao3-kudos-hits-ratio) by `Min`
- [AO3: Estimated reading time](https://greasyfork.org/en/scripts/391940-ao3-estimated-reading-time) by `oulfis`
- [ao3 crossover savior](https://greasyfork.org/en/scripts/13274-ao3-crossover-savior) by `tegan`

[amo]: https://addons.mozilla.org/en-US/firefox/addon/ao3-enhancements/ 'Version published on Mozilla Add-ons'
[cws]: https://chrome.google.com/webstore/detail/ao3-enhancements/eljennickgdbghppcaenkcinjafmnfoi 'Version pubished on Chrome Web Store'
