import 'reflect-metadata';

import iconRelURL from '@/icons/icon-128.png';

export * from './cache';
export * from './options';
export * from './listData';
export * from './api';
export { default as logger } from './logger';
import { Tag, User } from './options';

export function isPrimitive(test: unknown): boolean {
  return ['string', 'number', 'boolean'].includes(typeof test);
}

export async function fetchAndParseDocument(
  ...args: Parameters<typeof window.fetch>
): Promise<Document> {
  const res = await safeFetch(...args);
  return toDoc(res);
}

export async function safeFetch(
  ...args: Parameters<typeof window.fetch>
): ReturnType<typeof window.fetch> {
  const res = await window.fetch(...args);
  if (res.status !== 200) {
    throw new Error('Status was not 200 OK');
  }
  return res;
}

export async function toDoc(response: Response): Promise<Document> {
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  return doc;
}

export async function fetchToken(): Promise<string> {
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
