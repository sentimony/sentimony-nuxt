# Server-Route Tests for `/api/likes/*` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Покрити юніт-тестами всі чотири release-likes server endpoint-и (`/api/likes` GET, POST; `/api/likes/[slug]` DELETE; `/api/likes/count/[slug]` GET) з мок-Supabase, щоб мати baseline-safety-net перед майбутньою міграцією на `defineLikesHandler`-фабрику (пункт 22 беклогу).

**Architecture:** Юніт-тести handler-функцій (без запуску Nitro). Імпортуємо `default`-експорт handler-а як function, викликаємо з фейковим h3-event-об'єктом. `serverSupabaseUser` (з `#supabase/server`), `supabaseAdmin()` (з `server/utils/supabaseAdmin`) і три h3-утиліти (`getRouterParam`, `readBody`, `createError`) мокаються через `vi.mock`. Supabase chainable API (`from().select().eq()...`) симулюється hand-rolled chain mock-ом, де всі методи повертають `this` і об'єкт-thenable резолвиться у задане значення.

**Tech Stack:** Vitest 3.x · @nuxt/test-utils 3.x · Nuxt 4 server (Nitro/h3) · Supabase JS client (mock) · TypeScript.

---

## Context для виконавця

**Передумова:** План `2026-05-01-vitest-setup.md` уже виконано. Vitest сконфігурований, `tests/setup.ts` і `tests/utils/withSetup.ts` існують, `npm test` прогонить sanity-тести з `tests/composables/useLikes.spec.ts` зеленими. Якщо це не так — спочатку виконати step 1.

**Endpoint-и, що покриваємо:**

| Файл | Метод | Auth | Поведінка |
|---|---|---|---|
| `server/api/likes.get.ts` | GET | гість → `[]`, auth → масив slug-ів | без auth — повертає `[]` (НЕ 401, навмисно). |
| `server/api/likes.post.ts` | POST | required | upsert у `release_likes` з `onConflict: 'user_id,release_slug', ignoreDuplicates: true`. 401/400/500. |
| `server/api/likes/[slug].delete.ts` | DELETE | required | delete у `release_likes` за парою (user_id, release_slug). 401/400/500. |
| `server/api/likes/count/[slug].get.ts` | GET | публічний | `select count head` для slug. 400/500. |

**Чому unit-тести, а не integration через `setup({ server: true })`:**
- Швидше: ~50ms per test замість ~5s startup для Nitro.
- Простіше: один mock-stack замість HTTP-стека + cookies + Nitro lifecycle.
- Достатньо: вся логіка handler-а — це 10–18 рядків auth-guard + Supabase-call + error mapping. Інтеграційний шар (роутинг, cookies) — не наша відповідальність, він протестований у Nitro/Nuxt самих.
- Якщо в майбутньому буде потреба перевірити роутинг/cookies — додамо інтеграційний smoke-тест окремо. Зараз це YAGNI.

**Mock-стратегія:**

1. `serverSupabaseUser(event)` — мок повертає `{ id: 'user-1' }` або `null`.
2. `supabaseAdmin()` — мок повертає chainable-об'єкт (helper `createSupabaseChainMock`), де всі методи (`from`, `select`, `eq`, `in`, `range`, `order`, `insert`, `upsert`, `delete`) — це `vi.fn().mockReturnThis()`, а сам chain — thenable, що резолвиться у задану відповідь `{ data, error, count }`.
3. `getRouterParam(event, name)` — мок читає з `event.context.params[name]`.
4. `readBody(event)` — мок повертає `event._body`.
5. `createError({ statusCode, statusMessage })` — мок кидає звичайний Error з `.statusCode` і `.statusMessage` як properties (для перевірки в тестах через `expect.toThrow` + perевірку `.statusCode`).

