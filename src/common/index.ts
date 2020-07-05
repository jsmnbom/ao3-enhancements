export * from './cache';
export * from './options';
export { default as logger } from './logger';

import { User } from './options';

export function isPrimitive(test: unknown): boolean {
  return ['string', 'number', 'boolean'].includes(typeof test);
}

export async function fetchAndParseDocument(url: string): Promise<Document> {
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  return parser.parseFromString(text, 'text/html');
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
