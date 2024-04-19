import { getProperty, setProperty } from 'dot-prop'
import type { Get } from 'type-fest'
import type { WritableComputedRef } from 'vue'

export function writableToRef<const TObject extends Record<string, any>, const TPath extends string>(object: TObject, path: TPath): WritableComputedRef<Get<TObject, TPath>> {
  type TValue = Get<TObject, TPath>

  return computed<TValue>({
    get: () => getProperty(object, path) as TValue,
    set: (value: TValue) => setProperty(object, path, value),
  })
}

const test = {
  foo: {
    bar: 5,
  },
}

const ref = writableToRef(test, 'foo.bar')
