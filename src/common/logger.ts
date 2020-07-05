import Unit from '@/content_script/Unit';

type ConsoleFunc = (...params: unknown[]) => void;

class Logger {
  get log(): ConsoleFunc {
    return (this.verbose
      ? console.log.bind(window.console, ...this.prefix)
      : () => {
          // ignore
        }) as ConsoleFunc;
  }

  get debug(): ConsoleFunc {
    return (this.verbose
      ? console.debug.bind(window.console, ...this.prefix)
      : () => {
          // ignore
        }) as ConsoleFunc;
  }

  info = console.info.bind(window.console, ...this.prefix) as ConsoleFunc;
  warn = console.warn.bind(window.console, ...this.prefix) as ConsoleFunc;
  error = console.error.bind(window.console, ...this.prefix) as ConsoleFunc;

  constructor(public prefix: string[], public verbose: boolean) {}

  unit<T extends typeof Logger>(
    unit: InstanceType<typeof Unit>
  ): InstanceType<T> {
    return this.child(unit.constructor.name);
  }

  child<T extends typeof Logger>(name: string): InstanceType<T> {
    return new (this.constructor as T)(
      [`%c${this.prefix[0]}%c %c${name}:`, this.prefix[1], '', 'color: #fff7;'],
      this.verbose
    ) as InstanceType<T>;
  }
}

export default new Logger(['[AO3E]', 'color: #fff3;'], true);
