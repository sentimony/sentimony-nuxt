# API Cache Purge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Git policy — див. `CLAUDE.md → ## Git policy` (commit-кроки лишаються користувачу).

**Goal:** Додати безпечне точкове скидання Nitro API cache для content endpoint-ів, починаючи з `/api/releases`, щоб stale cached responses можна було прибирати без повного restart/redeploy.

**Architecture:** У dev content API не кешується. У prod cached handlers отримують deterministic cache keys (`name` + `getKey`), а protected admin endpoint видаляє конкретні записи з Nitro storage. Browser/Nuxt payload cache і Netlify ISR/CDN cache не змішуються з цим механізмом і документуються як окремі рівні.

**Tech Stack:** Nuxt 4 · Nitro `defineCachedEventHandler` · Nitro `useStorage()` · Vitest · TypeScript · Netlify env-vars.

---

## Context для виконавця

Під час налаштування `supabase-stage` знайшли баг: `/api/releases` віддавав старий Firebase response із ~101 релізом з `.nuxt/cache/nitro/handlers`, хоча `.env.stage` уже мав `RELEASES_SOURCE=supabase`, а Supabase stage містив тільки 10 релізів. Детальні сторінки `/release/:id` читали Supabase і для релізів поза subset повертали `Release not found`, тому список і detail route розʼїхались.

Поточний tactical fix уже зроблений у `server/api/releases.get.ts`: у dev endpoint використовує `defineEventHandler`, у prod лишається `defineCachedEventHandler`. Цей план не відкочує цей fix.

Важливе розділення кешів:
- **Nitro API cache** — `.nuxt/cache/nitro/handlers` локально або storage provider у prod. Цей план покриває саме його.
- **Nuxt payload/browser state** — `useAsyncData('releases')` у браузері. Для нього існують `refreshNuxtData('releases')` / reload, але це не server cache purge.
- **Netlify ISR/CDN cache** — HTML сторінки і edge cache. Це не те саме, що Nitro API storage; для нього потрібен redeploy або provider-specific invalidation.

## File Structure

**Create:**
- `server/utils/apiCache.ts` — registry cache keys + helper для storage key + purge функція.
- `server/api/admin/cache/purge.post.ts` — protected endpoint для purge.
- `tests/server/api/admin-cache-purge.spec.ts` — unit tests для auth, key validation, storage removal.

**Modify:**
- `server/api/releases.get.ts` — додати deterministic cache key для prod cached handler.
- `nuxt.config.ts` — додати private runtime config `cachePurgeToken`.
- `.env.example` — додати `NUXT_CACHE_PURGE_TOKEN=<admin-cache-purge-token>`.
- `CLAUDE.md` — описати API cache purge і межі відповідальності.
- `docs/superpowers/plans/2026-05-02-test-environments.md` — коротка note, що stage/local stale release-list bug вирішується dev no-cache + майбутній purge endpoint.

**Do not modify:**
- `app/` pages/composables — UI не має викликати admin purge.
- Netlify deploy config — env-var додається через Netlify UI per context.
- Likes/auth API — це не content cache.

---

## Task 1: Додати cache registry helper

**Files:**
- Create: `server/utils/apiCache.ts`
- Test: `tests/server/api/admin-cache-purge.spec.ts` (у Task 3)

- [ ] **Step 1: Створити `server/utils/apiCache.ts`**

Create:
```ts
type ApiCacheEntry = {
  group: string
  name: string
  key: string
}

export const apiCacheEntries = {
  releases: {
    group: 'nitro/handlers',
    name: 'releases',
    key: 'list',
  },
} satisfies Record<string, ApiCacheEntry>

export type ApiCacheKey = keyof typeof apiCacheEntries

export function isApiCacheKey(value: unknown): value is ApiCacheKey {
  return typeof value === 'string' && value in apiCacheEntries
}

export function createApiCacheStorageKey(entry: ApiCacheEntry, base = '/cache') {
  return [base, entry.group, entry.name, `${entry.key}.json`]
    .filter(Boolean)
    .join(':')
    .replace(/:\/$/, ':index')
}

export async function purgeApiCache(key: ApiCacheKey) {
  const storageKey = createApiCacheStorageKey(apiCacheEntries[key])
  await useStorage().removeItem(storageKey)
  return { key, storageKey }
}
```

- [ ] **Step 2: Verify TypeScript syntax mentally**

Expected:
- `apiCacheEntries.releases` maps to Nitro cached handler group/name/key.
- `createApiCacheStorageKey(apiCacheEntries.releases)` returns `/cache:nitro/handlers:releases:list.json`.
- `purgeApiCache('releases')` calls Nitro storage `removeItem` for that key.

---

## Task 2: Make `/api/releases` prod cache key deterministic

**Files:**
- Modify: `server/api/releases.get.ts`

- [ ] **Step 1: Update cached handler options**