**Чому helper `createSupabaseChainMock` критичний:**
Supabase JS client має chainable fluent API:
```ts
supabaseAdmin().from('release_likes').select('release_slug').eq('user_id', userId)
```
Mock має толерувати будь-який ланцюжок. Тому: усі методи `mockReturnThis()`, а thenable виконує final result. Це дозволяє тестам перевіряти **аргументи ланцюжка** (`expect(supabase.from).toHaveBeenCalledWith('release_likes')`), не сповільнюючи себе деталями типу «select повертає окремий PostgrestFilterBuilder».

**Що НЕ покриваємо цим планом:**
- Аналогічні endpoint-и для artist/track/event/playlist/video — копіювання шаблону тривіальне після того, як цей зеленіє.
- Інтеграційні тести через HTTP.
- Тести для `release_likes` schema/RLS у Supabase — це responsibility міграцій, не handler-ів.

---

## File Structure

**Create:**
- `tests/utils/supabaseChainMock.ts` — chain-mock factory.
- `tests/utils/createMockEvent.ts` — h3 event factory.
- `tests/server/api/likes.spec.ts` — 9 тестів на 4 endpoint-и (один файл, чотири `describe`-блоки).

**Modify:**
- `tests/setup.ts` — додати глобальний mock для `createError` (якщо вийде, що auto-import у тест-середовищі його не дає).

**Не змінюємо:**
- Жоден код в `server/` — тільки тести.
- `app/` — взагалі не торкаємось.
- `tsconfig.json` — Nuxt сам додає типи.

---

## Task 1: Створити Supabase chain-mock helper

**Files:**
- Create: `tests/utils/supabaseChainMock.ts`

- [ ] **Step 1: Створити файл**

`tests/utils/supabaseChainMock.ts`:
```ts
import { vi, type Mock } from 'vitest'

export type SupabaseResult = {
  data?: unknown
  error?: { message: string } | null
  count?: number | null
}

export type SupabaseChainMock = {
  from: Mock
  select: Mock
  eq: Mock
  in: Mock
  range: Mock
  order: Mock
  insert: Mock
  upsert: Mock
  delete: Mock
  then: (resolve: (value: SupabaseResult) => void) => void
}

export function createSupabaseChainMock(result: SupabaseResult = { data: [], error: null }): SupabaseChainMock {
  const chain = {} as SupabaseChainMock
  const methods: Array<keyof SupabaseChainMock> = ['from', 'select', 'eq', 'in', 'range', 'order', 'insert', 'upsert', 'delete']
  methods.forEach((m) => {
    chain[m] = vi.fn(() => chain) as Mock
  })
  chain.then = (resolve) => {
    Promise.resolve(result).then(resolve)
  }
  return chain
}
```

Як працює: всі chain-методи повертають `this` (`chain`), а `then`-метод робить chain thenable — JS-`await` побачить його як Promise і резолвить у `result`. Тому `await supabase.from('x').select('y').eq('a', 'b')` поверне `{ data, error, count }`.

- [ ] **Step 2: Тип-чек**

Run: `npx vue-tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add tests/utils/supabaseChainMock.ts
git commit -m "test(server): add supabase chain mock helper"
```

---

## Task 2: Створити h3 event-mock helper

**Files:**
- Create: `tests/utils/createMockEvent.ts`

- [ ] **Step 1: Створити файл**

`tests/utils/createMockEvent.ts`:
```ts
export type MockEvent = {
  context: { params: Record<string, string> }
  _body: unknown
  _query: Record<string, string>
  node: { req: object, res: object }
}

export function createMockEvent(opts: {
  params?: Record<string, string>
  body?: unknown
  query?: Record<string, string>
} = {}): MockEvent {
  return {
    context: { params: opts.params ?? {} },
    _body: opts.body ?? null,
    _query: opts.query ?? {},
    node: { req: {}, res: {} },
  }
}
```

Цей event сумісний з нашими mock-обгортками `getRouterParam`/`readBody`/`getQuery`, які ми додамо в Task 3 і будуть читати з `event.context.params`/`event._body`/`event._query`.

- [ ] **Step 2: Тип-чек**

Run: `npx vue-tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add tests/utils/createMockEvent.ts
git commit -m "test(server): add h3 mock event factory"
```

