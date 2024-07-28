# AO3 Enhancements

This is a browser addon which adds various configurable tweaks and enhancements to the fanfiction website [ArchiveOfOurOwn.org](https://archiveofourown.org).

## Installation

- [Install for Firefox][amo] [<img valign="middle" src="https://img.shields.io/amo/v/ao3-enhancements.svg?label=">][amo]
- [Install for Chrome][cws] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/eljennickgdbghppcaenkcinjafmnfoi.svg?label=">][cws]

The Chrome version should also work in Opera (using [this](https://addons.opera.com/en/extensions/details/download-chrome-extension-9/)) and Edge, although this has not been tested.

### Development builds

There is also [development builds available](https://github.com/jsmnbom/ao3-enhancements/releases). See [Installing pre-releases](https://github.com/jsmnbom/ao3-enhancements/wiki/Installing-prereleases) on how to install them.

## Current enhancements/features (as of v0.6.0)

- Improves blurb (work) stats
  - Shows **Reading time** and **Finish reading at**
  - Shows **Kudos/Hits ratio**, making it easier to find the amazing works
- Adds whole new **Chapter stats** to each chapter
  - Shows **Reading time** and **Finish reading at**
  - Shows **Published date** for each chapter
- Allows **hiding works** when searching/browsing using filters such as:
  - The language of the work, _and/or_
  - How many fandoms the work is in (is it a crossover?), _and/or_
  - The works author and pseud, _and/or_
  - The works' tags (optionally using regular expressions, or contrained to a single tag type)
- Various **style customizations**:
  - Adjust the width of a work, making reading on large displays easier
  - Show stats as columns to make them easier to read at a glance
  - Force alignment of work text

Furthermore I strive to make the addon at least as accessible as AO3 itself. Please do report an issue if that is not the case.

Most of these features are disabled by default. After installation go to [ArchiveOfOurOwn.org](https://archiveofourown.org) and click the new menu button _"AO3 Enhancements Options"_ to go to the options screen.

## Screenshots

See the entry on [AMO](https://addons.mozilla.org/en-US/firefox/addon/ao3-enhancements/) for screenshots.

## Developing

<details>
<summary>
Expand this section for instructions on how to build the addon yourself
</summary>

Start by installing the required packages by `pnpm install`. Then continue to either development or releasing below depending on what you want to do.

### Development

Use `pnpm run server:dev:firefox` (will compile src/ to build/firefox/ and keep watching source files) and then when files have built `pnpm run start:firefox` (will launch firefox-developer-edition with the built extension and reload when the built files change - most of the time, pressing R may be required).

### Releasing

First make sure to bump the version number using `pnpm version VERSION`. The version number in `package.json` will be updated and a git tag will be created. The version number should somewhat follow semver for major.minor.patch. To create a pre-release version, add a dash and a pre-release identifier (e.g. `1.2.3-beta.1`). Only beta versions are supported for now. The beta version will be listed as `x.x.x.PRERELEASE_IDENTIFIER`. This necessitates bumping the minor version number when releasing a stable version.

Then to make github actions build and ready a dist package for you, simply `git push && git push --tags`. Then go to the created release, download the two files and upload them to AMO.

Alternatively use `pnpm run build:prod:firefox` (will compile src/ to build/firefox/) and when files have built `pnpm run start:firefox` to test that everything works. Then use `pnpm run dist:firefox` to package the extension to a .zip (found at dist/firefox/) file that can then be uploaded on AMO.

## Thanks to

The icon is a combination of the AO3 logo (svg version from IconFinder), and the Gear icon from the Octicons pack by Github.
The options page background is CC-BY-4.0 by [Hero Patterns](http://www.heropatterns.com/).

This addon is inspired by various userscripts that i used to use to make the AO3 experience better:

- [AO3: Kudos/hits ratio](https://greasyfork.org/en/scripts/3144-ao3-kudos-hits-ratio) by `Min`
- [AO3: Estimated reading time](https://greasyfork.org/en/scripts/391940-ao3-estimated-reading-time) by `oulfis`
- [ao3 crossover savior](https://greasyfork.org/en/scripts/13274-ao3-crossover-savior) by `tegan`

[amo]: https://addons.mozilla.org/en-US/firefox/addon/ao3-enhancements/ 'Version published on Mozilla Add-ons'
[cws]: https://chrome.google.com/webstore/detail/ao3-enhancements/eljennickgdbghppcaenkcinjafmnfoi 'Version pubished on Chrome Web Store'
