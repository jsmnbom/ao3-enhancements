import { dirname, extname } from 'node:path'
import { parse } from 'semver'
import { $ } from 'zx'

import pJson from '../package.json' with { type: 'json' }

const parsed = parse(pJson.version)

if (!parsed) {
  console.error(`Invalid version in package.json`)
  process.exit(1)
}

await webExtDist('firefox')
await webExtDist('chrome')
await gitArchive()

async function webExtDist(browser: 'firefox' | 'chrome') {
  const raw = await webExtBuild(`scripts/web-ext.${browser}.mjs`)
  await $`mv ${raw} ${dirname(raw)}/ao3-enhancements_${browser}_${parsed?.version}${extname(raw)}`
}

async function webExtBuild(config: string) {
  const output = await $`web-ext --config=${config} build`.text()
  console.log(output)
  const fileOutput = /Your web extension is ready: (.+)/.exec(output)?.[1]
  if (!fileOutput) {
    console.error('Failed to build web extension')
    process.exit(1)
  }
  return fileOutput
}

async function gitArchive() {
  await $`mkdir -p dist/artifacts/source`
  await $`git archive --format=zip --output=dist/artifacts/source/ao3-enhancements_source_${parsed?.version}.zip HEAD`
}