---

## Task 3: Bootstrap `tests/server/api/likes.spec.ts` + перший тест GET happy

**Files:**
- Create: `tests/server/api/likes.spec.ts`

- [ ] **Step 1: Створити файл з шапкою моків і першим тестом**

`tests/server/api/likes.spec.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createSupabaseChainMock, type SupabaseChainMock } from '../../utils/supabaseChainMock'
import { createMockEvent } from '../../utils/createMockEvent'

const supabaseUserMock = vi.fn()
vi.mock('#supabase/server', () => ({
  serverSupabaseUser: (...args: unknown[]) => supabaseUserMock(...args),
}))

let supabaseClient: SupabaseChainMock = createSupabaseChainMock()
const supabaseAdminMock = vi.fn(() => supabaseClient)
vi.mock('~~/server/utils/supabaseAdmin', () => ({
  supabaseAdmin: () => supabaseAdminMock(),
}))

vi.mock('h3', async () => {
  const actual = await vi.importActual<typeof import('h3')>('h3')
  return {
    ...actual,
    getRouterParam: (event: { context: { params: Record<string, string> } }, name: string) =>
      event.context.params[name],
    readBody: async (event: { _body: unknown }) => event._body,
    getQuery: (event: { _query: Record<string, string> }) => event._query,
    createError: (opts: { statusCode: number, statusMessage: string }) => {
      const err = new Error(opts.statusMessage) as Error & { statusCode?: number, statusMessage?: string }
      err.statusCode = opts.statusCode
      err.statusMessage = opts.statusMessage
      return err
    },
  }
})

describe('GET /api/likes', () => {
  beforeEach(() => {
    supabaseUserMock.mockReset()
    supabaseAdminMock.mockClear()
  })

  it('повертає масив release_slug для залогіненого юзера', async () => {
    supabaseUserMock.mockResolvedValue({ id: 'user-1' })
    supabaseClient = createSupabaseChainMock({
      data: [{ release_slug: 'rel-a' }, { release_slug: 'rel-b' }],
      error: null,
    })

    const handler = (await import('~~/server/api/likes.get')).default
    const result = await handler(createMockEvent() as never)

    expect(result).toEqual(['rel-a', 'rel-b'])
    expect(supabaseClient.from).toHaveBeenCalledWith('release_likes')
    expect(supabaseClient.select).toHaveBeenCalledWith('release_slug')
    expect(supabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-1')
  })
})
```

Зверни увагу:
- `vi.mock(...)` — на топ-рівні; vitest hoist-ить його перед усіма імпортами. Тому динамічний `await import(...)` всередині `it` отримає ВЖЕ замоковані залежності.
- `~~/server/utils/supabaseAdmin` — Nuxt-alias на корінь, працює завдяки `nuxt`-environment у Vitest. Якщо resolve не виходить — fallback `../../../server/utils/supabaseAdmin` (relative).
- `~~/server/api/likes.get` — той самий Nuxt-alias. Якщо не резолвиться — `../../../server/api/likes.get`.

- [ ] **Step 2: Запустити**

Run: `npm test`
Expected: 1 нова secція `GET /api/likes`, 1 test passed. Усі попередні тести (`useLikes`) теж зеленіють.

Якщо red:
- «Cannot find module '~~/server/api/likes.get'» → замінити на relative path `../../../server/api/likes.get`.
- «defineEventHandler is not defined» → handler імпортується з `defineEventHandler`, який у Nuxt server — auto-import. У Nitro це autoimport tries to resolve. Якщо ламається — додати у Vitest config `server.deps.inline: ['#imports']` або імпортувати handler через інший спосіб. Як backup — мокати `defineEventHandler` глобально:
  ```ts
  vi.stubGlobal('defineEventHandler', (fn: unknown) => fn)
  ```
- «createError is not defined» → перевірити, що mock на `h3` пройшов; має бути доступний.

- [ ] **Step 3: Commit**

