declare module 'lzma/src/lzma_worker-min.js' {
  interface TLZMA {
    compress(data: string, level: number): Uint8Array;
    decompress(data: Uint8Array): string;
  }
  const LZMA: TLZMA;
  export { LZMA };
}
