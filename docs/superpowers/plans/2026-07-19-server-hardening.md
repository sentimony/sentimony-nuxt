# Server Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Валідований slug + перевірка існування сутності + rate limiting для likes/plays-мутацій; redaction request-логів у production.

**Architecture:** Три чисті утиліти (`slugValidation`, `rateLimit`, redaction у `logger`) підключаються в наявні фабрики `likesAddHandler`/`likesDeleteHandler` та `track-plays.post.ts`. Жодних змін клієнта і форм відповідей happy path.

**Tech Stack:** Nitro server utils, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-19-server-hardening-design.md`

## Global Constraints

- Гілка `json-to-yml`, без git worktrees; без нових залежностей.
- Happy-path контракти незмінні: `POST` лайка → `{ ok, count }`; existing 400 «Missing like identity»/«Missing slug» зберігаються.
- Rate limiter — in-memory per-instance (чесно задокументовано в коді одним коментарем).
- Юніт-тести мокають auto-imported утиліти через `globalThis` (зразок: `tests/unit/likeCountersHandler.test.ts`).

---

### Task 1: `normalizeSlug`

**Files:**
- Create: `server/utils/slugValidation.ts`
- Test: `tests/unit/slugValidation.test.ts`

**Interfaces:**
- Produces: `normalizeSlug(input: unknown): string | null` — trim; 1–200 символів; `^[a-z0-9][a-z0-9-]*$`; інакше `null`.

- [ ] **Step 1: Падаючий тест**

`tests/unit/slugValidation.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { normalizeSlug } from '../../server/utils/slugValidation'

describe('normalizeSlug', () => {
  it('accepts and trims canonical slugs', () => {
    expect(normalizeSlug('va-fantazma')).toBe('va-fantazma')
    expect(normalizeSlug('  36-a-final-thought  ')).toBe('36-a-final-thought')
  })

  it('rejects invalid formats', () => {
    expect(normalizeSlug('UPPER')).toBeNull()
    expect(normalizeSlug('has space')).toBeNull()
    expect(normalizeSlug('semi;colon')).toBeNull()
    expect(normalizeSlug('-leading-dash')).toBeNull()
    expect(normalizeSlug('')).toBeNull()
    expect(normalizeSlug('a'.repeat(201))).toBeNull()
  })

  it('rejects non-strings', () => {
    expect(normalizeSlug(null)).toBeNull()
    expect(normalizeSlug(42)).toBeNull()
    expect(normalizeSlug({ slug: 'x' })).toBeNull()
  })
})
```

Run: `npx vitest run tests/unit/slugValidation.test.ts` → FAIL (module not found).

- [ ] **Step 2: Реалізація**

`server/utils/slugValidation.ts`:

```ts
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/

