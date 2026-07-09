type CachedFn<T extends unknown[], R> = (...args: T) => Promise<R>

// Nitro auto-imports `defineCachedFunction` in the built server bundle; the plain
// vitest env has no unimport transform, so provide a passthrough shim (no caching,
// so tests always observe fresh mocked data) on globalThis before modules load.
;(globalThis as Record<string, unknown>).defineCachedFunction = <T extends unknown[], R>(
  fn: CachedFn<T, R>,
): CachedFn<T, R> => fn
