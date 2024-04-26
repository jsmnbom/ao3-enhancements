/**
 * Enum of the tag types that AO3 supports (except "Media" and "Banned" which are not shown on works)
 * @see https://archiveofourown.org/faq/tags#tagtypes
 * @see https://github.com/otwcode/otwarchive/blob/bd57a26224017d4b871fb70a9787d7fe3c29d249/app/models/tag.rb#L15
 *
 * The values are abbreviated to save space in browser.storage
 */
export enum TagType {
  Rating = 'r',
  ArchiveWarning = 'w',
  Category = 'c',
  Fandom = 'f',
  Relationship = 'R',
  Character = 'C',
  Freeform = 'F',
}

// eslint-disable-next-line ts/no-namespace
export declare namespace TagType {
  export function values(): TagType[]
  export function toDisplayString(type: TagType): string
  export function toCSSClass(type: TagType): string
}

Object.defineProperties(TagType, {
  values: {
    enumerable: false,
    value() {
      return Object.values(TagType) as TagType[]
    },
  },
  toDisplayString: {
    enumerable: false,
    value(type: TagType) {
      switch (type) {
        case TagType.Rating: return 'Rating'
        case TagType.ArchiveWarning: return 'Archive Warning'
        case TagType.Category: return 'Category'
        case TagType.Fandom: return 'Fandom'
        case TagType.Relationship: return 'Relationship'
        case TagType.Character: return 'Character'
        case TagType.Freeform: return 'Additional Tags'
      }
    },
  },
  toCSSClass: {
    enumerable: false,
    value(type: TagType) {
      switch (type) {
        // Special cases that are not in ul.tags
        case TagType.Rating: return 'rating'
        case TagType.Category: return 'category'
        // All other cases
        case TagType.ArchiveWarning: return 'warnings'
        case TagType.Fandom: return 'fandoms'
        case TagType.Relationship: return 'relationships'
        case TagType.Character: return 'characters'
        case TagType.Freeform: return 'freeforms'
      }
    },
  },
})

/**
 * Represents a tag on AO3
 */
export interface Tag {
  /** Pretty name of the tag */
  name: string
  /** The type of the tag - might be empty if we were not able to resolve the type. */
  type?: TagType
}

/**
 * URL->Pretty
 * @see https://github.com/otwcode/otwarchive/blob/bd57a26224017d4b871fb70a9787d7fe3c29d249/app/models/tag.rb#L567-L574
 */
const TAG_NAME_SUBSTITUTIONS: Record<string, string> = {
  '*s*': '/',
  '*a*': '&',
  '*d*': '.',
  '*q*': '?',
  '*h*': '#',
}

/**
 * Takes a either a full URL or a tag name with url substitutions and returns the tag name from it
 */
export function tagNameFromURL(url: string): string {
  const raw = url.includes('/tags/') ? url.split('/tags/')[1] : url
  return Object.entries(TAG_NAME_SUBSTITUTIONS).reduce((acc, [from, to]) => acc.replaceAll(from, to), raw)
}

/**
 * Takes a tag name and returns a URL path for it
 */
export function tagURLPathFromName(name: string): string {
  return Object.entries(TAG_NAME_SUBSTITUTIONS).reduce((acc, [from, to]) => acc.replaceAll(to, from), name)
}

/**
 * Represents a language on AO3
 *
 * @see https://archiveofourown.org/languages
 */
export interface Language {
  value: string
  label: string
}

/* Represents an author on AO3 */
export interface Author {
  /* Author user id, /users/:user_id/ */
  userId: string
  /* Author pseud or undefined to match all */
  psued?: string
}

/**
 * Represents a user on AO3
 * Only used for constructing links
 */
export interface User {
  userId: string
}

export interface TagFilter {
  /** Value of the filter. Will be Tag.name if matcher === exact */
  name: string
  /** Type of the tag. If not provided, the filter will match all types. */
  type?: TagType
  /** How to match */
  matcher: 'exact' | 'contains' | 'regex'
  /** If true, the filter will be inverted - excluding rather than including from the hide list - therefore force-showing. */
  invert?: boolean
}

export interface AuthorFilter {
  /** Value of the filter. */
  userId: string
  /** Value of the filter. */
  pseud?: string
  /** If true, the filter will be inverted - excluding rather than including from the hide list - therefore force-showing. */
  invert?: boolean
}
