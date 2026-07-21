# Profile Aggregation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Один приватний запит `/api/profile/overview` повертає лічильники + першу сторінку кожної непорожньої колекції; секційні сторінки профілю сідають на ці дані без повторного першого запиту.

**Architecture:** Спільні `LIKED_COLLECTIONS` опції → overview handler на базі наявних `countUserLikes`/`fetchLikedItems` (pagination override) → `useProfileOverview()` з дедуплікацією по key → `usePaginatedLikes` з `initialItems`.

**Tech Stack:** Nitro, Supabase (через наявні utils), Vitest.

**Spec:** `docs/superpowers/specs/2026-07-19-profile-aggregation-design.md`

## Global Constraints

- Гілка `json-to-yml`, без git worktrees; без нових залежностей.
- `/api/profile/**` лишається private/no-store (route rules уже покривають — не чіпати).
- `likedItemsHandler`-пагінація (0-based `page`, clamp 1–100) не змінюється.
- `profile/tracks.vue` поза скоупом.
- Юніт-тести серверних handlers мокають auto-imported утиліти через `globalThis` (зразок: `tests/unit/likeCountersHandler.test.ts`).

---

### Task 1: `LIKED_COLLECTIONS` — спільні опції

**Files:**
- Create: `server/utils/likedCollections.ts`
- Modify: `server/api/likes/releases.get.ts`, `server/api/artist-likes/artists.get.ts`, `server/api/track-likes/tracks.get.ts`, `server/api/video-likes/videos.get.ts`, `server/api/playlist-likes/playlists.get.ts`, `server/api/event-likes/events.get.ts`

**Interfaces:**
- Produces: `LIKED_COLLECTIONS: Record<ProfileSectionKey, LikedItemsOptions>` де `ProfileSectionKey = 'releases' | 'tracks' | 'artists' | 'videos' | 'playlists' | 'events'`; `LikedItemsOptions` — наявний тип із `server/utils/likes.ts`.

- [ ] **Step 1: Створити util**

