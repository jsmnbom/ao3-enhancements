import { options } from '#common'

import type { User } from './data.ts'

const DEFAULT_BASE_URL = 'https://archiveofourown.org'

export function getArchiveLink(path: string): string {
  const base = process.env.CONTEXT === 'content_script' ? document.baseURI : DEFAULT_BASE_URL
  return new URL(path, base).href
}

export function parseUser(doc: Document): User | undefined {
  const header = doc.getElementById('header')
  // Find the link to preferences to make sure we don't accidentally grab /users/logout or a completely wrong user
  const userLink = header?.querySelector('a[href^="/users/" i][href$="/preferences" i]')
  const userId = userLink?.href.match(/\/users\/(.+?)\/preferences/i)?.[1]
  if (userId)
    return { userId }
}

export function isPrimitive(test: unknown): boolean {
  return ['string', 'number', 'boolean'].includes(typeof test)
}

let cachedToken: string | undefined

export async function fetchAndParseDocument(
  ...args: Parameters<typeof globalThis.fetch>
): Promise<Document> {
  const res = await safeFetch(...args)
  return parseDocument(res)
}

export async function safeFetch(
  ...args: Parameters<typeof globalThis.fetch>
): ReturnType<typeof globalThis.fetch> {
  cachedToken = undefined
  const res = await globalThis.fetch(...args)
  if (!res || res.status !== 200)
    throw new Error('Status was not 200 OK')

  return res
}

export async function parseDocument(response: Response): Promise<Document> {
  const text = await response.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(text, 'text/html')
  cachedToken = doc.querySelector('meta[name="csrf-token"]')?.content
  return doc
}

export async function fetchToken(): Promise<string> {
  if (cachedToken !== undefined) {
    const token = cachedToken
    cachedToken = undefined
    return token
  }
  const res = await safeFetch(
    'https://archiveofourown.org/token_dispenser.json',
  )
  const json = (await res.json()) as { token: string }
  return json.token
}

export function saveAs(blob: Blob, name: string): void {
  const a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a') as HTMLAnchorElement
  a.download = name
  a.rel = 'noopener'
  a.href = URL.createObjectURL(blob)

  a.click()

  setTimeout(() => URL.revokeObjectURL(a.href), 40 * 1000)
}
