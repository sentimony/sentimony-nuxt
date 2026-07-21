# Site Search (⌘K palette) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Client-side search palette (header icon + ⌘K) over all six catalog entities, backed by a cached `/api/search-index` endpoint.

**Architecture:** A cached Nitro endpoint returns a flat lightweight index (`type/slug/title/subtitle`) built from the active catalog source (Firebase or Supabase). The client lazily fetches it on first palette open and filters locally with pure substring matching (diacritics-stripped). UI is a reka-ui `DialogRoot` + `ListboxRoot` dialog mounted once in `app.vue`.

**Tech Stack:** Nuxt 4 / Nitro, reka-ui (`^2.10.1`, auto-imported via `reka-ui/nuxt` — no shadcn-vue), Tailwind v4, vue-sonner, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-21-site-search-design.md`

## Global Constraints

- No new dependencies. No fuzzy-search libraries.
- reka-ui components are auto-imported (`DialogRoot`, `ListboxRoot`, …) — no `~/components/ui` imports for new code.
- Comments in code: English only, and only where non-obvious. Files end with a single trailing newline, 2-space indent.
- Detail routes are `/release/[id]`, `/artist/[id]`, `/track/[id]`, `/video/[id]`, `/event/[id]`, `/playlist/[id]`.
- Verification baseline: `npm run test:unit` (39 files / 161 tests before this work) and `npx nuxi typecheck` (passes with local Supabase env warnings).
- Do not run `npm run sync:*`.
- Nitro auto-imports (`useSupabase`, `fetchFirebaseCollection`, `pickListFields`, `isSupabaseCatalogSource`, `catalogCacheOptions`, `defineCachedEventHandler`, `createError`, `fetchFirebaseCatalogTracks`) are NOT imported in server files — they resolve at build time. Unit tests must shim them on `globalThis` with `vi.resetModules()` + dynamic import (pattern: `tests/unit/likeCountersHandler.test.ts`); prefer testing pure functions that need no shims.

---

### Task 1: Search filter utility (pure client logic)

**Files:**
- Create: `app/utils/searchFilter.ts`
- Test: `tests/unit/searchFilter.test.ts`
- Modify: `app/types/index.ts` (append search types)

**Interfaces:**
- Consumes: nothing.
- Produces (used by Tasks 2–4):
  - types `SearchEntityType`, `SearchIndexEntry`, `SearchResultGroup` exported from `app/types/index.ts`
  - `normalizeSearchText(value: string): string`
  - `filterSearchIndex(entries: SearchIndexEntry[], query: string, perGroupLimit?: number): SearchResultGroup[]`

- [ ] **Step 1: Add types to `app/types/index.ts`**

Append at the end of the file:

```ts
export type SearchEntityType = 'release' | 'artist' | 'track' | 'video' | 'event' | 'playlist'

export interface SearchIndexEntry {
  type: SearchEntityType
  slug: string
  title: string
  subtitle?: string
}