```bash
git add tests/server/api/likes.spec.ts
git commit -m "test(server): cover GET /api/likes happy path"
```

---

## Task 4: GET guest + GET повертає `[]` коли БД пуста

**Files:**
- Modify: `tests/server/api/likes.spec.ts`

- [ ] **Step 1: Додати два тести в `describe('GET /api/likes', () => {...})`**

```ts
  it('повертає [] для незалогіненого гостя без виклику Supabase', async () => {
    supabaseUserMock.mockResolvedValue(null)

    const handler = (await import('~~/server/api/likes.get')).default
    const result = await handler(createMockEvent() as never)

    expect(result).toEqual([])
    expect(supabaseAdminMock).not.toHaveBeenCalled()
  })

  it('повертає [] коли в БД немає рядків для юзера', async () => {
    supabaseUserMock.mockResolvedValue({ id: 'user-2' })
    supabaseClient = createSupabaseChainMock({ data: null, error: null })

    const handler = (await import('~~/server/api/likes.get')).default
    const result = await handler(createMockEvent() as never)

    expect(result).toEqual([])
  })
```

- [ ] **Step 2: Запустити**

Run: `npm test`
Expected: 3 тести в `GET /api/likes` зелені.

- [ ] **Step 3: Commit**

```bash
git add tests/server/api/likes.spec.ts
git commit -m "test(server): cover GET /api/likes guest and empty cases"
```

---

## Task 5: POST happy + 401 + 400

**Files:**
- Modify: `tests/server/api/likes.spec.ts`

- [ ] **Step 1: Додати новий describe-блок наприкінці файлу**