export function normalizeSlug(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const slug = input.trim()
  if (!slug || slug.length > 200 || !SLUG_RE.test(slug)) return null
  return slug
}
```

Run: `npx vitest run tests/unit/slugValidation.test.ts` → PASS.

- [ ] **Step 3: Commit**

```bash
git add server/utils/slugValidation.ts tests/unit/slugValidation.test.ts
git commit -m "feat(server): shared normalizeSlug validator"
```

---

### Task 2: Валідація + перевірка існування в likes-фабриках

**Files:**
- Modify: `server/utils/likes.ts` (`likesAddHandler`, `likesDeleteHandler`)
- Modify: `server/api/track-plays.post.ts` (замінити локальний trim/length на `normalizeSlug`)
- Test: `tests/unit/likesHandlers.test.ts` (новий)

**Interfaces:**
- Consumes: `normalizeSlug` (Task 1), `supabaseAdmin`.
- Produces: у `likesAddHandler(table, slugCol)` — після читання body: `normalizeSlug` → 400 `Invalid slug`; далі existence-check у content-таблиці за мапою `ENTITY_TABLES` → 404 `Not found`. `likesDeleteHandler` — лише `normalizeSlug` (видалення неіснуючого — no-op як зараз).

- [ ] **Step 1: Падаючий тест**

`tests/unit/likesHandlers.test.ts` (мок-glabals за зразком `likeCountersHandler.test.ts`; точні імена глобалів звірити з `server/utils/likes.ts` при імплементації — очікувано `serverSupabaseUser`, `getCookie`, `readBody`, `createError`, `supabaseAdmin`):

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const GLOBALS = ['defineEventHandler', 'createError', 'readBody', 'getCookie', 'serverSupabaseUser', 'supabaseAdmin', 'normalizeSlug', 'assertWithinRateLimit']

function adminMock(entityExists: boolean) {
  return () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: entityExists ? { slug: 'va-fantazma' } : null, error: null }),
        }),
      }),
    }),
    rpc: async () => ({ data: 1, error: null }),
  })
}

describe('likesAddHandler hardening', () => {
  beforeEach(async () => {
    const g = globalThis as Record<string, unknown>
    vi.resetModules()
    g.defineEventHandler = (handler: unknown) => handler
    g.createError = (input: { statusCode?: number, statusMessage?: string }) => {
      const err = new Error(input.statusMessage ?? 'Error') as Error & { statusCode?: number }
      err.statusCode = input.statusCode
      return err
    }
    g.serverSupabaseUser = async () => ({ sub: '00000000-0000-4000-8000-000000000000' })
    g.getCookie = () => undefined
    const { normalizeSlug } = await import('../../server/utils/slugValidation')
    g.normalizeSlug = normalizeSlug
    g.assertWithinRateLimit = () => {}
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of GLOBALS) delete (globalThis as Record<string, unknown>)[key]
  })

  it('rejects malformed slugs with 400', async () => {
    const g = globalThis as Record<string, unknown>
    g.readBody = async () => ({ slug: 'DROP TABLE;' })
    g.supabaseAdmin = adminMock(true)

    const { likesAddHandler } = await import('../../server/utils/likes')
    const handler = likesAddHandler('release_likes', 'release_slug') as (e: unknown) => Promise<unknown>

    await expect(handler({})).rejects.toMatchObject({ statusCode: 400 })
  })

  it('rejects unknown entities with 404', async () => {
    const g = globalThis as Record<string, unknown>
    g.readBody = async () => ({ slug: 'ghost-release' })
    g.supabaseAdmin = adminMock(false)

    const { likesAddHandler } = await import('../../server/utils/likes')
    const handler = likesAddHandler('release_likes', 'release_slug') as (e: unknown) => Promise<unknown>

    await expect(handler({})).rejects.toMatchObject({ statusCode: 404 })
  })

  it('keeps the happy path', async () => {
    const g = globalThis as Record<string, unknown>
    g.readBody = async () => ({ slug: 'va-fantazma' })
    g.supabaseAdmin = adminMock(true)

    const { likesAddHandler } = await import('../../server/utils/likes')
    const handler = likesAddHandler('release_likes', 'release_slug') as (e: unknown) => Promise<{ ok: boolean }>

    await expect(handler({})).resolves.toMatchObject({ ok: true })
  })
})
```

Run: `npx vitest run tests/unit/likesHandlers.test.ts` → FAIL (перші два кейси).
Примітка: якщо `likes.ts` імпортує щось явно (не через auto-import) — адаптувати моки під фактичні залежності; форму RPC-виклику happy path звірити з реальним кодом і за потреби поправити `adminMock`.

- [ ] **Step 2: Оновити `likes.ts`**

У `server/utils/likes.ts` додати мапу і перевірки в `likesAddHandler` (одразу після читання body):

```ts
const ENTITY_TABLES: Record<string, string> = {
  release_likes: 'releases',
  artist_likes: 'artists',
  track_likes: 'tracks',
  video_likes: 'videos',
  event_likes: 'events',
  playlist_likes: 'playlists',
}
```

```ts
    const body = await readBody<{ slug?: unknown }>(event)
    const slug = normalizeSlug(body?.slug)
    if (!slug) throw createError({ statusCode: 400, statusMessage: 'Invalid slug' })

    const entityTable = ENTITY_TABLES[table]
    const { data: entity, error: entityError } = await dynamicAdminClient()
      .from(entityTable)
      .select('slug')
      .eq('slug', slug)
      .maybeSingle()
    if (entityError) throw createError({ statusCode: 500, statusMessage: entityError.message })
    if (!entity) throw createError({ statusCode: 404, statusMessage: 'Not found' })
```

