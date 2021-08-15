export function injectDevtoolsIfDevelopmentMode(): void {
  if (process.env.NODE_ENV === 'development') {
    const vueDevToolsTag = document.createElement('script');
    vueDevToolsTag.setAttribute('src', 'https://localhost:8099');
    document.body.appendChild(vueDevToolsTag);
  }
}