```ts
describe('POST /api/likes', () => {
  beforeEach(() => {
    supabaseUserMock.mockReset()
    supabaseAdminMock.mockClear()
  })

  it('upsert-ить лайк і повертає { ok: true }', async () => {
    supabaseUserMock.mockResolvedValue({ id: 'user-1' })
    supabaseClient = createSupabaseChainMock({ error: null })

    const handler = (await import('~~/server/api/likes.post')).default
    const result = await handler(createMockEvent({ body: { slug: 'rel-x' } }) as never)

    expect(result).toEqual({ ok: true })
    expect(supabaseClient.from).toHaveBeenCalledWith('release_likes')
    expect(supabaseClient.upsert).toHaveBeenCalledWith(
      { user_id: 'user-1', release_slug: 'rel-x' },
      { onConflict: 'user_id,release_slug', ignoreDuplicates: true },
    )
  })

  it('кидає 401 для незалогіненого', async () => {
    supabaseUserMock.mockResolvedValue(null)

    const handler = (await import('~~/server/api/likes.post')).default
    await expect(
      handler(createMockEvent({ body: { slug: 'rel-x' } }) as never),
    ).rejects.toMatchObject({ statusCode: 401 })

    expect(supabaseAdminMock).not.toHaveBeenCalled()
  })

  it('кидає 400 коли slug відсутній у body', async () => {
    supabaseUserMock.mockResolvedValue({ id: 'user-1' })

    const handler = (await import('~~/server/api/likes.post')).default
    await expect(
      handler(createMockEvent({ body: {} }) as never),
    ).rejects.toMatchObject({ statusCode: 400 })

    expect(supabaseAdminMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Запустити**

Run: `npm test`
Expected: +3 тести зелені. Загалом 6 у файлі (3 GET + 3 POST).

- [ ] **Step 3: Commit**

```bash
git add tests/server/api/likes.spec.ts
git commit -m "test(server): cover POST /api/likes happy/401/400"
```

---

## Task 6: DELETE happy + 401 + 400

**Files:**
- Modify: `tests/server/api/likes.spec.ts`

- [ ] **Step 1: Додати describe-блок**

```ts
describe('DELETE /api/likes/[slug]', () => {
  beforeEach(() => {
    supabaseUserMock.mockReset()
    supabaseAdminMock.mockClear()
  })

  it('видаляє рядок за парою (user, slug) і повертає { ok: true }', async () => {
    supabaseUserMock.mockResolvedValue({ id: 'user-1' })
    supabaseClient = createSupabaseChainMock({ error: null })

    const handler = (await import('~~/server/api/likes/[slug].delete')).default
    const result = await handler(createMockEvent({ params: { slug: 'rel-y' } }) as never)

    expect(result).toEqual({ ok: true })
    expect(supabaseClient.delete).toHaveBeenCalled()
    expect(supabaseClient.eq).toHaveBeenCalledWith('user_id', 'user-1')
    expect(supabaseClient.eq).toHaveBeenCalledWith('release_slug', 'rel-y')
  })

  it('кидає 401 для незалогіненого', async () => {
    supabaseUserMock.mockResolvedValue(null)

    const handler = (await import('~~/server/api/likes/[slug].delete')).default
    await expect(
      handler(createMockEvent({ params: { slug: 'rel-y' } }) as never),
    ).rejects.toMatchObject({ statusCode: 401 })
  })

  it('кидає 400 коли slug відсутній у route params', async () => {
    supabaseUserMock.mockResolvedValue({ id: 'user-1' })

    const handler = (await import('~~/server/api/likes/[slug].delete')).default
    await expect(
      handler(createMockEvent({ params: {} }) as never),
    ).rejects.toMatchObject({ statusCode: 400 })
  })
})
```

- [ ] **Step 2: Запустити**

Run: `npm test`
Expected: +3 тести зелені. Загалом 9 у файлі.

- [ ] **Step 3: Commit**

```bash
git add tests/server/api/likes.spec.ts
git commit -m "test(server): cover DELETE /api/likes/[slug] happy/401/400"
```

---

## Task 7: COUNT happy + 400

**Files:**
- Modify: `tests/server/api/likes.spec.ts`

- [ ] **Step 1: Додати describe-блок**

```ts
describe('GET /api/likes/count/[slug]', () => {
  beforeEach(() => {
    supabaseUserMock.mockReset()
    supabaseAdminMock.mockClear()
  })

  it('повертає { count } з head-select для slug', async () => {
    supabaseClient = createSupabaseChainMock({ count: 42, error: null })

    const handler = (await import('~~/server/api/likes/count/[slug].get')).default
    const result = await handler(createMockEvent({ params: { slug: 'rel-z' } }) as never)

    expect(result).toEqual({ count: 42 })
    expect(supabaseClient.from).toHaveBeenCalledWith('release_likes')
    expect(supabaseClient.select).toHaveBeenCalledWith('*', { count: 'exact', head: true })
    expect(supabaseClient.eq).toHaveBeenCalledWith('release_slug', 'rel-z')
  })

  it('повертає { count: 0 } коли БД повертає null', async () => {
    supabaseClient = createSupabaseChainMock({ count: null, error: null })

    const handler = (await import('~~/server/api/likes/count/[slug].get')).default
    const result = await handler(createMockEvent({ params: { slug: 'rel-z' } }) as never)

    expect(result).toEqual({ count: 0 })
  })

  it('кидає 400 без slug', async () => {
    const handler = (await import('~~/server/api/likes/count/[slug].get')).default
    await expect(
      handler(createMockEvent({ params: {} }) as never),
    ).rejects.toMatchObject({ statusCode: 400 })

    expect(supabaseAdminMock).not.toHaveBeenCalled()
  })
})
```

Зверни увагу: count-endpoint НЕ викликає `serverSupabaseUser` (публічний). Тому `supabaseUserMock` тут не потрібен у setup-і — beforeEach просто не використовує auth.

- [ ] **Step 2: Запустити**

Run: `npm test`
Expected: +3 тести зелені. Загалом 12 у файлі.

- [ ] **Step 3: Commit**

```bash
git add tests/server/api/likes.spec.ts
git commit -m "test(server): cover GET /api/likes/count/[slug]"
```

---

## Task 8: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Прогнати весь test-suite**

Run: `npm test`
Expected:
- `tests/composables/useLikes.spec.ts` — 5 passed.
- `tests/server/api/likes.spec.ts` — 12 passed.
- Загалом 17 tests, 0 failed.
- Час < 10s.

- [ ] **Step 2: Перевірити, що `npm test` не падає двічі підряд**

Run: `npm test && npm test`
Expected: обидва прогона зелені. Перевіряє, що state-leak між запусками відсутній.

- [ ] **Step 3: Type-check**

Run: `npx vue-tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build success. `tests/` не потрапляють у Nuxt-build (Nuxt сканує `app/`, `server/`, `shared/`).

