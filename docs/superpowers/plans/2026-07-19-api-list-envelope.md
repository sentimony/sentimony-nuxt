# API List Envelope Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Уніфікувати 8 публічних list-ендпоінтів на envelope `{ info: { count, pages, next, prev }, results: [] }` (стиль rickandmortyapi.com) з опційною пагінацією `page`/`limit`.

**Architecture:** Чиста фабрика `buildListEnvelope()` у `server/utils/listEnvelope.ts` загортає масив рядків (Supabase — як є; Firebase — `Object.values(pickListFields(...))`). Клієнтський `toArray()` вчиться розгортати `results` — усі ~25 колсайтів сторінок лишаються незмінними; правляться лише типи та три прямі споживачі (`tracks.vue`, `release/[id].vue`, `web-debug.mjs`).

**Tech Stack:** Nuxt 4 / Nitro, Vitest, Supabase/Firebase dual catalog source.

**Spec:** `docs/superpowers/specs/2026-07-19-api-list-envelope-design.md`

## Global Constraints

- Гілка `json-to-yml`, без git worktrees (AGENTS.md).
- Стиль: 2 пробіли, один trailing newline, без trailing whitespace; коментарі — англійською, лише для неочевидного.
- Базлайн: `npm run test:unit` → 39 files / 161 tests (плюс файли з плану release-title split, якщо він виконаний раніше). Typecheck: `npx nuxi typecheck`.
- Не запускати `sync:*`; нових npm-залежностей не додавати.
- Скоуп: тільки `/api/releases`, `/api/artists`, `/api/artists-all`, `/api/videos`, `/api/events`, `/api/playlists`, `/api/friends`, `/api/tracks`. Detail-, композитні- та likes-ендпоінти не чіпати.
- `limit` clamp 1–100 (як у likes-пагінатора); без `limit` — повна колекція, `pages: 1`.
- `next`/`prev` — відносні URL (`/api/releases?page=2&limit=20`).

---

### Task 1: Фабрика `buildListEnvelope`

**Files:**
- Create: `server/utils/listEnvelope.ts`
- Test: `tests/unit/listEnvelope.test.ts`

**Interfaces:**
- Produces (Nitro auto-import для handlers; чистий модуль без глобалів, у тестах — прямий імпорт):
  - `interface ListInfo { count: number, pages: number, next: string | null, prev: string | null }`
  - `interface ListEnvelope<T> { info: ListInfo, results: T[] }`
  - `buildListEnvelope<T>(rows: T[], options: { path: string, page?: unknown, limit?: unknown }): ListEnvelope<T>`

- [ ] **Step 1: Написати падаючий тест**

`tests/unit/listEnvelope.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildListEnvelope } from '../../server/utils/listEnvelope'

const rows = Array.from({ length: 5 }, (_, i) => ({ slug: `item-${i + 1}` }))

describe('buildListEnvelope', () => {
  it('returns the whole collection when no limit is given', () => {
    expect(buildListEnvelope(rows, { path: '/api/releases' })).toEqual({
      info: { count: 5, pages: 1, next: null, prev: null },
      results: rows,
    })
  })

  it('paginates with next/prev relative urls', () => {
    const first = buildListEnvelope(rows, { path: '/api/releases', page: '1', limit: '2' })
    expect(first.info).toEqual({ count: 5, pages: 3, next: '/api/releases?page=2&limit=2', prev: null })
    expect(first.results.map(r => r.slug)).toEqual(['item-1', 'item-2'])

    const middle = buildListEnvelope(rows, { path: '/api/releases', page: '2', limit: '2' })
    expect(middle.info.next).toBe('/api/releases?page=3&limit=2')
    expect(middle.info.prev).toBe('/api/releases?page=1&limit=2')
    expect(middle.results.map(r => r.slug)).toEqual(['item-3', 'item-4'])

    const last = buildListEnvelope(rows, { path: '/api/releases', page: '3', limit: '2' })
    expect(last.info.next).toBeNull()
    expect(last.results.map(r => r.slug)).toEqual(['item-5'])
  })

  it('returns empty results with valid info for an out-of-range page', () => {
    const result = buildListEnvelope(rows, { path: '/api/releases', page: '99', limit: '2' })
    expect(result.results).toEqual([])
    expect(result.info).toEqual({ count: 5, pages: 3, next: null, prev: '/api/releases?page=3&limit=2' })
  })

  it('falls back to the full collection on invalid query values', () => {
    for (const query of [
      { page: 'abc', limit: 'abc' },
      { page: '0', limit: '0' },
      { limit: '-5' },
    ]) {
      const result = buildListEnvelope(rows, { path: '/api/releases', ...query })
      expect(result.info).toEqual({ count: 5, pages: 1, next: null, prev: null })
      expect(result.results).toHaveLength(5)
    }
  })

  it('clamps limit to 100', () => {
    const many = Array.from({ length: 150 }, (_, i) => ({ slug: `row-${i + 1}` }))
    const result = buildListEnvelope(many, { path: '/api/tracks', limit: '500' })
    expect(result.info).toEqual({ count: 150, pages: 2, next: '/api/tracks?page=2&limit=100', prev: null })
    expect(result.results).toHaveLength(100)
  })
})
```