In `server/api/releases.get.ts`, replace the prod `defineCachedEventHandler` options:
```ts
{
  maxAge: 60 * 60,
  swr: true,
}
```

with:
```ts
{
  name: 'releases',
  getKey: () => 'list',
  maxAge: 60 * 60,
  swr: true,
}
```

Expected:
- Dev branch remains `defineEventHandler(getReleases)`.
- Prod branch remains cached but now uses storage key `/cache:nitro/handlers:releases:list.json`.

- [ ] **Step 2: Run unit tests**

Run:
```bash
npm test
```

Expected: 35 existing tests pass.

- [ ] **Step 3: Run local API smoke**

Run a temporary dev server:
```bash
node --env-file=.env.stage node_modules/.bin/nuxt dev --host 0.0.0.0 --port 3001
```

In another terminal:
```bash
curl -sS http://localhost:3001/api/releases | node -e "let s=''; process.stdin.on('data', d => s += d); process.stdin.on('end', () => { const data = JSON.parse(s); const arr = Array.isArray(data) ? data : Object.values(data); console.log(arr.length); })"
```

Expected: `10`.

Stop temporary dev server.

---

## Task 3: Add protected purge endpoint tests

**Files:**
- Create: `tests/server/api/admin-cache-purge.spec.ts`

- [ ] **Step 1: Create failing tests**

Create `tests/server/api/admin-cache-purge.spec.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockEvent } from '../../utils/createMockEvent'

const removeItemMock = vi.fn()

vi.stubGlobal('defineEventHandler', <T,>(fn: T) => fn)
vi.stubGlobal('readBody', async (event: { _body: unknown }) => event._body)
vi.stubGlobal('getHeader', (event: { headers?: Record<string, string> }, name: string) =>
  event.headers?.[name.toLowerCase()],
)
vi.stubGlobal('useRuntimeConfig', () => ({
  cachePurgeToken: 'test-token',
}))
vi.stubGlobal('useStorage', () => ({
  removeItem: removeItemMock,
}))
vi.stubGlobal('createError', (opts: { statusCode: number, statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as Error & { statusCode?: number, statusMessage?: string }
  err.statusCode = opts.statusCode
  err.statusMessage = opts.statusMessage
  return err
})

describe('POST /api/admin/cache/purge', () => {
  beforeEach(() => {
    removeItemMock.mockReset()
  })

  it('rejects requests without the purge token header', async () => {
    const handler = (await import('../../../server/api/admin/cache/purge.post')).default

    await expect(
      handler(createMockEvent({ body: { key: 'releases' } }) as never),
    ).rejects.toMatchObject({ statusCode: 401 })

    expect(removeItemMock).not.toHaveBeenCalled()
  })

  it('rejects unknown cache keys', async () => {
    const handler = (await import('../../../server/api/admin/cache/purge.post')).default

    await expect(
      handler({
        ...createMockEvent({ body: { key: 'unknown' } }),
        headers: { 'x-cache-purge-token': 'test-token' },
      } as never),
    ).rejects.toMatchObject({ statusCode: 400 })

    expect(removeItemMock).not.toHaveBeenCalled()
  })

  it('removes the deterministic releases cache storage item', async () => {
    const handler = (await import('../../../server/api/admin/cache/purge.post')).default

    const result = await handler({
      ...createMockEvent({ body: { key: 'releases' } }),
      headers: { 'x-cache-purge-token': 'test-token' },
    } as never)

    expect(result).toEqual({
      ok: true,
      key: 'releases',
      storageKey: '/cache:nitro/handlers:releases:list.json',
    })
    expect(removeItemMock).toHaveBeenCalledWith('/cache:nitro/handlers:releases:list.json')
  })
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:
```bash
npm test -- tests/server/api/admin-cache-purge.spec.ts
```

Expected: fail because `server/api/admin/cache/purge.post.ts` does not exist yet.

---

## Task 4: Implement protected purge endpoint

**Files:**
- Create: `server/api/admin/cache/purge.post.ts`
- Modify: `nuxt.config.ts`
- Modify: `.env.example`

- [ ] **Step 1: Add private runtime config**

In `nuxt.config.ts`, inside `runtimeConfig`, add:
```ts
cachePurgeToken: process.env.NUXT_CACHE_PURGE_TOKEN || '',
```

Expected surrounding block:
```ts
runtimeConfig: {
  supabaseSecretKey: process.env.NUXT_SUPABASE_SECRET_KEY || '',
  supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
  cachePurgeToken: process.env.NUXT_CACHE_PURGE_TOKEN || '',
  public: {
    firebaseBase: 'https://sentimony-db.firebaseio.com',
    supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
    supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY || '',
  },
},
```

- [ ] **Step 2: Add `.env.example` entry**

In `.env.example`, add:
```env
NUXT_CACHE_PURGE_TOKEN=<admin-cache-purge-token>
```

Do not add the real token to committed files.

- [ ] **Step 3: Create endpoint**

Create `server/api/admin/cache/purge.post.ts`:
```ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const token = getHeader(event, 'x-cache-purge-token')

  if (!config.cachePurgeToken || token !== config.cachePurgeToken) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<{ key?: unknown }>(event)

  if (!isApiCacheKey(body?.key)) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown cache key' })
  }

  const result = await purgeApiCache(body.key)
  return { ok: true, ...result }
})
```

- [ ] **Step 4: Run endpoint tests**

Run:
```bash
npm test -- tests/server/api/admin-cache-purge.spec.ts
```

Expected: new test file passes.

- [ ] **Step 5: Run full test suite**

Run:
```bash
npm test
```

Expected: all existing tests + new admin cache purge tests pass.

---

## Task 5: Manual local purge smoke

**Files:**
- No file changes.

- [ ] **Step 1: Add local token to `.env.stage`**

Add a local-only token:
```env
NUXT_CACHE_PURGE_TOKEN=<local-random-token>
```

Do not commit `.env.stage`.

- [ ] **Step 2: Start dev server**

Run:
```bash
npm run dev
```

Expected: Nuxt starts on `http://localhost:3000`.

