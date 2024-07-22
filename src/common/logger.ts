type ConsoleFunc = (...args: unknown[]) => void

const C = window.console

export class Logger {
  static verbose = true

  constructor(public prefix: string[]) {}

  get log(): ConsoleFunc { return (Logger.verbose ? C.log.bind(C, ...this.prefix) : () => { /* ignore */ }) }
  get debug(): ConsoleFunc { return (Logger.verbose ? C.debug.bind(C, ...this.prefix) : () => { /* ignore */ }) }
  get info(): ConsoleFunc { return C.info.bind(C, ...this.prefix) }
  get warn(): ConsoleFunc { return C.warn.bind(C, ...this.prefix) }
  get error(): ConsoleFunc { return C.error.bind(C, ...this.prefix) }

  child(name: string, formatting = 'color: #fff7;'): Logger {
    return new Logger([`${this.prefix[0]}%c %c${name}`, ...this.prefix.slice(1), '', formatting])
  }
}

export const logger = new Logger(['%c[AO3E]', 'color: #fff3;'])
export function createLogger(...args: Parameters<Logger['child']>): ReturnType<Logger['child']> {
  return logger.child(...args)
}

void browser.storage.local.get('option.verbose').then((value) => {
  Logger.verbose = (value['option.verbose'] as boolean | undefined) ?? false
})