- [ ] **Step 2: Переконатися, що тест падає**

Run: `npx vitest run tests/unit/listEnvelope.test.ts`
Expected: FAIL — `Cannot find module '../../server/utils/listEnvelope'`.

- [ ] **Step 3: Реалізувати фабрику**

`server/utils/listEnvelope.ts`:

```ts
export interface ListInfo {
  count: number
  pages: number
  next: string | null
  prev: string | null
}

export interface ListEnvelope<T> {
  info: ListInfo
  results: T[]
}

interface ListEnvelopeOptions {
  path: string
  page?: unknown
  limit?: unknown
}

const MAX_LIMIT = 100

function toPositiveInt(value: unknown): number | null {
  if (value == null || value === '') return null
  const num = Number(value)
  if (!Number.isFinite(num)) return null
  const int = Math.trunc(num)
  return int >= 1 ? int : null
}

export function buildListEnvelope<T>(rows: T[], options: ListEnvelopeOptions): ListEnvelope<T> {
  const count = rows.length
  const rawLimit = toPositiveInt(options.limit)

  if (!rawLimit) {
    return { info: { count, pages: 1, next: null, prev: null }, results: rows }
  }

  const limit = Math.min(rawLimit, MAX_LIMIT)
  const pages = Math.max(1, Math.ceil(count / limit))
  const page = toPositiveInt(options.page) ?? 1
  const pageUrl = (target: number) => `${options.path}?page=${target}&limit=${limit}`

  return {
    info: {
      count,
      pages,
      next: page < pages ? pageUrl(page + 1) : null,
      prev: page > 1 ? pageUrl(Math.min(page - 1, pages)) : null,
    },
    results: rows.slice((page - 1) * limit, page * limit),
  }
}
```

- [ ] **Step 4: Прогнати тест**

Run: `npx vitest run tests/unit/listEnvelope.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add server/utils/listEnvelope.ts tests/unit/listEnvelope.test.ts
git commit -m "feat(api): buildListEnvelope factory for info/results list responses"
```

---

### Task 2: `toArray()` розгортає `results`

**Files:**
- Modify: `app/composables/toArray.ts`
- Test: `tests/unit/toArray.test.ts` (новий)

**Interfaces:**
- Produces: `toArray<T>(raw: unknown, key?: string): T[]` — сигнатура незмінна; додається розгортання `{ results: [] }` перед наявною логікою Record/масив. Зворотно сумісний з обома старими формами (перехідне вікно CDN-кешу).

- [ ] **Step 1: Написати падаючий тест**

`tests/unit/toArray.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { toArray } from '../../app/composables/toArray'

describe('toArray', () => {
  it('unwraps the info/results envelope', () => {
    const raw = {
      info: { count: 2, pages: 1, next: null, prev: null },
      results: [{ slug: 'a' }, { slug: 'b' }],
    }
    expect(toArray(raw, 'releases')).toEqual([{ slug: 'a' }, { slug: 'b' }])
    expect(toArray(raw)).toEqual([{ slug: 'a' }, { slug: 'b' }])
  })

  it('keeps legacy record-keyed responses working', () => {
    expect(toArray({ a: { slug: 'a' }, b: { slug: 'b' } }))
      .toEqual([{ slug: 'a' }, { slug: 'b' }])
  })

  it('keeps plain arrays working and drops falsy entries', () => {
    expect(toArray([{ slug: 'a' }, null, { slug: 'b' }])).toEqual([{ slug: 'a' }, { slug: 'b' }])
  })

  it('returns [] for empty input', () => {
    expect(toArray(null)).toEqual([])
    expect(toArray(undefined)).toEqual([])
    expect(toArray('nope')).toEqual([])
  })
})
```

