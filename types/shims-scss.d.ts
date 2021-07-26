declare module '*.scss' {
  interface CSS {
    toString(): string;
  }
  const css: CSS;
  export default css;
}
declare module '*.css?raw' {
  interface CSS {
    toString(): string;
  }
  const css: CSS;
  export default css;
}
