import { LocalsObject } from 'pug';

declare module '*.pug' {
  export default function template(locals?: LocalsObject): string;
}