- [ ] **Step 3: Call purge endpoint**

Run in another terminal:
```bash
curl -sS -X POST http://localhost:3000/api/admin/cache/purge \
  -H 'content-type: application/json' \
  -H 'x-cache-purge-token: <local-random-token>' \
  --data '{"key":"releases"}'
```

Expected:
```json
{"ok":true,"key":"releases","storageKey":"/cache:nitro/handlers:releases:list.json"}
```

- [ ] **Step 4: Verify release list still returns stage subset**

Run:
```bash
curl -sS http://localhost:3000/api/releases | node -e "let s=''; process.stdin.on('data', d => s += d); process.stdin.on('end', () => { const data = JSON.parse(s); const arr = Array.isArray(data) ? data : Object.values(data); console.log(arr.length); })"
```

Expected with current stage subset: `10`.

- [ ] **Step 5: Stop dev server**

Stop server with `Ctrl+C`.

---

## Task 6: Document cache layers and operational use

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/superpowers/plans/2026-05-02-test-environments.md`

- [ ] **Step 1: Add cache section to `CLAUDE.md`**

After `## Database migrations`, add:
```markdown
## Cache invalidation

There are three separate cache layers:

- Nitro API cache: `defineCachedEventHandler` responses, local files under `.nuxt/cache/nitro/handlers` in dev/build output. Protected purge endpoint: `POST /api/admin/cache/purge` with `x-cache-purge-token` and body `{ "key": "releases" }`.
- Nuxt client payload / `useAsyncData`: browser-side data keyed by strings such as `releases`. Refresh with `refreshNuxtData('releases')` or a browser reload; this does not clear Nitro storage.
- Netlify ISR/CDN cache: rendered pages and edge cache. Use redeploy/provider invalidation; do not assume API purge clears HTML pages.

Local emergency reset for API cache:

```bash
rm -rf .nuxt/cache/nitro/handlers
```

Never expose `NUXT_CACHE_PURGE_TOKEN` in public runtime config or client code.
```

- [ ] **Step 2: Add note to test-environments plan**

In `docs/superpowers/plans/2026-05-02-test-environments.md`, append to the existing cache/stage execution note:
```markdown
- Follow-up cache hardening plan: `docs/superpowers/plans/2026-05-03-api-cache-purge.md`.
```

- [ ] **Step 3: Verify docs references**

Run:
```bash
rg -n "Cache invalidation|api/cache/purge|2026-05-03-api-cache-purge" CLAUDE.md docs/superpowers/plans/2026-05-02-test-environments.md
```

Expected: all three references are present.

---

## Final verification

- [ ] **Step 1: Full test suite**

Run:
```bash
npm test
```

Expected: all tests pass, including `tests/server/api/admin-cache-purge.spec.ts`.

- [ ] **Step 2: Build**

Run:
```bash
node --env-file=.env.stage node_modules/.bin/nuxt build
```

Expected: build passes.

- [ ] **Step 3: Security check**

Run:
```bash
rg -n "NUXT_CACHE_PURGE_TOKEN=.*[^<]" .env.example CLAUDE.md docs server tests
```

Expected: no real token values in committed files. Placeholder values like `<admin-cache-purge-token>` are okay.

- [ ] **Step 4: [user commits manually]**

Очікувано закомітити:
- `server/utils/apiCache.ts`
- `server/api/admin/cache/purge.post.ts`
- `server/api/releases.get.ts`
- `tests/server/api/admin-cache-purge.spec.ts`
- `nuxt.config.ts`
- `.env.example`
- `CLAUDE.md`
- `docs/superpowers/plans/2026-05-02-test-environments.md`
- `docs/superpowers/plans/2026-05-03-api-cache-purge.md`

Suggested commit message:
```text
add api cache purge plan and endpoint
```

