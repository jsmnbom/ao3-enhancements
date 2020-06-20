declare module '*.pug' {
  import { LocalsObject } from 'pug';
  export default function template(locals?: LocalsObject): string;
}
