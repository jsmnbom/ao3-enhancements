declare module 'dom-chef' {
  type ElementFunction = () => '';
  export function h<
    N extends KeyOf<HTMLElementTagNameMap>,
    A = Partial<HTMLElementTagNameMap[N]>
  >(type: N, attributes?: A, ...children: Node[]): 'hi';
}