(далі — наявний RPC-виклик з `slug` замість сирого body-значення). У `likesDeleteHandler` замінити `!slug` перевірку на `normalizeSlug(getRouterParam(event, 'slug'))` → 400 при `null`. У `track-plays.post.ts` замінити локальні trim/length-перевірки на `normalizeSlug`.

- [ ] **Step 3: Тести**

Run: `npx vitest run tests/unit/likesHandlers.test.ts && npm run test:unit` → PASS без регресій.

- [ ] **Step 4: Commit**

```bash
git add server/utils/likes.ts server/api/track-plays.post.ts tests/unit/likesHandlers.test.ts
git commit -m "feat(likes): validate slugs and verify entity existence before mutations"
```

---

### Task 3: Rate limiting

**Files:**
- Create: `server/utils/rateLimit.ts`
- Modify: `server/utils/likes.ts` (`likesAddHandler`), `server/api/track-plays.post.ts`
- Test: `tests/unit/rateLimit.test.ts`

**Interfaces:**
- Produces: `assertWithinRateLimit(key: string, options: { limit: number, windowMs: number }): void` — кидає `createError({ statusCode: 429 })` при перевищенні; вікно ковзне спрощене (fixed window). Виклики: likes `assertWithinRateLimit(\`likes:${userId}\`, { limit: 30, windowMs: 60_000 })`, plays — `plays:${userId}` 60/хв.

- [ ] **Step 1: Падаючий тест**

`tests/unit/rateLimit.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('assertWithinRateLimit', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    ;(globalThis as Record<string, unknown>).createError = (input: { statusCode?: number }) => {
      const err = new Error('rate limited') as Error & { statusCode?: number }
      err.statusCode = input.statusCode
      return err
    }
  })

  afterEach(() => {
    vi.useRealTimers()
    delete (globalThis as Record<string, unknown>).createError
  })

  it('allows up to the limit, then throws 429, then resets after the window', async () => {
    const { assertWithinRateLimit } = await import('../../server/utils/rateLimit')
    const options = { limit: 3, windowMs: 60_000 }

    for (let i = 0; i < 3; i++) expect(() => assertWithinRateLimit('k', options)).not.toThrow()
    expect(() => assertWithinRateLimit('k', options)).toThrow(expect.objectContaining({ statusCode: 429 }))
    expect(() => assertWithinRateLimit('other', options)).not.toThrow()

    vi.advanceTimersByTime(61_000)
    expect(() => assertWithinRateLimit('k', options)).not.toThrow()
  })
})
```

Run: `npx vitest run tests/unit/rateLimit.test.ts` → FAIL.

- [ ] **Step 2: Реалізація**

`server/utils/rateLimit.ts`:

```ts
// Per-instance fixed-window limiter: on Netlify each lambda instance keeps its
// own counters, so this is a soft cap against runaway clients, not a global
// distributed limit.
const windows = new Map<string, { start: number, count: number }>()

export function assertWithinRateLimit(key: string, options: { limit: number, windowMs: number }): void {
  const now = Date.now()
  const current = windows.get(key)
  if (!current || now - current.start >= options.windowMs) {
    windows.set(key, { start: now, count: 1 })
    return
  }
  current.count++
  if (current.count > options.limit) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }
}
```

Run: `npx vitest run tests/unit/rateLimit.test.ts` → PASS.

- [ ] **Step 3: Підключити**

У `likesAddHandler` після отримання `userId` (до RPC):

```ts
    assertWithinRateLimit(`likes:${userId}`, { limit: 30, windowMs: 60_000 })
```

У `track-plays.post.ts` аналогічно з `plays:` і `limit: 60`. Прогнати `npm run test:unit` (тест Task 2 уже мокає `assertWithinRateLimit` no-op-ом) → зелено.

- [ ] **Step 4: Commit**

```bash
git add server/utils/rateLimit.ts server/utils/likes.ts server/api/track-plays.post.ts tests/unit/rateLimit.test.ts
git commit -m "feat(server): per-instance rate limiting for like/play mutations"
```

---

### Task 4: Redaction request-логера

**Files:**
- Modify: `server/utils/logger.ts` (`logRequest`)
- Test: `tests/unit/loggerRedaction.test.ts` (новий; якщо `logger.ts` нетестабельний без h3-event — тест на чисту функцію redaction, винесену з `logRequest`)