- [ ] **Step 2: Переконатися, що тест падає**

Run: `npx vitest run tests/unit/toArray.test.ts`
Expected: FAIL — перший тест повертає `[info, results]` (`Object.values` по envelope).

- [ ] **Step 3: Оновити `toArray`**

`app/composables/toArray.ts` — повний новий вміст:

```ts
export function toArray<T>(raw: unknown, key?: string): T[] {
  if (!raw) return []
  let data = key && typeof raw === 'object' && raw !== null && key in raw
    ? (raw as Record<string, unknown>)[key]
    : raw
  if (
    data && typeof data === 'object' && !Array.isArray(data)
    && Array.isArray((data as { results?: unknown }).results)
  ) {
    data = (data as { results: unknown[] }).results
  }
  if (Array.isArray(data)) return data.filter(Boolean) as T[]
  if (data && typeof data === 'object') return Object.values(data) as T[]
  return []
}
```

- [ ] **Step 4: Прогнати тест**

Run: `npx vitest run tests/unit/toArray.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add app/composables/toArray.ts tests/unit/toArray.test.ts
git commit -m "feat(client): unwrap info/results envelope in toArray"
```

---

### Task 3: `/api/releases` → envelope (TDD-референс для решти)

**Files:**
- Modify: `server/api/releases.get.ts`
- Modify: `tests/unit/releasesApi.test.ts`

**Interfaces:**
- Consumes: `buildListEnvelope` (Task 1).
- Produces: `/api/releases` повертає `ListEnvelope<Release>` в обох режимах; DTO-поля елементів незмінні.

- [ ] **Step 1: Оновити тест на envelope (падає)**

Повний новий вміст `tests/unit/releasesApi.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pickListFields } from '../../server/utils/pickListFields'
import { buildListEnvelope } from '../../server/utils/listEnvelope'

const release = {
  slug: 'va-ocean-scenes-higher-titans',
  title: 'VA Ocean Scenes: Higher Titans',
  cover_xl: '/cover.jpg',
  date: '2009-11-21T12:00:00.000Z',
  visible: true,
  coming_soon: false,
  is_new: false,
  artists: 'irukanji',
  at_playlists: 'sentimony-official',
  style: 'Psytrance',
}

const makeEvent = () => ({ context: {} })

describe('releases API', () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as Record<string, unknown>).defineCachedEventHandler = (handler: unknown) => handler
    ;(globalThis as Record<string, unknown>).catalogCacheOptions = () => ({})
    ;(globalThis as Record<string, unknown>).createError = (input: { statusMessage?: string }) => new Error(input.statusMessage ?? 'Error')
    ;(globalThis as Record<string, unknown>).mapReleaseFromSupabase = (row: Record<string, unknown>) => row
    ;(globalThis as Record<string, unknown>).pickListFields = pickListFields
    ;(globalThis as Record<string, unknown>).buildListEnvelope = buildListEnvelope
    ;(globalThis as Record<string, unknown>).getQuery = () => ({})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of [
      'defineCachedEventHandler',
      'catalogCacheOptions',
      'createError',
      'mapReleaseFromSupabase',
      'pickListFields',
      'buildListEnvelope',
      'getQuery',
      'isSupabaseCatalogSource',
      'useSupabase',
      'fetchFirebaseCollection',
    ]) {
      delete (globalThis as Record<string, unknown>)[key]
    }
  })

  it('wraps Firebase rows into the info/results envelope', async () => {
    ;(globalThis as Record<string, unknown>).isSupabaseCatalogSource = () => false
    ;(globalThis as Record<string, unknown>).fetchFirebaseCollection = vi.fn(async () => ({
      [release.slug]: { ...release, new: release.is_new },
    }))

    const { default: handler } = await import('../../server/api/releases.get')

    await expect(handler(makeEvent())).resolves.toMatchObject({
      info: { count: 1, pages: 1, next: null, prev: null },
      results: [expect.objectContaining({ slug: release.slug, style: 'Psytrance' })],
    })
  })

  it('wraps Supabase rows into the info/results envelope', async () => {
    let selectedFields = ''
    ;(globalThis as Record<string, unknown>).isSupabaseCatalogSource = () => true
    ;(globalThis as Record<string, unknown>).useSupabase = () => ({
      from: () => ({
        select: (fields: string) => {
          selectedFields = fields
          return {
            eq: () => ({
              order: async () => ({
                data: [Object.fromEntries(
                  selectedFields.split(',').map(field => field.trim()).map(field => [field, release[field as keyof typeof release]])
                )],
                error: null,
              }),
            }),
          }
        },
      }),
    })

    const { default: handler } = await import('../../server/api/releases.get')

    await expect(handler(makeEvent())).resolves.toMatchObject({
      info: { count: 1, pages: 1, next: null, prev: null },
      results: [expect.objectContaining({ style: 'Psytrance' })],
    })
  })
})
```

