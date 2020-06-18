export * from './cache';
export * from './options';

const logPrefix = '[AO3 Enhancements]';

export const log = console.log.bind(window.console, logPrefix);

export const error = console.error.bind(window.console, logPrefix);

export const groupCollapsed = console.groupCollapsed.bind(
  window.console,
  logPrefix
);

export const groupEnd = console.groupEnd.bind(window.console, logPrefix);

export function isPrimitive(test: unknown): boolean {
  return ['string', 'number', 'boolean'].includes(typeof test);
}
