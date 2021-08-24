import PQueue from 'p-queue';
import { jsonEqual } from 'trimerge';

import iconRelURL from '@/icons/icon-128.png';

import { Tag, User } from './options';
import { createLogger } from './logger';

export function isPrimitive(test: unknown): boolean {
  return ['string', 'number', 'boolean'].includes(typeof test);
}

const queueLogger = createLogger('queue');

const queue = new PQueue({
  concurrency: 1,
  // Assuming the production ao3 site uses configuration defaults from
  // https://github.com/otwcode/otwarchive/blob/63ed5aa8387b7593831811e66a2f2c2654bdea15/config/config.yml#L167
  // it allows 300 requests within 5 min. We want to be as gentle
  // as possible, so allow at most requests in that period from the background script.
  // This allows the user's normal requests to hopefully still work properly.
  // TODO: Investigate exactly which requests contribute to the rate limiting
  // and maybe implment a tracker for normal requests by the user. Might be hard
  // since the rate limiting is per IP, tho.
  // interval: 5 * 60 * 1000,
  // intervalCap: 100,
  // However it makes a little more sense to spread the requests out a bit
  // This might make it feel slower, but it will prevent cases where "nothing" happens for almost 5 min
  interval: (5 * 60 * 1000) / 20,
  intervalCap: 100 / 20,
});

queue.on('next', () => {
  queueLogger.log(
    `Task is completed. Size: ${queue.size} Pending: ${queue.pending}`
  );
});

let cachedToken: string | undefined;

export async function fetchAndParseDocument(
  ...args: Parameters<typeof window.fetch>
): Promise<Document> {
  const res = await safeFetch(...args);
  return toDoc(res);
}

export async function safeFetch(
  ...args: Parameters<typeof window.fetch>
): ReturnType<typeof window.fetch> {
  cachedToken = undefined;
  const res = await queue.add(() => window.fetch(...args));
  if (res.status !== 200) {
    throw new Error('Status was not 200 OK');
  }
  return res;
}

export async function toDoc(response: Response): Promise<Document> {
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  cachedToken = doc.querySelector('meta[name="csrf-token"]')?.content;
  return doc;
}

export async function fetchToken(): Promise<string> {
  if (cachedToken !== undefined) {
    const token = cachedToken;
    cachedToken = undefined;
    return token;
  }
  const res = await safeFetch(
    'https://archiveofourown.org/token_dispenser.json'
  );
  const json = (await res.json()) as { token: string };
  return json.token;
}

export async function getIconBlob(): Promise<Blob> {
  const res = await fetch(browser.extension.getURL(iconRelURL));
  return await res.blob();
}

export function getUser(doc: Document): null | User {
  const greetingElement = doc.getElementById('greeting');
  if (greetingElement === null) return null;
  const iconA = greetingElement.querySelector('a')!;
  const username = new URL(iconA.href).pathname.split('/')[2];
  const iconImg = greetingElement.querySelector('img')!;
  const imgSrc = iconImg.src;
  const imgAlt = iconImg.alt;
  return {
    username,
    imgSrc,
    imgAlt,
  };
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function tagListExclude(tagList: Tag[], tag: Tag): Tag[] {
  return tagList.filter((t) => {
    return t.tag !== tag.tag && t.type !== tag.type;
  });
}

export function tagListFilter(tagList: Tag[], tag: Tag): Tag[] {
  return tagList.filter((t) => {
    return t.tag === tag.tag && (t.type === tag.type || t.type === 'unknown');
  });
}

export function tagListIncludes(tagList: Tag[], tag: Tag): boolean {
  return tagListFilter(tagList, tag).length > 0;
}

export function setDifference<A extends unknown, T extends Set<A>>(
  setA: T,
  setB: T
): T {
  const _difference = new Set(setA);
  for (const elem of setB) {
    _difference.delete(elem);
  }
  return _difference as T;
}

export function objectMapEqual<K, V>(
  map1: Map<K, V>,
  map2: Map<K, V>
): boolean {
  if (!map1 || !map2) return false;
  const array1 = Array.from(map1.entries());
  const array2 = Array.from(map2.entries());
  return (
    array1.length === array2.length &&
    array1.every(([k1, v1]) => jsonEqual(map2.get(k1), v1))
  );
}