**Interfaces:**
- Produces: чиста функція `redactForProduction(parts: { ip?: string, url?: string, referer?: string }): { ip?: string, url?: string, referer?: string }` — IP до /24 (`1.2.3.x`; IPv6 — перші 4 групи + `::x`), URL — лише pathname (query відкидається), referer — лише hostname. `logRequest` застосовує її, коли НЕ dev і `process.env.LOG_VERBOSE !== '1'`.

- [ ] **Step 1: Падаючий тест**

`tests/unit/loggerRedaction.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { redactForProduction } from '../../server/utils/logger'

describe('redactForProduction', () => {
  it('masks ip, strips query, keeps referer hostname', () => {
    expect(redactForProduction({
      ip: '203.0.113.42',
      url: '/api/releases?secret=1&page=2',
      referer: 'https://example.com/path?q=1#h',
    })).toEqual({
      ip: '203.0.113.x',
      url: '/api/releases',
      referer: 'example.com',
    })
  })

  it('tolerates missing/unparseable values', () => {
    expect(redactForProduction({})).toEqual({})
    expect(redactForProduction({ referer: 'not a url' })).toEqual({ referer: undefined })
  })
})
```

Run: `npx vitest run tests/unit/loggerRedaction.test.ts` → FAIL.

- [ ] **Step 2: Реалізація**

У `server/utils/logger.ts` додати експорт:

```ts
export function redactForProduction(parts: { ip?: string, url?: string, referer?: string }) {
  const out: { ip?: string, url?: string, referer?: string } = {}
  if (parts.ip !== undefined) {
    out.ip = parts.ip.includes(':')
      ? parts.ip.split(':').slice(0, 4).join(':') + '::x'
      : parts.ip.replace(/\.\d+$/, '.x')
  }
  if (parts.url !== undefined) out.url = parts.url.split('?')[0]
  if (parts.referer !== undefined) {
    try { out.referer = new URL(parts.referer).hostname }
    catch { out.referer = undefined }
  }
  return out
}
```

і в `logRequest` перед формуванням лог-рядка:

```ts
  const verbose = import.meta.dev || process.env.LOG_VERBOSE === '1'
  const safe = verbose ? { ip, url, referer } : redactForProduction({ ip, url, referer })
```

(використовувати `safe.ip`/`safe.url`/`safe.referer` у виводі; локальні змінні звірити з фактичним кодом `logRequest` при імплементації).

Run: `npx vitest run tests/unit/loggerRedaction.test.ts` → PASS.

- [ ] **Step 3: Commit**

```bash
git add server/utils/logger.ts tests/unit/loggerRedaction.test.ts
git commit -m "feat(logging): redact ip/query/referer in production request logs"
```

---

### Task 5: e2e-кейс + фінальна верифікація

**Files:**
- Modify: `tests/e2e/api-security.spec.ts`

- [ ] **Step 1: Додати кейс**

```ts
test('rejects malformed like slugs', async ({ request }) => {
  const res = await request.post('/api/likes', {
    data: { slug: 'DROP TABLE users;--' },
    headers: { cookie: 'sentimony_anon_id=00000000-0000-4000-8000-000000000000' },
  })
  expect(res.status()).toBe(400)
})
```

Run: `npx playwright test tests/e2e/api-security.spec.ts` → PASS.

- [ ] **Step 2: Повна верифікація**

Run: `npm run test:unit && npx nuxi typecheck` → зелено.
Live: dev → клік лайка на релізі працює (200, лічильник росте); швидке багатократне клікання > 30/хв → 429 + toast помилки (очікувана поведінка createLikes: відкат оптимістичного інкременту).

- [ ] **Step 3: ROADMAP + commit**

Позначити `docs/roadmap/request-logging.md` і `docs/roadmap/mutation-hardening.md` як implemented та додати підсумок у `docs/roadmap/completed.md` (з приміткою про per-instance ліміт і опцію Netlify rate limiting rules).

```bash
git add tests/e2e/api-security.spec.ts docs/roadmap/request-logging.md docs/roadmap/mutation-hardening.md docs/roadmap/completed.md
git commit -m "test(security): cover slug validation, close hardening roadmap items"
```
