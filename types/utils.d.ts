type KeyOf<
  U,
  C = unknown,
  K extends U extends unknown ? keyof U : never = U extends unknown
    ? keyof U
    : never
> = C extends unknown
  ? U extends unknown
    ? K extends unknown
      ? U[K] extends C
        ? K
        : never
      : never
    : never
  : never;

type ValueOf<U, K extends KeyOf<U> = KeyOf<U>> = U extends unknown
  ? K extends keyof U
    ? U[K]
    : never
  : never;

type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> &
      Partial<Record<Exclude<Keys, K>, undefined>>;
  }[Keys];
