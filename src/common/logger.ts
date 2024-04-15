type ConsoleFunc = (...args: unknown[]) => void

export class Logger {
  static verbose = true

  constructor(public prefix: string[]) {}

  get log(): ConsoleFunc { return (Logger.verbose ? console.log.bind(window.console, ...this.prefix) : () => { /* ignore */ }) }
  get debug(): ConsoleFunc { return (Logger.verbose ? console.debug.bind(window.console, ...this.prefix) : () => { /* ignore */ }) }
  get info(): ConsoleFunc { return console.info.bind(window.console, ...this.prefix) }
  get warn(): ConsoleFunc { return console.warn.bind(window.console, ...this.prefix) }
  get error(): ConsoleFunc { return console.error.bind(window.console, ...this.prefix) }

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