Run: `npx vitest run tests/unit/releasesApi.test.ts`
Expected: FAIL — handler ще повертає Record/масив без envelope.

- [ ] **Step 2: Оновити handler**

Повний новий вміст `server/api/releases.get.ts`:

```ts
export default defineCachedEventHandler(
  async (event) => {
    const { page, limit } = getQuery(event)

    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('releases')
        .select('slug, title, cover_xl, date, visible, coming_soon, is_new, artists, at_playlists, style')
        .eq('visible', true)
        .order('date', { ascending: false })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return buildListEnvelope(data?.map(mapReleaseFromSupabase) ?? [], { path: '/api/releases', page, limit })
    }

    const data = await fetchFirebaseCollection('releases')
    const rows = Object.values(pickListFields(data, ['slug', 'title', 'cover_xl', 'date', 'visible', 'coming_soon', 'new', 'artists', 'at_playlists', 'style'], { visibleOnly: true }))
    return buildListEnvelope(rows, { path: '/api/releases', page, limit })
  },
  catalogCacheOptions()
)
```

(Невикористаний рядок `const isDev = …` з попередньої версії видаляється.)

- [ ] **Step 3: Прогнати тест**

Run: `npx vitest run tests/unit/releasesApi.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 4: Commit**

```bash
git add server/api/releases.get.ts tests/unit/releasesApi.test.ts
git commit -m "feat(api): wrap /api/releases into info/results envelope"
```

---

### Task 4: Решта list-ендпоінтів → envelope

**Files:**
- Modify: `server/api/artists.get.ts`
- Modify: `server/api/artists-all.get.ts`
- Modify: `server/api/videos.get.ts`
- Modify: `server/api/events.get.ts`
- Modify: `server/api/playlists.get.ts`
- Modify: `server/api/friends.get.ts`
- Modify: `server/api/tracks/index.get.ts`

**Interfaces:**
- Consumes: `buildListEnvelope` (Task 1).
- Produces: усі 7 ендпоінтів повертають `ListEnvelope<T>`; DTO-поля, visible-фільтри та сортування незмінні (`artists-all` як і раніше без visible-фільтра).

- [ ] **Step 1: Оновити всі 7 handlers**

`server/api/artists.get.ts` — повний новий вміст:

```ts
export default defineCachedEventHandler(
  async (event) => {
    const { page, limit } = getQuery(event)

    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('artists')
        .select('slug, title, photo_xl, visible, category, category_id')
        .eq('visible', true)
        .order('category_id', { ascending: true })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return buildListEnvelope(data ?? [], { path: '/api/artists', page, limit })
    }

    const data = await fetchFirebaseCollection('artists')
    const rows = Object.values(pickListFields(data, ['slug', 'title', 'photo_xl', 'visible', 'category', 'category_id'], { visibleOnly: true }))
    return buildListEnvelope(rows, { path: '/api/artists', page, limit })
  },
  catalogCacheOptions()
)
```

`server/api/artists-all.get.ts` — повний новий вміст:

```ts
export default defineCachedEventHandler(
  async (event) => {
    const { page, limit } = getQuery(event)

    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('artists')
        .select('slug, title, visible, category, category_id, location')
        .order('category_id', { ascending: true })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return buildListEnvelope(data ?? [], { path: '/api/artists-all', page, limit })
    }

    const data = await fetchFirebaseCollection('artists')
    const rows = Object.values(pickListFields(data, ['slug', 'title', 'visible', 'category', 'category_id', 'location']))
    return buildListEnvelope(rows, { path: '/api/artists-all', page, limit })
  },
  catalogCacheOptions()
)
```

`server/api/videos.get.ts` — повний новий вміст:

```ts
export default defineCachedEventHandler(
  async (event) => {
    const { page, limit } = getQuery(event)

    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('videos')
        .select('slug, title, cover_xl, date, visible')
        .eq('visible', true)
        .order('date', { ascending: false })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return buildListEnvelope(data ?? [], { path: '/api/videos', page, limit })
    }

    const data = await fetchFirebaseCollection('videos')
    const rows = Object.values(pickListFields(data, ['slug', 'title', 'cover_xl', 'date', 'visible'], { visibleOnly: true }))
    return buildListEnvelope(rows, { path: '/api/videos', page, limit })
  },
  catalogCacheOptions()
)
```

`server/api/events.get.ts` — повний новий вміст:

```ts
export default defineCachedEventHandler(
  async (event) => {
    const { page, limit } = getQuery(event)

    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('events')
        .select('slug, title, flyer_a_xl, date, visible, organizer')
        .eq('visible', true)
        .order('date', { ascending: false })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return buildListEnvelope(data ?? [], { path: '/api/events', page, limit })
    }

    const data = await fetchFirebaseCollection('events')
    const rows = Object.values(pickListFields(data, ['slug', 'title', 'flyer_a_xl', 'date', 'visible', 'organizer'], { visibleOnly: true }))
    return buildListEnvelope(rows, { path: '/api/events', page, limit })
  },
  catalogCacheOptions()
)
```

`server/api/playlists.get.ts` — повний новий вміст:

```ts
export default defineCachedEventHandler(
  async (event) => {
    const { page, limit } = getQuery(event)

    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('playlists')
        .select('slug, title, cover_xl, date, visible')
        .eq('visible', true)
        .order('date', { ascending: false })

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return buildListEnvelope(data ?? [], { path: '/api/playlists', page, limit })
    }

    const data = await fetchFirebaseCollection('playlists')
    const rows = Object.values(pickListFields(data, ['slug', 'title', 'cover_xl', 'date', 'visible'], { visibleOnly: true }))
    return buildListEnvelope(rows, { path: '/api/playlists', page, limit })
  },
  catalogCacheOptions()
)
```

`server/api/friends.get.ts` — повний новий вміст:

```ts
export default defineCachedEventHandler(
  async (event) => {
    const { page, limit } = getQuery(event)

    if (isSupabaseCatalogSource()) {
      const { data, error } = await useSupabase()
        .from('friends')
        .select('slug, title, visible')
        .eq('visible', true)

      if (error) throw createError({ statusCode: 500, statusMessage: error.message })
      return buildListEnvelope(data ?? [], { path: '/api/friends', page, limit })
    }

    const data = await fetchFirebaseCollection('friends')
    const rows = Object.values(pickListFields(data, ['slug', 'title', 'visible'], { visibleOnly: true }))
    return buildListEnvelope(rows, { path: '/api/friends', page, limit })
  },
  catalogCacheOptions()
)
```

`server/api/tracks/index.get.ts` — повний новий вміст:

```ts
export default defineCachedEventHandler(async (event) => {
  const { page, limit } = getQuery(event)
  return buildListEnvelope(await fetchAllCatalogTrackRows(), { path: '/api/tracks', page, limit })
}, catalogCacheOptions())
```

- [ ] **Step 2: Прогнати дотичні тести**

Run: `npx vitest run tests/unit/releasesApi.test.ts tests/unit/pickListFields.test.ts tests/unit/catalogTracks.test.ts`
Expected: PASS — `pickListFields`/`fetchAllCatalogTrackRows` не змінювалися, envelope додається поверх.

- [ ] **Step 3: Commit**

```bash
git add server/api/artists.get.ts server/api/artists-all.get.ts server/api/videos.get.ts server/api/events.get.ts server/api/playlists.get.ts server/api/friends.get.ts server/api/tracks/index.get.ts
git commit -m "feat(api): info/results envelope for remaining catalog list endpoints"
```

---

### Task 5: Клієнтські типи та прямі споживачі

**Files:**
- Modify: `app/types/index.ts` (блоки `ReleasesResponse`, `ArtistsResponse`, `VideosResponse`, `EventsResponse`, `PlaylistsResponse`, `FriendsResponse`)
- Modify: `app/pages/tracks.vue:40`
- Modify: `app/pages/release/[id].vue:93`

**Interfaces:**
- Produces: `ListInfo`, `ApiListResponse<T> = { info: ListInfo, results: T[] }` у `app/types/index.ts`; усі `XxxResponse` стають аліасами `ApiListResponse<Xxx>` (імена збережено — композабли `useReleases`/`useArtists`/… та сторінки не змінюються, крім двох файлів нижче).

- [ ] **Step 1: Оновити типи**

У `app/types/index.ts` додати (поруч із наявними response-типами):

```ts
export interface ListInfo {
  count: number
  pages: number
  next: string | null
  prev: string | null
}

