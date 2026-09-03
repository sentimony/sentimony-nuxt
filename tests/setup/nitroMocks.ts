import type { H3Event } from 'h3'

type Globals = Record<string, unknown>

const defaults: Globals = {
  defineEventHandler: (handler: unknown) => handler,
  defineCachedEventHandler: (handler: unknown) => handler,
  catalogCacheOptions: () => ({}),
  createError: (input: { statusMessage?: string }) => new Error(input.statusMessage ?? 'Error'),
}

// Installs Nitro auto-imports on globalThis for handler tests. Defaults are
// passthroughs; pass overrides for the backend under test. Returns a restore
// that removes every key it set, so files stay isolated under shuffle.
export function installNitroGlobals(overrides: Globals = {}) {
  const entries = { ...defaults, ...overrides }
  const target = globalThis as Globals
  const previous = new Map<string, unknown>()
  for (const [key, value] of Object.entries(entries)) {
    previous.set(key, target[key])
    target[key] = value
  }
  return () => {
    for (const [key, value] of previous) {
      if (value === undefined) delete target[key]
      else target[key] = value
    }
  }
}

// Handlers are typed by Nitro's real defineEventHandler; the passthrough mock
// still needs an event argument at the call site.
export const fakeEvent = () => ({}) as unknown as H3Event
