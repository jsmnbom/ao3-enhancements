import Unit from '@/content_script/Unit';

class Logger {
  log = (this.verbose
    ? console.log.bind(window.console, ...this.prefix)
    : () => {
        // ignore
      }) as (...params: unknown[]) => void;

  debug = (this.verbose
    ? console.debug.bind(window.console, ...this.prefix)
    : () => {
        // ignore
      }) as (...params: unknown[]) => void;

  info = console.info.bind(window.console, ...this.prefix) as (
    ...params: unknown[]
  ) => void;
  warn = console.warn.bind(window.console, ...this.prefix) as (
    ...params: unknown[]
  ) => void;
  error = console.error.bind(window.console, ...this.prefix) as (
    ...params: unknown[]
  ) => void;

  constructor(public prefix: string[], public verbose: boolean) {}

  unit<T extends typeof Logger>(
    this: InstanceType<T>,
    unit: InstanceType<typeof Unit>
  ): InstanceType<T> {
    return this.sub(unit.constructor.name);
  }

  sub<T extends typeof Logger>(
    this: InstanceType<T>,
    name: string
  ): InstanceType<T> {
    return new (this.constructor as T)(
      [`${this.prefix[0]}%c %c${name}:`, this.prefix[1], '', 'color: #fff7;'],
      this.verbose
    ) as InstanceType<T>;
  }
}

export default new Logger(['%c[AO3E]', 'color: #fff3;'], true);
