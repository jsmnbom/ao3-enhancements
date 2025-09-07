declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BROWSER: 'chrome' | 'firefox'
      NODE_ENV: 'development' | 'production'
    }
  }
}

export {}
