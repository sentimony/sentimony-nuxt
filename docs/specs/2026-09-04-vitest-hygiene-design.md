# Vitest hygiene: спільний Nitro-mock хелпер, центральний restore, include наперед

**Дата:** 2026-09-04
**Статус:** Design
**Скоуп:** `tests/setup/nitroMocks.ts` (новий), `tests/setup/nitro-globals.ts`, `vitest.config.ts`, 7 handler-тестів із `globalThis`-моками, 9 файлів із ручним `vi.restoreAllMocks()`, `AGENTS.md`
**Джерело:** [аудит Vitest 2026-09-04](../audits/2026-09-04-vitest-audit.md) (VITEST-10, VITEST-11, VITEST-12)
**Ініціатива:** [component-testing-and-coverage](../initiatives/component-testing-and-coverage.md)

## Проблема

Сім handler-тестів ставлять Nitro auto-imports (`defineEventHandler`,
`defineCachedEventHandler`, `catalogCacheOptions`, `createError`,
`isSupabaseCatalogSource`, `useSupabase`, `supabaseAdmin`, `fetchFirebase*`,
`useRuntimeConfig`, …) на `globalThis` кожен по-своєму, з власним списком
ключів у `afterEach`. Cleanup працює (shuffle чистий), але кожен новий тест
копіює 15–25 рядків, а мок `defineEventHandler` повертає функцію з
сигнатурою, яку тести не дотримують (TS-6). Політика reset моків живе в
дев'яти ручних `vi.restoreAllMocks()`, а не в конфізі. `include` не бачить
`tests/nuxt/**`, яку `.nuxt/tsconfig.app.json` уже типізує.

## Рішення

### 1. `tests/setup/nitroMocks.ts`

```ts
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
```

- Файл живе поруч із `nitro-globals.ts`, а не в `setupFiles`: глобали
  ставляться тільки в тестах, які їх просять, і знімаються їхнім `restore()`.
- `overrides` приймає той самий словник, що тести ставили руками, тож
  міграція — заміна блоку `beforeEach` на
  `restore = installNitroGlobals({ isSupabaseCatalogSource: () => false, … })`
  і `afterEach(() => restore())`. `vi.resetModules()` лишається там, де був.
- `fakeEvent()` закриває TS2554 у `releasesApi.test.ts` (спека TypeScript).

### 2. `restoreMocks: true`

`vitest.config.ts` отримує `test.restoreMocks: true`; дев'ять ручних
`vi.restoreAllMocks()` видаляються. Глобали це не чіпає — їх знімає
`restore()` хелпера. Доказ: звичайний прогін + shuffle із тим самим seed
`20260904`, обидва зелені.

`clearMocks`/`mockReset` не вмикаються: єдиний файл із `vi.mock` покладається
на реалізацію мока між тестами.

### 3. `include` наперед

`include: ['tests/unit/**/*.test.ts', 'tests/nuxt/**/*.test.ts']`. Порожній
glob нешкідливий, а перший компонентний тест не опиниться типізованим, але
не запущеним.

## Не входить

- `@nuxt/test-utils`, `happy-dom`, `@vitest/coverage-v8` — нові залежності,
  заблоковані до `chore(deps)` власника (VITEST-7).
- Порада Vitest 5 про `isolate: false` — не застосовується: файли мутують
  `globalThis`.

## Перевірка

`npm run test:unit` і `node_modules/.bin/vitest run --sequence.shuffle --sequence.seed=20260904`
зелені; `npm run typecheck:tests` зелений (хелпер типізований у тестовій
програмі); `npm run docs:check`.

## Наступний крок

План: [`docs/plans/2026-09-04-vitest-hygiene.md`](../plans/2026-09-04-vitest-hygiene.md).
