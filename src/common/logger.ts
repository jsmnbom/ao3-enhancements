import type { Unit } from './Unit.js'

type ConsoleFunc = (...args: unknown[]) => void
interface RefBoolean { value: boolean }

export class BaseLogger {
  _verbose: RefBoolean
  debugAlways: ConsoleFunc
  info: ConsoleFunc
  warn: ConsoleFunc
  error: ConsoleFunc

  get log(): ConsoleFunc {
    return (
      this._verbose.value
        ? console.log.bind(window.console, ...this.prefix)
        : () => { /* ignore */ }
    ) as ConsoleFunc
  }

  get debug(): ConsoleFunc {
    return (
      this._verbose.value
        ? console.debug.bind(window.console, ...this.prefix)
        : () => { /* ignore */ }
    ) as ConsoleFunc
  }

  constructor(public prefix: string[], verbose: boolean | RefBoolean) {
    this._verbose = typeof verbose === 'boolean' ? { value: verbose } : verbose

    this.debugAlways = console.debug.bind(
      window.console,
      ...this.prefix,
    ) as ConsoleFunc

    this.info = console.info.bind(window.console, ...this.prefix) as ConsoleFunc
    this.warn = console.warn.bind(window.console, ...this.prefix) as ConsoleFunc
    this.error = console.error.bind(window.console, ...this.prefix) as ConsoleFunc
  }

  get verbose(): boolean {
    return this._verbose.value
  }

  set verbose(verbose: boolean) {
    this._verbose.value = verbose
  }

  unit<T extends typeof BaseLogger>(
    unit: InstanceType<typeof Unit>,
  ): InstanceType<T> {
    return this.child(unit.constructor.name)
  }

  child<T extends typeof BaseLogger>(name: string): InstanceType<T> {
    return new (this.constructor as T)(
      [`${this.prefix[0]}%c %c[${name}]`, this.prefix[1], '', 'color: #fff7;'],
      this._verbose,
    ) as InstanceType<T>
  }
}

export const logger = new BaseLogger(['%c[AO3E]', 'color: #fff3;'], true)
export function createLogger(...args: Parameters<BaseLogger['child']>): ReturnType<BaseLogger['child']> {
  return logger.child(...args)
}
