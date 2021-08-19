export function injectDevtoolsIfDevelopmentMode(): void {
  if (process.env.NODE_ENV === 'development') {
    const vueDevToolsTag = document.createElement('script');
    vueDevToolsTag.setAttribute('src', 'http://localhost:8098');
    document.body.appendChild(vueDevToolsTag);
  }
}
