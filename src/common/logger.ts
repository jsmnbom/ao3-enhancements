import Unit from '@/content_script/Unit';

type ConsoleFunc = (...params: unknown[]) => void;
type RefBoolean = { value: boolean };

class Logger {
  _verbose: RefBoolean;

  get log(): ConsoleFunc {
    return (this._verbose.value
      ? console.log.bind(window.console, ...this.prefix)
      : () => {
          // ignore
        }) as ConsoleFunc;
  }

  get debug(): ConsoleFunc {
    return (this._verbose.value
      ? console.debug.bind(window.console, ...this.prefix)
      : () => {
          // ignore
        }) as ConsoleFunc;
  }

  debugAlways = console.debug.bind(
    window.console,
    ...this.prefix
  ) as ConsoleFunc;
  info = console.info.bind(window.console, ...this.prefix) as ConsoleFunc;
  warn = console.warn.bind(window.console, ...this.prefix) as ConsoleFunc;
  error = console.error.bind(window.console, ...this.prefix) as ConsoleFunc;

  constructor(public prefix: string[], verbose: boolean | RefBoolean) {
    this._verbose = typeof verbose === 'boolean' ? { value: verbose } : verbose;
  }

  get verbose(): boolean {
    return this._verbose.value;
  }
  set verbose(verbose: boolean) {
    this._verbose.value = verbose;
  }

  unit<T extends typeof Logger>(
    unit: InstanceType<typeof Unit>
  ): InstanceType<T> {
    return this.child(unit.constructor.name);
  }

  child<T extends typeof Logger>(name: string): InstanceType<T> {
    return new (this.constructor as T)(
      [`${this.prefix[0]}%c %c${name}:`, this.prefix[1], '', 'color: #fff7;'],
      this._verbose
    ) as InstanceType<T>;
  }
}

export default new Logger(['%c[AO3E]', 'color: #fff3;'], true);