export interface SearchResultGroup {
  type: SearchEntityType
  items: SearchIndexEntry[]
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/unit/searchFilter.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { SearchIndexEntry } from '../../app/types'
import { filterSearchIndex, normalizeSearchText } from '../../app/utils/searchFilter'

const entry = (type: SearchIndexEntry['type'], slug: string, title: string, subtitle?: string): SearchIndexEntry =>
  ({ type, slug, title, ...(subtitle ? { subtitle } : {}) })

describe('normalizeSearchText', () => {
  it('lowercases and strips diacritics', () => {
    expect(normalizeSearchText('Ott — Fairchildren')).toBe('ott — fairchildren')
    expect(normalizeSearchText('Café Müller')).toBe('cafe muller')
  })
})

describe('filterSearchIndex', () => {
  const index: SearchIndexEntry[] = [
    entry('track', 'irukanji-deep-forest', 'Deep Forest', 'Irukanji'),
    entry('artist', 'irukanji', 'Irukanji'),
    entry('release', 'va-fantazma', 'VA «Fantazma»', 'SENCD001'),
    entry('playlist', 'forest-vibes', 'Forest Vibes'),
  ]

  it('returns empty array for an empty or whitespace query', () => {
    expect(filterSearchIndex(index, '')).toEqual([])
    expect(filterSearchIndex(index, '   ')).toEqual([])
  })

  it('matches substring across title, subtitle and slug, case/diacritics-insensitive', () => {
    const groups = filterSearchIndex(index, 'IRUKANJI')
    expect(groups.map(g => g.type)).toEqual(['artist', 'track'])
    expect(filterSearchIndex(index, 'sencd')[0]!.items[0]!.slug).toBe('va-fantazma')
  })

  it('orders groups releases → artists → tracks → videos → events → playlists', () => {
    const groups = filterSearchIndex(index, 'fores')
    expect(groups.map(g => g.type)).toEqual(['track', 'playlist'])
  })

  it('caps items per group', () => {
    const many: SearchIndexEntry[] = Array.from({ length: 12 }, (_, i) =>
      entry('release', `rel-${i}`, `Same Title ${i}`))
    expect(filterSearchIndex(many, 'same title')[0]!.items).toHaveLength(8)
    expect(filterSearchIndex(many, 'same title', 3)[0]!.items).toHaveLength(3)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/searchFilter.test.ts`
Expected: FAIL — cannot resolve `app/utils/searchFilter`.

- [ ] **Step 4: Write the implementation**

Create `app/utils/searchFilter.ts`:

```ts
import type { SearchEntityType, SearchIndexEntry, SearchResultGroup } from '~/types'

const GROUP_ORDER: SearchEntityType[] = ['release', 'artist', 'track', 'video', 'event', 'playlist']

export function normalizeSearchText(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export function filterSearchIndex(
  entries: SearchIndexEntry[],
  query: string,
  perGroupLimit = 8,
): SearchResultGroup[] {
  const needle = normalizeSearchText(query.trim())
  if (!needle) return []

  const groups = new Map<SearchEntityType, SearchIndexEntry[]>()
  for (const entry of entries) {
    const haystack = normalizeSearchText(`${entry.title} ${entry.subtitle ?? ''} ${entry.slug}`)
    if (!haystack.includes(needle)) continue
    const items = groups.get(entry.type) ?? []
    if (items.length >= perGroupLimit) continue
    items.push(entry)
    groups.set(entry.type, items)
  }

  return GROUP_ORDER
    .filter(type => groups.has(type))
    .map(type => ({ type, items: groups.get(type)! }))
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/searchFilter.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add app/types/index.ts app/utils/searchFilter.ts tests/unit/searchFilter.test.ts
git commit -m "feat: search filter utility with normalized substring matching"
```

---

### Task 2: `/api/search-index` endpoint

**Files:**
- Create: `server/utils/searchIndex.ts`
- Create: `server/api/search-index.get.ts`
- Modify: `server/utils/cachePolicy.ts` (add route to `catalogRoutes`)
- Test: `tests/unit/searchIndex.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks (server has its own local entry type — do NOT import from `app/`).
- Produces:
  - `GET /api/search-index` → `SearchIndexEntry[]`-shaped JSON (`{ type, slug, title, subtitle? }[]`) — consumed by Task 3 via `$fetch`.
  - `buildSearchIndexEntries(input: SearchIndexInput): SearchIndexEntry[]` (pure, exported from `server/utils/searchIndex.ts`).

- [ ] **Step 1: Write the failing test for the pure builder**

Create `tests/unit/searchIndex.test.ts` (pure function — no Nitro shims needed):

```ts
import { describe, expect, it } from 'vitest'
import { buildSearchIndexEntries } from '../../server/utils/searchIndex'

describe('buildSearchIndexEntries', () => {
  it('maps all six entity kinds with subtitles for releases and tracks', () => {
    const entries = buildSearchIndexEntries({
      releases: [{ slug: 'va-fantazma', title: 'VA «Fantazma»', cat_no: 'SENCD001' }],
      artists: [{ slug: 'irukanji', title: 'Irukanji' }],
      tracks: [{ slug: 'irukanji-deep', title: 'Deep', artist_name: 'Irukanji' }],
      videos: [{ slug: 'v1', title: 'Video One' }],
      events: [{ slug: 'e1', title: 'Event One' }],
      playlists: [{ slug: 'p1', title: 'Playlist One' }],
    })

    expect(entries).toEqual([
      { type: 'release', slug: 'va-fantazma', title: 'VA «Fantazma»', subtitle: 'SENCD001' },
      { type: 'artist', slug: 'irukanji', title: 'Irukanji' },
      { type: 'track', slug: 'irukanji-deep', title: 'Deep', subtitle: 'Irukanji' },
      { type: 'video', slug: 'v1', title: 'Video One' },
      { type: 'event', slug: 'e1', title: 'Event One' },
      { type: 'playlist', slug: 'p1', title: 'Playlist One' },
    ])
  })

  it('skips rows without slug or title and omits empty subtitles', () => {
    const entries = buildSearchIndexEntries({
      releases: [{ slug: 'no-cat', title: 'No Cat', cat_no: '' }, { slug: '', title: 'Broken' }],
      artists: [{ title: 'No Slug' }],
      tracks: [],
      videos: [],
      events: [],
      playlists: [],
    })

    expect(entries).toEqual([{ type: 'release', slug: 'no-cat', title: 'No Cat' }])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/searchIndex.test.ts`
Expected: FAIL — cannot resolve `server/utils/searchIndex`.

- [ ] **Step 3: Implement `server/utils/searchIndex.ts`**

```ts
type SearchEntityType = 'release' | 'artist' | 'track' | 'video' | 'event' | 'playlist'
type SearchRow = Record<string, unknown>

export interface SearchIndexEntry {
  type: SearchEntityType
  slug: string
  title: string
  subtitle?: string
}

export interface SearchIndexInput {
  releases: SearchRow[]
  artists: SearchRow[]
  tracks: SearchRow[]
  videos: SearchRow[]
  events: SearchRow[]
  playlists: SearchRow[]
}

function toEntry(type: SearchEntityType, row: SearchRow, subtitleKey?: string): SearchIndexEntry | null {
  const slug = typeof row.slug === 'string' ? row.slug : ''
  const title = typeof row.title === 'string' ? row.title : ''
  if (!slug || !title) return null

  const subtitle = subtitleKey && typeof row[subtitleKey] === 'string' ? row[subtitleKey] as string : ''
  return subtitle ? { type, slug, title, subtitle } : { type, slug, title }
}

export function buildSearchIndexEntries(input: SearchIndexInput): SearchIndexEntry[] {
  const sections: Array<[SearchEntityType, SearchRow[], string?]> = [
    ['release', input.releases, 'cat_no'],
    ['artist', input.artists],
    ['track', input.tracks, 'artist_name'],
    ['video', input.videos],
    ['event', input.events],
    ['playlist', input.playlists],
  ]

  return sections.flatMap(([type, rows, subtitleKey]) =>
    rows.map(row => toEntry(type, row, subtitleKey)).filter((entry): entry is SearchIndexEntry => entry !== null))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/searchIndex.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Implement the handler**

Create `server/api/search-index.get.ts` (mirrors the other list handlers; `useSupabase`, `fetchFirebaseCollection`, `pickListFields`, `fetchFirebaseCatalogTracks`, `isSupabaseCatalogSource`, `catalogCacheOptions` are Nitro auto-imports):

```ts
import { buildSearchIndexEntries } from '../utils/searchIndex'

type Rows = Record<string, unknown>[]

async function selectRows(table: string, columns: string): Promise<Rows> {
  const { data, error } = await useSupabase().from(table).select(columns).eq('visible', true)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? []) as Rows
}

async function fetchSupabaseInput() {
  const [releases, artists, tracksResult, videos, events, playlists] = await Promise.all([
    selectRows('releases', 'slug, title, cat_no, visible'),
    selectRows('artists', 'slug, title, visible'),
    useSupabase().from('tracks').select('slug, title, artist_name'),
    selectRows('videos', 'slug, title, visible'),
    selectRows('events', 'slug, title, visible'),
    selectRows('playlists', 'slug, title, visible'),
  ])
  if (tracksResult.error) throw createError({ statusCode: 500, statusMessage: tracksResult.error.message })
  return { releases, artists, tracks: (tracksResult.data ?? []) as Rows, videos, events, playlists }
}

async function fetchFirebaseInput() {
  const [releases, artists, tracksBySlug, videos, events, playlists] = await Promise.all([
    fetchFirebaseCollection('releases'),
    fetchFirebaseCollection('artists'),
    fetchFirebaseCatalogTracks(),
    fetchFirebaseCollection('videos'),
    fetchFirebaseCollection('events'),
    fetchFirebaseCollection('playlists'),
  ])
  return {
    releases: pickListFields(releases, ['slug', 'title', 'cat_no', 'visible'], { visibleOnly: true }),
    artists: pickListFields(artists, ['slug', 'title', 'visible'], { visibleOnly: true }),
    tracks: [...tracksBySlug.values()] as Rows,
    videos: pickListFields(videos, ['slug', 'title', 'visible'], { visibleOnly: true }),
    events: pickListFields(events, ['slug', 'title', 'visible'], { visibleOnly: true }),
    playlists: pickListFields(playlists, ['slug', 'title', 'visible'], { visibleOnly: true }),
  }
}

export default defineCachedEventHandler(
  async () => {
    const input = isSupabaseCatalogSource() ? await fetchSupabaseInput() : await fetchFirebaseInput()
    return buildSearchIndexEntries(input)
  },
  catalogCacheOptions()
)
```

Note: `tracks` has no `visible` column in either backend — the whole table is public catalog data. If `pickListFields` returns a differently-typed array, cast to `Rows` the same way as shown.

- [ ] **Step 6: Add the CDN cache rule**

In `server/utils/cachePolicy.ts`, extend `catalogRoutes` (after `'/api/track/**'`):

```ts
  '/api/track/**',
  '/api/search-index',
] as const
```

- [ ] **Step 7: Verify**

Run: `npx vitest run tests/unit` then `npx nuxi typecheck`
Expected: all unit tests pass; typecheck passes (local Supabase env warnings are OK).
Optionally smoke-test locally: `npm run dev` → `curl -s localhost:3000/api/search-index | head -c 400` returns a JSON array of `{type, slug, title}` objects.

- [ ] **Step 8: Commit**

```bash
git add server/utils/searchIndex.ts server/api/search-index.get.ts server/utils/cachePolicy.ts tests/unit/searchIndex.test.ts
git commit -m "feat: cached /api/search-index endpoint for both catalog sources"
```

---

### Task 3: `useSearch()` composable

**Files:**
- Create: `app/composables/useSearch.ts`

**Interfaces:**
- Consumes: `filterSearchIndex` from `app/utils/searchFilter.ts` (auto-imported by Nuxt from `app/utils`), `GET /api/search-index` (Task 2), `toast` from `vue-sonner`.
- Produces (used by Task 4):
  ```ts
  useSearch(): {
    isOpen: Ref<boolean>
    query: Ref<string>
    results: ComputedRef<SearchResultGroup[]>
    open: () => void
    close: () => void
  }
  ```

- [ ] **Step 1: Implement the composable**

Create `app/composables/useSearch.ts`:

```ts
import { toast } from 'vue-sonner'
import type { SearchIndexEntry } from '~/types'

export function useSearch() {
  const isOpen = useState<boolean>('search-open', () => false)
  const query = useState<string>('search-query', () => '')
  const index = useState<SearchIndexEntry[]>('search-index', () => [])
  const indexLoaded = useState<boolean>('search-index-loaded', () => false)

  async function loadIndex() {
    if (indexLoaded.value) return
    indexLoaded.value = true
    const entries = await $fetch<SearchIndexEntry[]>('/api/search-index').catch(() => {
      // Allow a retry on the next open instead of a session-long empty palette.
      indexLoaded.value = false
      toast.error('Search is unavailable, please try again')
      return []
    })
    index.value = entries
  }

  const results = computed(() => filterSearchIndex(index.value, query.value))

  function open() {
    isOpen.value = true
    loadIndex()
  }

  function close() {
    isOpen.value = false
    query.value = ''
  }

  return { isOpen, query, results, open, close }
}
```

- [ ] **Step 2: Verify**

Run: `npx nuxi typecheck`
Expected: PASS. (Behavior is covered by the Task 1 filter tests plus manual verification in Task 4; the composable is thin state glue.)

- [ ] **Step 3: Commit**

```bash
git add app/composables/useSearch.ts
git commit -m "feat: useSearch composable with lazy index loading"
```

---

### Task 4: SearchDialog UI + header trigger + mount

**Files:**
- Create: `app/components/SearchDialog.vue`
- Modify: `app/app.vue` (mount `<SearchDialog />`)
- Modify: `app/components/Header.vue` (search button)

**Interfaces:**
- Consumes: `useSearch()` (Task 3), reka-ui auto-imported components (`DialogRoot`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `ListboxRoot`, `ListboxContent`, `ListboxItem`), `<Icon name="lucide:…">`.
- Produces: globally mounted palette reacting to ⌘K / Ctrl+K and the header button.

- [ ] **Step 1: Create `app/components/SearchDialog.vue`**

Follow the project's dark-first Tailwind style (borders per instance, `bg-black/60 backdrop-blur`, `font-mono` only for technical values). reka-ui `ListboxRoot` provides arrow-key navigation and Enter selection out of the box:

```vue
<script setup lang="ts">
import type { SearchIndexEntry } from '~/types'

const { isOpen, query, results, open, close } = useSearch()

const groupLabels: Record<SearchIndexEntry['type'], string> = {
  release: 'Releases',
  artist: 'Artists',
  track: 'Tracks',
  video: 'Videos',
  event: 'Events',
  playlist: 'Playlists',
}

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    isOpen.value ? close() : open()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

async function goTo(entry: SearchIndexEntry) {
  close()
  await navigateTo(`/${entry.type}/${entry.slug}`)
}

function onOpenChange(value: boolean) {
  value ? open() : close()
}
</script>

<template>
  <DialogRoot :open="isOpen" @update:open="onOpenChange">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
      <DialogContent
        class="fixed left-1/2 top-24 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 rounded-lg border border-white/20 bg-white/90 dark:bg-black/80 backdrop-blur-md shadow-xl focus:outline-none"
        @open-auto-focus.prevent
      >
        <DialogTitle class="sr-only">Search</DialogTitle>
        <div class="flex items-center gap-2 border-b border-black/10 dark:border-white/10 px-3">
          <Icon name="lucide:search" size="16" class="opacity-50 shrink-0" />
          <input
            v-model="query"
            type="text"
            placeholder="Search releases, artists, tracks…"
            autofocus
            class="w-full bg-transparent py-3 text-sm focus:outline-none placeholder:opacity-50"
          />
          <kbd class="hidden sm:inline font-mono text-[11px] opacity-40 border border-black/20 dark:border-white/20 rounded px-1.5 py-0.5">esc</kbd>
        </div>

        <ListboxRoot v-if="results.length" class="max-h-[60vh] overflow-y-auto p-2" selection-behavior="replace">
          <ListboxContent>
            <template v-for="group in results" :key="group.type">
              <div class="px-2 pt-2 pb-1 text-xs uppercase tracking-wider opacity-50">{{ groupLabels[group.type] }}</div>
              <ListboxItem
                v-for="item in group.items"
                :key="`${item.type}:${item.slug}`"
                :value="`${item.type}:${item.slug}`"
                class="flex items-baseline justify-between gap-3 rounded-md px-2 py-1.5 cursor-pointer data-highlighted:bg-black/10 dark:data-highlighted:bg-white/10"
                @select="goTo(item)"
              >
                <span class="truncate text-sm">{{ item.title }}</span>
                <span v-if="item.subtitle" class="shrink-0 text-xs opacity-50">{{ item.subtitle }}</span>
              </ListboxItem>
            </template>
          </ListboxContent>
        </ListboxRoot>

        <div v-else class="px-4 py-8 text-center text-sm opacity-50">
          {{ query.trim() ? 'No results' : 'Type to search the catalog' }}
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
```

- [ ] **Step 2: Mount once in `app/app.vue`**

Add `<SearchDialog />` next to `<Toaster>`:

```vue
  <Toaster position="top-center" />
  <SearchDialog />
  <AudioBridge />
```

- [ ] **Step 3: Add the header button in `app/components/Header.vue`**

In `<script setup>` add:

```ts
const { open: openSearch } = useSearch()
```

In the template, inside `<div class="flex items-center gap-2">`, immediately before `<ThemeToggle />`:

```vue
          <button
            type="button"
            aria-label="Search (⌘K)"
            class="flex items-center justify-center transition-[background-color] ease-in-out duration-300 hover:bg-white/30 size-9 rounded-md cursor-pointer"
            v-wave
            @click="openSearch"
          >
            <Icon name="lucide:search" size="18" />
          </button>
          <ThemeToggle />
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, then in the browser:
- Header search icon opens the palette; ⌘K (or Ctrl+K) toggles it; Esc closes and clears the query.
- Typing `iruk` shows grouped results (Artists before Tracks); arrow keys highlight; Enter navigates to the detail page and closes the dialog.
- Empty query shows "Type to search the catalog", not the whole catalog.
- Kill the dev server's network to Supabase (or temporarily point `SUPABASE_URL` wrong) only if convenient — otherwise trust the `catch` path from Task 3.

If a browser is needed for verification, use the web-debug skill.

- [ ] **Step 5: Typecheck + full unit suite**

Run: `npx nuxi typecheck && npm run test:unit`
Expected: typecheck passes; 41 files / 167 tests (baseline +2 files / +6 tests) pass.

- [ ] **Step 6: Commit**

```bash
git add app/components/SearchDialog.vue app/components/Header.vue app/app.vue
git commit -m "feat: search palette dialog with header trigger and cmd+k"
```

---

### Task 5: Documentation

**Files:**
- Modify: `AGENTS.md` (add a Search paragraph under Architecture)

**Interfaces:**
- Consumes: everything above (documentation only).
- Produces: nothing.

- [ ] **Step 1: Add a Search section to `AGENTS.md`**

Insert after the **Composables** paragraph in Architecture:

```markdown
**Search.** Client-side palette (header icon + ⌘K): `/api/search-index` (`server/api/search-index.get.ts`, cached like other catalog routes) returns a flat `{ type, slug, title, subtitle? }[]` index for all six entities from the active `catalogSource` (pure mapper `buildSearchIndexEntries()` in `server/utils/searchIndex.ts`). `useSearch()` lazily fetches the index on first open (fetch failure → `toast.error` + retry flag, same pattern as `countsLoaded`); matching is plain normalized substring in `app/utils/searchFilter.ts` (diacritics stripped, 8 results per group, group order releases → artists → tracks → videos → events → playlists). UI: `SearchDialog.vue` on reka-ui `DialogRoot` + `ListboxRoot`, mounted once in `app/app.vue`; no fuzzy library, no `/search` page.
```

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: document site search in AGENTS.md"
```