`server/utils/likedCollections.ts` — зібрати **точні** поточні опції з шести endpoint-файлів (переносити 1:1, включно з `entitySelect` і `visibleOnly`; значення нижче — приклад форми за `likes/releases.get.ts`, решту п'ять скопіювати з їхніх файлів при переносі):

```ts
export type ProfileSectionKey = 'releases' | 'tracks' | 'artists' | 'videos' | 'playlists' | 'events'

export const LIKED_COLLECTIONS: Record<ProfileSectionKey, LikedItemsOptions> = {
  releases: {
    table: 'release_likes',
    slugCol: 'release_slug',
    entityTable: 'releases',
    entitySelect: 'slug, title, cover_xl, date',
    visibleOnly: true,
  },
  // tracks, artists, videos, playlists, events — перенести 1:1 із відповідних файлів
}
```

- [ ] **Step 2: Перевести 6 endpoint-файлів**

Кожен файл стає одним рядком, напр. `server/api/likes/releases.get.ts`:

```ts
export default likedItemsHandler(LIKED_COLLECTIONS.releases)
```

- [ ] **Step 3: Тести + typecheck**

Run: `npm run test:unit && npx nuxi typecheck`
Expected: зелено (поведінка endpoints ідентична — перенос конфігурації).

- [ ] **Step 4: Commit**

```bash
git add server/utils/likedCollections.ts server/api/likes/releases.get.ts server/api/artist-likes/artists.get.ts server/api/track-likes/tracks.get.ts server/api/video-likes/videos.get.ts server/api/playlist-likes/playlists.get.ts server/api/event-likes/events.get.ts
git commit -m "refactor(likes): shared LIKED_COLLECTIONS options for liked-items endpoints"
```

---

### Task 2: `/api/profile/overview`

**Files:**
- Create: `server/api/profile/overview.get.ts`
- Test: `tests/unit/profileOverview.test.ts`

**Interfaces:**
- Consumes: `getUserId(event)`, `countUserLikes(table, userId)`, `fetchLikedItems(event, opts, userId, { page: 0, limit: 25 })`, `LIKED_COLLECTIONS`.
- Produces: `{ counts: Record<ProfileSectionKey, number>, collections: Partial<Record<ProfileSectionKey, { data: object[], total: number }>> }`; гість → нульові counts і порожній `collections`.

- [ ] **Step 1: Написати падаючий тест**

`tests/unit/profileOverview.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const GLOBALS = ['defineEventHandler', 'getUserId', 'countUserLikes', 'fetchLikedItems', 'LIKED_COLLECTIONS']

const options = {
  releases: { table: 'release_likes' },
  tracks: { table: 'track_likes' },
  artists: { table: 'artist_likes' },
  videos: { table: 'video_likes' },
  playlists: { table: 'playlist_likes' },
  events: { table: 'event_likes' },
}

describe('/api/profile/overview', () => {
  beforeEach(() => {
    const g = globalThis as Record<string, unknown>
    vi.resetModules()
    g.defineEventHandler = (handler: unknown) => handler
    g.LIKED_COLLECTIONS = options
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of GLOBALS) delete (globalThis as Record<string, unknown>)[key]
  })

  it('returns zero counts and no collections for guests', async () => {
    const g = globalThis as Record<string, unknown>
    g.getUserId = async () => undefined
    g.countUserLikes = vi.fn()
    g.fetchLikedItems = vi.fn()

    const { default: handler } = await import('../../server/api/profile/overview.get')
    const result = await (handler as (e: unknown) => Promise<{ counts: Record<string, number>, collections: object }>)({})

    expect(result.counts).toEqual({ releases: 0, tracks: 0, artists: 0, videos: 0, playlists: 0, events: 0 })
    expect(result.collections).toEqual({})
    expect(g.countUserLikes).not.toHaveBeenCalled()
  })

  it('returns first pages only for non-empty categories', async () => {
    const g = globalThis as Record<string, unknown>
    g.getUserId = async () => 'user-1'
    g.countUserLikes = vi.fn(async (table: string) => (table === 'release_likes' ? 2 : 0))
    g.fetchLikedItems = vi.fn(async () => ({ data: [{ slug: 'a' }, { slug: 'b' }], total: 2 }))

    const { default: handler } = await import('../../server/api/profile/overview.get')
    const result = await (handler as (e: unknown) => Promise<{ counts: Record<string, number>, collections: Record<string, { data: object[], total: number }> }>)({})

    expect(result.counts.releases).toBe(2)
    expect(Object.keys(result.collections)).toEqual(['releases'])
    expect(result.collections.releases).toEqual({ data: [{ slug: 'a' }, { slug: 'b' }], total: 2 })
    expect(g.fetchLikedItems).toHaveBeenCalledTimes(1)
    expect((g.fetchLikedItems as ReturnType<typeof vi.fn>).mock.calls[0][3]).toEqual({ page: 0, limit: 25 })
  })
})
```

Run: `npx vitest run tests/unit/profileOverview.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 2: Реалізувати handler**

`server/api/profile/overview.get.ts`:

```ts
const SECTION_TABLES = {
  releases: 'release_likes',
  tracks: 'track_likes',
  artists: 'artist_likes',
  videos: 'video_likes',
  playlists: 'playlist_likes',
  events: 'event_likes',
} as const

const FIRST_PAGE = { page: 0, limit: 25 }

export default defineEventHandler(async (event) => {
  const userId = await getUserId(event)
  const emptyCounts = { releases: 0, tracks: 0, artists: 0, videos: 0, playlists: 0, events: 0 }
  if (!userId) return { counts: emptyCounts, collections: {} }

  const keys = Object.keys(SECTION_TABLES) as (keyof typeof SECTION_TABLES)[]
  const countValues = await Promise.all(keys.map(key => countUserLikes(SECTION_TABLES[key], userId)))
  const counts = Object.fromEntries(keys.map((key, i) => [key, countValues[i]])) as Record<keyof typeof SECTION_TABLES, number>

  const nonEmpty = keys.filter(key => counts[key] > 0)
  const pages = await Promise.all(
    nonEmpty.map(key => fetchLikedItems(event, LIKED_COLLECTIONS[key], userId, FIRST_PAGE)),
  )
  const collections = Object.fromEntries(nonEmpty.map((key, i) => [key, pages[i]]))

  return { counts, collections }
})
```

(Сигнатуру `fetchLikedItems(event, opts, userIdOverride, pagination)` звірити з `server/utils/likes.ts` при імплементації; якщо `userIdOverride` не третій аргумент — підлаштувати виклик, тест мока — теж.)

- [ ] **Step 3: Прогнати тест**

Run: `npx vitest run tests/unit/profileOverview.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 4: Commit**

```bash
git add server/api/profile/overview.get.ts tests/unit/profileOverview.test.ts
git commit -m "feat(profile): overview endpoint with counts and first collection pages"
```

---

### Task 3: Клієнт — `useProfileOverview` + seed `usePaginatedLikes`

**Files:**
- Create: `app/composables/useProfileOverview.ts`
- Modify: `app/composables/usePaginatedLikes.ts`
- Modify: `app/components/ProfileCollectionPage.vue`
- Modify: `app/pages/profile.vue`, `app/pages/profile/index.vue`, `app/pages/profile/releases.vue`, `app/pages/profile/artists.vue`, `app/pages/profile/videos.vue`, `app/pages/profile/playlists.vue`, `app/pages/profile/events.vue`

**Interfaces:**
- Produces: `useProfileOverview()` → `useFetch<ProfileOverview>('/api/profile/overview', { key: 'profile-overview' })`, `ProfileOverview = { counts: Record<ProfileSectionKey, number>, collections: Partial<Record<ProfileSectionKey, { data: ItemEntity[], total: number }>> }`.
- `usePaginatedLikes<T>(url, limit, initialTotal = 0, initialItems?: T[])` — з `initialItems`: `items` стартує з них, `page = 1`, `loaded = true`.
- `ProfileCollectionPage` отримує новий проп `initialItems?: ItemEntity[]`.

- [ ] **Step 1: Композабл**

`app/composables/useProfileOverview.ts`:

```ts
import type { ItemEntity } from '~/types'
import type { ProfileSummary } from '~/utils/profileSections'

export interface ProfileOverview {
  counts: ProfileSummary
  collections: Partial<Record<keyof ProfileSummary, { data: ItemEntity[], total: number }>>
}

export function useProfileOverview() {
  return useFetch<ProfileOverview>('/api/profile/overview', { key: 'profile-overview' })
}
```

(Якщо тип `ProfileSummary` має іншу форму ключів — звірити з `~/utils/profileSections` і використати його ключі.)

- [ ] **Step 2: `usePaginatedLikes` seed**

У `app/composables/usePaginatedLikes.ts` розширити сигнатуру:

```ts
export function usePaginatedLikes<T extends object>(url: string, limit: number, initialTotal = 0, initialItems?: T[]) {
  const items = ref<T[]>(initialItems ? [...initialItems] : []) as Ref<T[]>
  const total = ref(initialTotal)
  const page = ref(initialItems ? 1 : 0)
  const loading = ref(false)
  const loaded = ref(Boolean(initialItems))
  // решта — без змін
```

- [ ] **Step 3: `ProfileCollectionPage` + сторінки**

`ProfileCollectionPage.vue`: додати проп `initialItems?: ItemEntity[]` і передати четвертим аргументом у `usePaginatedLikes(props.endpoint, 25, props.initialTotal, props.initialItems)`.

Кожна секційна сторінка (на прикладі `profile/releases.vue`):

```vue
<script setup lang="ts">
const { data: overview } = await useProfileOverview()
</script>

<template>
  <ProfileCollectionPage
    title="releases"
    endpoint="/api/likes/releases"
    category="release"
    :initial-total="overview?.counts.releases ?? 0"
    :initial-items="overview?.collections.releases?.data"
  />
</template>
```

Аналогічно artists/videos/playlists/events (свої endpoint/category/ключі). `profile.vue` і `profile/index.vue`: замінити `useProfileSummary()` на `useProfileOverview()` і читати `overview.counts` замість `summary` (форма лічильників та сама).

- [ ] **Step 4: Юніт на seed**

Додати до наявного тестового покриття (або новий `tests/unit/usePaginatedLikes.test.ts`, якщо композабл тестабельний без Nuxt-рантайму — він використовує лише `ref`/`computed`/`$fetch`; `$fetch` мокнути через `globalThis.$fetch`):

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { usePaginatedLikes } from '../../app/composables/usePaginatedLikes'

describe('usePaginatedLikes seeded with initial items', () => {
  afterEach(() => { delete (globalThis as Record<string, unknown>).$fetch })

  it('starts loaded and requests page=1 on loadMore', async () => {
    const fetchMock = vi.fn(async () => ({ data: [{ slug: 'c' }], total: 3 }))
    ;(globalThis as Record<string, unknown>).$fetch = fetchMock

    const likes = usePaginatedLikes<{ slug: string }>('/api/likes/releases', 25, 3, [{ slug: 'a' }, { slug: 'b' }])
    expect(likes.loaded.value).toBe(true)
    expect(likes.items.value).toHaveLength(2)

    await likes.loadMore()
    expect(fetchMock).toHaveBeenCalledWith('/api/likes/releases', { query: { page: 1, limit: 25 } })
    expect(likes.items.value).toHaveLength(3)
  })
})
```

(Якщо `ref`/`computed` недоступні поза Nuxt — додати `import { ref, computed } from 'vue'` у композабл або мокнути auto-imports через `globalThis`, за зразком інших тестів.)

- [ ] **Step 5: Тести + typecheck + live**

Run: `npm run test:unit && npx nuxi typecheck` → зелено.
Live: dev, залогінитись, відкрити `/profile` → Network: один запит `overview`; перейти в секцію releases → без запиту першої сторінки; «load more» тягне `page=1`.

- [ ] **Step 6: Commit**

```bash
git add app/composables/useProfileOverview.ts app/composables/usePaginatedLikes.ts app/components/ProfileCollectionPage.vue app/pages/profile.vue app/pages/profile/index.vue app/pages/profile/releases.vue app/pages/profile/artists.vue app/pages/profile/videos.vue app/pages/profile/playlists.vue app/pages/profile/events.vue tests/unit/usePaginatedLikes.test.ts
git commit -m "feat(profile): hydrate collections from single overview request"
```

---

### Task 4: Доля `/api/profile/summary`

- [ ] **Step 1: Перевірити споживачів**

Run: `grep -rn "profile/summary\|useProfileSummary" app/ server/ tests/`
Якщо споживачів не лишилось — видалити `server/api/profile/summary.get.ts` і `app/composables/useProfileSummary.ts`; якщо лишились (наприклад, `profile/tracks.vue`) — залишити обидва і зафіксувати в PR, що видалення відбудеться разом із міграцією tracks-сторінки.

- [ ] **Step 2: Тести + commit**

Run: `npm run test:unit && npx nuxi typecheck` → зелено.

```bash
git add -A
git commit -m "chore(profile): retire summary endpoint (or document remaining consumers)"
```
