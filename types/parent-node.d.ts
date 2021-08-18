export {};

// https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/985
declare global {
  interface ParentNode {
    replaceChildren(...nodes: (Node | string)[]): void;
  }
}