export interface ApiListResponse<T> {
  info: ListInfo
  results: T[]
}
```

і замінити кожен із шести wrapper-інтерфейсів виду

```ts
export interface ReleasesResponse {
  releases: Record<string, Release> | Release[]
}
```

на аліас:

```ts
export type ReleasesResponse = ApiListResponse<Release>
```

Аналогічно: `ArtistsResponse = ApiListResponse<Artist>`, `VideosResponse = ApiListResponse<Video>`, `EventsResponse = ApiListResponse<Event>`, `PlaylistsResponse = ApiListResponse<Playlist>`, `FriendsResponse = ApiListResponse<Friend>` (точний поточний вміст кожного блока — за grep `Response` у файлі; форма в усіх шести однакова).

- [ ] **Step 2: `app/pages/tracks.vue` — обгорнути `/api/tracks`**

Замінити:

```ts
const { data: allTracks } = await useFetch<TrackListItem[]>('/api/tracks')
```

на:

```ts
const { data: allTracksRaw } = await useFetch<ApiListResponse<TrackListItem>>('/api/tracks')
const allTracks = computed(() => toArray<TrackListItem>(allTracksRaw.value))
```

і додати `ApiListResponse` до import типів з `~/types`. Наявні використання `allTracks.value ?? []` та `allTracks.value?.length ?? 0` лишаються валідними (computed завжди повертає масив).

- [ ] **Step 3: `app/pages/release/[id].vue` — тип artists-all**

Замінити:

```ts
const allArtistsAsync = useFetch<Record<string, Artist> | Artist[]>('/api/artists-all', { server: false })
```

на:

```ts
const allArtistsAsync = useFetch<ArtistsResponse>('/api/artists-all', { server: false })
```

додавши `ArtistsResponse` до import типів (`toArray` на наступному рядку вже розгортає envelope).

- [ ] **Step 4: Typecheck**

Run: `npx nuxi typecheck`
Expected: без помилок. Якщо падають місця, що читали старі union-форми (`Record | []`) напряму — виправляти саме колсайт через `toArray`, не повертати union.

- [ ] **Step 5: Commit**

```bash
git add app/types/index.ts app/pages/tracks.vue "app/pages/release/[id].vue"
git commit -m "refactor(types): ApiListResponse envelope types for catalog lists"
```

---

### Task 6: `web-debug.mjs` + фінальна верифікація

**Files:**
- Modify: `scripts/web-debug.mjs` (функція `firstSlug`)

- [ ] **Step 1: Оновити `firstSlug`**

Замінити:

```js
function firstSlug(payload) {
  const list = Array.isArray(payload) ? payload : Object.values(payload ?? {})
  const entry = list.find(item => item && typeof item.slug === 'string')
  return entry?.slug ?? null
}
```

на:

```js
function firstSlug(payload) {
  const source = payload && Array.isArray(payload.results) ? payload.results : payload
  const list = Array.isArray(source) ? source : Object.values(source ?? {})
  const entry = list.find(item => item && typeof item.slug === 'string')
  return entry?.slug ?? null
}
```

- [ ] **Step 2: Повна сюїта + typecheck**

Run: `npm run test:unit`
Expected: PASS — базлайн + `listEnvelope` (5) + `toArray` (4); `releasesApi` лишається 2.
Run: `npx nuxi typecheck`
Expected: без помилок.

- [ ] **Step 3: Live smoke в обох режимах**

Із запущеним `npm run dev` (Supabase-режим за замовчуванням):

```bash
curl -s 'http://localhost:3000/api/releases' | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log(j.info, Array.isArray(j.results), j.results.length)})"
curl -s 'http://localhost:3000/api/releases?page=2&limit=20' | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log(j.info, j.results.length)})"
node scripts/web-debug.mjs
```

Expected: перший — `{ count: ~102, pages: 1, next: null, prev: null } true 102`; другий — `pages: 6`, `next: '/api/releases?page=3&limit=20'`, 20 елементів; web-debug — усі маршрути 2xx/3xx.

Потім перезапустити dev у Firebase-режимі й повторити перший curl + web-debug:

```bash
CATALOG_SOURCE=firebase npm run dev
```

Expected: та сама envelope-форма (`results` — масив, не Record). Зупинити dev-сервер.

- [ ] **Step 4: Commit**

```bash
git add scripts/web-debug.mjs
git commit -m "chore(scripts): web-debug reads slugs from envelope results"
```