- [ ] **Step 5: Final commit (якщо щось ще додалось)**

```bash
git status
# Якщо чисто — без коміту.
```

---

## Notes для виконавця

**Якщо `await import('~~/server/api/likes.get')` падає з resolve-помилкою:**

Найімовірніша причина — Nuxt-alias `~~` не зареєстрований у Vitest module-resolver-і. Два fallback-и:

1. **Relative path** — замінити `~~/server/api/likes.get` на `../../../server/api/likes.get` (з `tests/server/api/likes.spec.ts` корінь — три рівні вгору).
2. **Vite resolve.alias у `vitest.config.ts`** — додати:
   ```ts
   import { fileURLToPath } from 'node:url'
   export default defineVitestConfig({
     test: { ... },
     resolve: {
       alias: {
         '~~': fileURLToPath(new URL('.', import.meta.url)),
       },
     },
   })
   ```

**Якщо `defineEventHandler is not defined` в imported handler-і:**

Handler-файл має `export default defineEventHandler(async (event) => {...})`. У Nuxt server `defineEventHandler` — auto-import з h3. Якщо тестовий env його не auto-imported, треба stub:

В `tests/setup.ts` додати:
```ts
import { vi } from 'vitest'
vi.stubGlobal('defineEventHandler', <T,>(fn: T) => fn)
```

Це робить `defineEventHandler` пас-thru — handler-функція повертається без обгортки. Тести викликають її напряму, що відповідає бажаній поведінці.

**Якщо тести залежать одне від одного через chain-mock-стан:**

`supabaseClient` — це global `let`, який replace-ається в кожному `it`. Якщо забути замінити — попередній mock тече. У плані вже є `supabaseAdminMock.mockClear()` у `beforeEach`, але `supabaseClient` сам — ні. Якщо побачиш протікання, додай у beforeEach:
```ts
supabaseClient = createSupabaseChainMock()  // default — empty success
```

**Що далі (поза цим планом):**

1. **Скопіювати шаблон на artist/track/event/playlist/video likes endpoint-и** (~30 хв на всі) — той самий test-файл з заміненими slug-полями (`release_slug` → `artist_slug` тощо) і табличними іменами.
2. **Server-route тести для решти endpoint-ів** (`releases.get.ts`, `release/[slug].get.ts`, тощо) — поступово.
3. **Integration smoke test через `setup({ server: true })`** — один тест на повний HTTP-цикл (cookie auth + реальний Nitro), щоб мати інтеграційне покриття на додачу до unit-тестів.
4. **CI integration** — `.github/workflows/test.yml` з `npm ci && npm test && npx vue-tsc --noEmit && npm run build`.
5. **Безпосередньо рефакторинг на `defineLikesHandler`** — після того, як unit-тести зеленіють, можна сміло консолідувати 12 server endpoint-ів (release/artist/track/event/playlist/video × GET/POST) у фабрику з впевненістю.

**Pattern для майбутніх endpoint-тестів:**
- chain-mock helper переюзовуваний — нічого міняти не треба.
- event-mock helper переюзовуваний.
- Шапка `vi.mock` з `#supabase/server`, `~~/server/utils/supabaseAdmin`, `h3` — копіюється one-to-one. Якщо проєкт виросте — винести цю шапку в `tests/utils/serverApiMocks.ts` як re-export, але зараз 3 рядки `vi.mock` повторити простіше за абстракцію (DRY-treshold не досягнутий).
