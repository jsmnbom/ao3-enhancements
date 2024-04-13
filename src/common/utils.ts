import type { Tag } from './options.ts'

export function isPrimitive(test: unknown): boolean {
  return ['string', 'number', 'boolean'].includes(typeof test)
}

let cachedToken: string | undefined

export async function fetchAndParseDocument(
  ...args: Parameters<typeof window.fetch>
): Promise<Document> {
  const res = await safeFetch(...args)
  return toDoc(res)
}

export async function safeFetch(
  ...args: Parameters<typeof window.fetch>
): ReturnType<typeof window.fetch> {
  cachedToken = undefined
  const res = await window.fetch(...args)
  if (!res || res.status !== 200)
    throw new Error('Status was not 200 OK')

  return res
}

export async function toDoc(response: Response): Promise<Document> {
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

export function tagListExclude(tagList: Tag[], tag: Tag): Tag[] {
  return tagList.filter((t) => {
    return t.tag !== tag.tag && t.type !== tag.type
  })
}

export function tagListFilter(tagList: Tag[], tag: Tag): Tag[] {
  return tagList.filter((t) => {
    return t.tag === tag.tag && (t.type === tag.type || t.type === 'unknown')
  })
}

export function tagListIncludes(tagList: Tag[], tag: Tag): boolean {
  return tagListFilter(tagList, tag).length > 0
}

export function saveAs(blob: Blob, name: string): void {
  const a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a') as HTMLAnchorElement
  a.download = name
  a.rel = 'noopener'
  a.href = URL.createObjectURL(blob)

  a.click()

  setTimeout(() => URL.revokeObjectURL(a.href), 40 * 1000)
}
