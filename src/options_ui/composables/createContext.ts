import { type InjectionKey, inject, provide } from 'vue'

/**
 * @param contextName The description for injection key symbol.
 */
/* @__NO_SIDE_EFFECTS__ */
export function createContext<ContextValue>(
  contextName: string,
) {
  const injectionKey: InjectionKey<ContextValue | null> = Symbol(contextName)

  return {
    inject<T extends ContextValue | null | undefined = ContextValue>(fallback?: T): T extends null ? ContextValue | null : ContextValue {
      const context = inject(injectionKey, fallback)
      if (context)
        return context

      if (context === null)
        return null as T extends null ? ContextValue | null : ContextValue

      throw new Error(`Injection \`${injectionKey.toString()}\` not found!`)
    },
    provide(contextValue: ContextValue) {
      provide(injectionKey, contextValue)
      return contextValue
    },
  }
}
