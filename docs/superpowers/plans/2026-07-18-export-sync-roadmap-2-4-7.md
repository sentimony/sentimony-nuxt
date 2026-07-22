# Export Sync Adaptation + ROADMAP 2/4/7 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Адаптувати сінк-скрипти до нової (масивної) структури `server/data/sentimony-db-export.json` і закрити ROADMAP пункти 2 (`/tracks` contract — верифікація), 7 (`track_artists` нормалізація) та 4 (`like_counters` замість `like_count` у кешованих DTO).

**Architecture:** Канонічний export: `artists`/`tracks`/`videos`/`events`/`friends` — масиви, `releases`/`playlists` — об'єкти за slug. Firebase зберігає об'єкти за slug (конвертація на межі сінку), Supabase — рядки таблиць. Нові Supabase-таблиці: `track_artists` (похідна від CSV `artist_slug`, наповнюється сінком) і `like_counters` (агрегат, підтримується RPC `increment_like`). Firebase read paths не змінюються (рішення: minimal support).

**Tech Stack:** Nuxt 4 / Nitro, Supabase (supabase-js v2, plpgsql міграції), Firebase RTDB REST, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-18-export-sync-roadmap-2-4-7-design.md`

## Global Constraints

- Гілка: працювати в `json-to-yml`, без worktrees (заборонено AGENTS.md).
- НЕ запускати `npm run sync:supabase` / `npm run sync:firebase` без явного дозволу користувача — вони пишуть у remote. `--dry-run`-режими та read-only перевірки дозволені.
- Міграції НЕ застосовувати до remote Supabase в рамках тасок — тільки створити файли; застосування в секції Rollout (робить користувач або агент із дозволу).
- Стиль: 2 пробіли, один trailing newline, без trailing whitespace; коментарі в коді — англійською і лише для неочевидного.
- Тести: `npx vitest run tests/unit/<file>` для одного файлу, `npm run test:unit` для всієї сюїти (базлайн до змін: 34 files / 146 tests). Typecheck: `npx nuxi typecheck` (локальні warnings про відсутні Supabase env — норма).
- Юніт-тести серверних handlers мокають auto-imported утиліти через `globalThis` (зразок: `tests/unit/releasesApi.test.ts`).
- Не додавати нових npm-залежностей.

---

### Task 1: `sync-firebase.mjs` — об'єкти за slug + `--dry-run`

**Files:**
- Modify: `scripts/sync-firebase.mjs` (повна заміна вмісту)

**Interfaces:**
- Consumes: `server/data/sentimony-db-export.json` (нова структура: масиви + об'єкти).
- Produces: Firebase-колекції `releases`, `artists`, `tracks`, `videos`, `playlists`, `events`, `friends` — усі об'єкти за slug. `--dry-run` друкує к-ть ключів і зразки без мережі й без секрету.

- [ ] **Step 1: Переписати скрипт**

Повний новий вміст `scripts/sync-firebase.mjs`:

```js
import { readFileSync } from 'fs'

const dbUrl = process.env.FIREBASE_BASE_URL || 'https://sentimony-db.firebaseio.com'
const secret = process.env.FIREBASE_DB_SECRET
const isDryRun = process.argv.includes('--dry-run')

const data = JSON.parse(readFileSync('server/data/sentimony-db-export.json', 'utf-8'))

// Firebase stores every collection as an object keyed by slug; the local
// export keeps artists/tracks/videos/events/friends as arrays.
function bySlug(rows) {
  return Object.fromEntries(rows.map(row => [row.slug, row]))
}

const tracks = bySlug(data.tracks.map(t => ({
  slug: t.slug,
  title: t.title,
  artist_name: t.artist_name,
  artist_slug: t.artist_slug,
  ...(t.bpm != null ? { bpm: t.bpm } : {}),
  ...(t.audio_url ? { audio_url: t.audio_url } : {}),
})))

const collections = {
  releases: data.releases,
  artists: bySlug(data.artists),
  tracks,
  videos: bySlug(data.videos),
  playlists: data.playlists,
  events: bySlug(data.events),
  friends: bySlug(data.friends),
}

if (isDryRun) {
  for (const [name, rows] of Object.entries(collections)) {
    const keys = Object.keys(rows)
    console.log(`${name}: ${keys.length} keys, sample: ${keys.slice(0, 3).join(', ')}`)
  }
  process.exit(0)
}

if (!secret) {
  console.error('FIREBASE_DB_SECRET is required')
  process.exit(1)
}

async function sync(collection, rows) {
  const res = await fetch(`${dbUrl}/${collection}.json?auth=${secret}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rows),
  })
  if (!res.ok) {
    console.error(`${collection} error:`, await res.text())
    process.exit(1)
  }
  console.log(`Synced ${Object.keys(rows).length} ${collection}`)
}

for (const [name, rows] of Object.entries(collections)) {
  await sync(name, rows)
}
```

- [ ] **Step 2: Перевірити dry-run**

Run: `node scripts/sync-firebase.mjs --dry-run`
Expected: 7 рядків; серед них `artists: 242 keys, sample: irukanji, harax, sphingida` і `tracks: 770 keys, sample: 01-space-organ-occult-melodies, …` — ключі є slug-ами, НЕ числами (`0, 1, 2`). Exit code 0, жодного мережевого запиту, секрет не потрібен.

- [ ] **Step 3: Commit**

```bash
git add scripts/sync-firebase.mjs
git commit -m "fix(sync): key firebase collections by slug for array-shaped export"
```

---

### Task 2: `sync-field.mjs` — локальне дзеркало для масивних колекцій

**Files:**
- Modify: `scripts/sync-field.mjs:118`

**Interfaces:**
- Consumes: export із мішаною структурою (масиви + об'єкти).
- Produces: локальне дзеркало знаходить запис і в масивних, і в об'єктних колекціях. Supabase-частина без змін. `scripts/sync-track-audio.mjs` (делегує сюди) лагодиться автоматично.

- [ ] **Step 1: Замінити lookup**

У `scripts/sync-field.mjs` замінити рядок 118:

```js
      const record = db[table]?.[slug]
```

на:

```js
      const collection = db[table]
      const record = Array.isArray(collection)
        ? collection.find(row => row?.slug === slug)
        : collection?.[slug]
```

- [ ] **Step 2: Перевірити dry-run на масивній таблиці**

Run: `npm run sync:field -- --dry-run tracks 36-a-final-thought bpm=119`
Expected: вивід містить `tracks/36-a-final-thought: bpm=119` і НЕ містить `! not in local export`. Якщо Supabase env присутні — завершується `Dry run — no Supabase writes performed.`; якщо відсутні — помилка `Missing Supabase env` ПІСЛЯ рядків локального дзеркала (це очікувано, перевіряємо саме дзеркало).

- [ ] **Step 3: Перевірити dry-run на об'єктній таблиці (регресія)**

Run: `npm run sync:field -- --dry-run releases va-fantazma visible=true`
Expected: без `! not in local export`.

- [ ] **Step 4: Commit**

```bash
git add scripts/sync-field.mjs
git commit -m "fix(sync): local mirror lookup for array-shaped export tables"
```

---

### Task 3: Видалити одноразовий `migrate-tracks-export.mjs`

**Files:**
- Delete: `scripts/migrate-tracks-export.mjs`

- [ ] **Step 1: Переконатися, що на нього ніхто не посилається**

Run: `grep -rn "migrate-tracks-export" package.json scripts/ AGENTS.md .github/ 2>/dev/null`
Expected: порожній вивід (перевірено при плануванні).

- [ ] **Step 2: Видалити і закомітити**

```bash
git rm scripts/migrate-tracks-export.mjs
git commit -m "chore(scripts): drop one-shot tracks migration that regenerates old export shape"
```

---

### Task 4: `sitemapUrls.ts` — масивні типи + фікстура

**Files:**
- Modify: `server/utils/sitemapUrls.ts`
- Modify: `server/api/__sitemap__/urls.get.ts:5`
- Test: `tests/unit/sitemapUrls.test.ts`

**Interfaces:**
- Produces: `SitemapCatalogExport` — `artists`/`tracks`/`videos`/`events`/`friends` як масиви, `releases`/`playlists` як `Record`. Сигнатура `buildSitemapUrls(catalog: SitemapCatalogExport): SitemapUrlEntry[]` не змінюється.

- [ ] **Step 1: Оновити фікстуру тесту на масивну форму**

У `tests/unit/sitemapUrls.test.ts` замінити блоки `tracks`, `artists`, `videos`, `events`, `friends` фікстури (рядки 19–42) на:

```ts
  tracks: [
    { slug: 'test-artist-opening-track' },
    { slug: 'test-artist-second-track' },
    { slug: 'hidden-artist-should-not-appear' },
  ],
  artists: [
    { slug: 'irukanji', visible: true },
    { slug: 'hidden', visible: false },
  ],
  videos: [
    { slug: 'visible-video', visible: true, date: '2021-05-01T00:00:00.000Z' },
    { slug: 'hidden-video', visible: false },
  ],
  events: [
    { slug: 'visible-event', visible: true, date: '2022-03-01T00:00:00.000Z' },
  ],
  friends: [
    { slug: 'visible-friend', visible: true },
    { slug: 'hidden-friend', visible: false },
  ],
```

Блоки `releases` і `playlists` лишити як є (об'єкти).

- [ ] **Step 2: Переконатися, що тест падає (тип не збігається)**

Run: `npx vitest run tests/unit/sitemapUrls.test.ts`
Expected: FAIL / TS-помилка — фікстура більше не відповідає `Record<string, …>`.

- [ ] **Step 3: Оновити `server/utils/sitemapUrls.ts`**

Замінити типи й хелпери (рядки 18–83) на:

```ts
export interface SitemapCatalogExport {
  releases: Record<string, CatalogRelease>
  artists: CatalogEntity[]
  tracks: { slug: string }[]
  videos: CatalogEntity[]
  playlists: Record<string, CatalogEntity>
  events: CatalogEntity[]
  friends: CatalogEntity[]
}
```

(`SitemapUrlEntry`, `CatalogEntity`, `CatalogRelease`, `STATIC_PAGE_URLS` — без змін.)

```ts
function entitiesOf<T extends CatalogEntity>(collection: Record<string, T> | T[] | undefined): T[] {
  if (!collection) return []
  return Array.isArray(collection) ? collection : Object.values(collection)
}

function visibleEntities<T extends CatalogEntity>(collection: Record<string, T> | T[] | undefined): T[] {
  return entitiesOf(collection).filter(entity => entity?.visible === true)
}

function lastmodOf(entity: CatalogEntity): string | undefined {
  return typeof entity.date === 'string' && entity.date ? entity.date : undefined
}

function buildDetailUrls(collection: Record<string, CatalogEntity> | CatalogEntity[], pathPrefix: string): SitemapUrlEntry[] {
  return visibleEntities(collection).map(entity => ({
    loc: `${pathPrefix}/${entity.slug}`,
    lastmod: lastmodOf(entity),
    changefreq: 'monthly',
    priority: 0.6,
  }))
}

function buildTrackUrls(
  tracks: { slug: string }[],
  releases: Record<string, CatalogRelease>,
): SitemapUrlEntry[] {
  const lastmodByTrack = new Map<string, string | undefined>()

  for (const release of visibleEntities(releases)) {
    for (const slug of Array.isArray(release.tracklist) ? release.tracklist : []) {
      if (typeof slug !== 'string') continue
      if (!lastmodByTrack.has(slug)) lastmodByTrack.set(slug, lastmodOf(release))
    }
  }

  return (tracks ?? [])
    .filter(track => lastmodByTrack.has(track.slug))
    .map(track => ({
      loc: `/track/${track.slug}`,
      lastmod: lastmodByTrack.get(track.slug),
      changefreq: 'monthly' as const,
      priority: 0.5 as const,
    }))
}
```

`buildSitemapUrls` — без змін (сигнатури хелперів сумісні).

- [ ] **Step 4: Спростити каст у endpoint**

У `server/api/__sitemap__/urls.get.ts` замінити:

```ts
  return buildSitemapUrls(catalogExport as unknown as SitemapCatalogExport)
```

на:

```ts
  return buildSitemapUrls(catalogExport as SitemapCatalogExport)
```

Якщо `npx nuxi typecheck` на цьому рядку видасть помилку недостатнього перекриття типів (JSON literal types) — повернути `as unknown as` і зафіксувати це в коміт-повідомленні; тип фікстури все одно лишається жорстким.

- [ ] **Step 5: Прогнати тести й typecheck**

Run: `npx vitest run tests/unit/sitemapUrls.test.ts tests/unit/sitemapEndpoint.test.ts`
Expected: PASS (обидва).
Run: `npx nuxi typecheck`
Expected: без помилок (Supabase env warnings — ок).

- [ ] **Step 6: Commit**

```bash
git add server/utils/sitemapUrls.ts server/api/__sitemap__/urls.get.ts tests/unit/sitemapUrls.test.ts
git commit -m "fix(sitemap): type catalog export collections as arrays"
```

---

### Task 5: Тест `fetchAllCatalogTrackRows` + закриття ROADMAP §2

**Files:**
- Create: `tests/unit/catalogTracks.test.ts`
- Modify: `docs/roadmap/completed.md`

**Interfaces:**
- Consumes: `fetchAllCatalogTrackRows(): Promise<ReleaseTrackRow[]>` з `server/utils/catalogTracks.ts` (глобальні залежності: `isSupabaseCatalogSource`, `useSupabase`, `supabaseAdmin`, `createError`).

- [ ] **Step 1: Написати тест**

Створити `tests/unit/catalogTracks.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const releases = [
  { slug: 'release-old', date: '2020-01-01T00:00:00.000Z', tracklist: ['track-one', 'track-two'] },
  { slug: 'release-new', date: '2021-01-01T00:00:00.000Z', tracklist: ['track-three'] },
]

const trackRows = [
  { slug: 'track-one', title: 'One', artist_name: 'A', artist_slug: 'a', bpm: 100, audio_url: null },
  { slug: 'track-two', title: 'Two', artist_name: 'B', artist_slug: 'b', bpm: null, audio_url: 'https://cdn/two.mp3' },
  { slug: 'track-three', title: 'Three', artist_name: 'A', artist_slug: 'a', bpm: 120, audio_url: null },
]

describe('fetchAllCatalogTrackRows (tracks page data contract)', () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as Record<string, unknown>).createError = (input: { statusMessage?: string }) => new Error(input.statusMessage ?? 'Error')
    ;(globalThis as Record<string, unknown>).isSupabaseCatalogSource = () => true
    ;(globalThis as Record<string, unknown>).useSupabase = () => ({
      from: () => ({
        select: () => ({ eq: async () => ({ data: releases, error: null }) }),
      }),
    })
    ;(globalThis as Record<string, unknown>).supabaseAdmin = () => ({
      from: () => ({ select: async () => ({ data: trackRows, error: null }) }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of ['createError', 'isSupabaseCatalogSource', 'useSupabase', 'supabaseAdmin']) {
      delete (globalThis as Record<string, unknown>)[key]
    }
  })

  it('returns a non-empty row per tracklist entry with derived track numbers', async () => {
    const { fetchAllCatalogTrackRows } = await import('../../server/utils/catalogTracks')
    const rows = await fetchAllCatalogTrackRows()

    expect(rows).toHaveLength(3)
    expect(rows[0]).toMatchObject({ slug: 'track-three', release_slug: 'release-new', track_number: 1 })
    expect(rows[1]).toMatchObject({ slug: 'track-one', release_slug: 'release-old', track_number: 1 })
    expect(rows[2]).toMatchObject({ slug: 'track-two', release_slug: 'release-old', track_number: 2 })
  })

  it('keeps track payload fields used by the tracks page', async () => {
    const { fetchAllCatalogTrackRows } = await import('../../server/utils/catalogTracks')
    const rows = await fetchAllCatalogTrackRows()

    expect(rows[2]).toMatchObject({ artist_slug: 'b', bpm: null, audio_url: 'https://cdn/two.mp3' })
  })
})
```

- [ ] **Step 2: Прогнати тест**

Run: `npx vitest run tests/unit/catalogTracks.test.ts`
Expected: PASS (контракт уже виконується — це верифікаційний тест, не fix).

- [ ] **Step 3: Закрити пункт 2 у ROADMAP**

У `docs/roadmap/completed.md` додати в кінець розділу `## Закрито з попередніх аудитів` рядок:

```markdown
- `/tracks` data contract закрито: сторінка споживає `/api/tracks` (`fetchAllCatalogTrackRows`) з `track_number`/`bpm`/`audio_url`, а не `tracklistCompact` з `useReleases()`; контракт покрито `tests/unit/catalogTracks.test.ts`.
```

Нумерацію решти секцій не чіпати.

- [ ] **Step 4: Live smoke `/tracks`**

Run: `npm run dev` (окремий термінал або фоном), відкрити `http://localhost:3000/tracks` через web-debug скіл або перевірити API: `curl -s http://localhost:3000/api/tracks | head -c 300`
Expected: непорожній JSON-масив треків. Зупинити dev-сервер після перевірки.

- [ ] **Step 5: Commit**

```bash
git add tests/unit/catalogTracks.test.ts docs/roadmap/completed.md
git commit -m "test(tracks): cover /api/tracks data contract, close roadmap item 2"
```

---

### Task 6: Міграція `track_artists`

**Files:**
- Create: `supabase/migrations/20260718_track_artists.sql`

**Interfaces:**
- Produces: таблиця `public.track_artists(track_slug, artist_slug, position)` з PK `(track_slug, artist_slug)`, індексом за `artist_slug`, каскадом від `tracks`, public-read RLS. Застосування — у секції Rollout, НЕ в цій тасці.

- [ ] **Step 1: Створити міграцію**

`supabase/migrations/20260718_track_artists.sql`:

```sql
-- Normalized track<->artist links, derived from the CSV artist_slug column of
-- the catalog export by scripts/sync-supabase.mjs. No FK to artists: track CSVs
-- occasionally reference guest artists that have no row in the artists table.
create table if not exists public.track_artists (
  track_slug text not null references public.tracks(slug) on delete cascade,
  artist_slug text not null,
  position integer not null,
  primary key (track_slug, artist_slug)
);

create index if not exists track_artists_artist_slug_idx
  on public.track_artists (artist_slug);

alter table public.track_artists enable row level security;

drop policy if exists "track_artists_public_read" on public.track_artists;
create policy "track_artists_public_read" on public.track_artists
  for select using (true);

grant select on public.track_artists to anon, authenticated;
grant all on public.track_artists to service_role;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260718_track_artists.sql
git commit -m "feat(db): track_artists join table for normalized track-artist links"
```

---

### Task 7: `buildTrackArtistRows` + наповнення в `sync-supabase.mjs`

**Files:**
- Create: `scripts/lib/track-artists.mjs`
- Create: `scripts/lib/track-artists.d.mts`
- Modify: `scripts/sync-supabase.mjs`
- Test: `tests/unit/trackArtistRows.test.ts`

**Interfaces:**
- Produces: `buildTrackArtistRows(tracks: Array<{ slug: string, artist_slug?: string | null }>): Array<{ track_slug: string, artist_slug: string, position: number }>` — чиста функція, спліт CSV, trim, dedup, пропуск порожніх.

- [ ] **Step 1: Написати падаючий тест**

`tests/unit/trackArtistRows.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildTrackArtistRows } from '../../scripts/lib/track-artists.mjs'

describe('buildTrackArtistRows', () => {
  it('splits a multi-artist CSV preserving order via position', () => {
    expect(buildTrackArtistRows([
      { slug: 'collab-track', artist_slug: 'zymosis, cj-art' },
    ])).toEqual([
      { track_slug: 'collab-track', artist_slug: 'zymosis', position: 0 },
      { track_slug: 'collab-track', artist_slug: 'cj-art', position: 1 },
    ])
  })

  it('produces no rows for empty or missing artist_slug', () => {
    expect(buildTrackArtistRows([
      { slug: 'orphan-track', artist_slug: '' },
      { slug: 'null-track', artist_slug: null },
    ])).toEqual([])
  })

  it('trims entries and drops duplicate artists within one track', () => {
    expect(buildTrackArtistRows([
      { slug: 't', artist_slug: ' zymosis ,, zymosis , cj-art' },
    ])).toEqual([
      { track_slug: 't', artist_slug: 'zymosis', position: 0 },
      { track_slug: 't', artist_slug: 'cj-art', position: 1 },
    ])
  })
})
```

- [ ] **Step 2: Переконатися, що тест падає**

Run: `npx vitest run tests/unit/trackArtistRows.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Реалізувати хелпер**

`scripts/lib/track-artists.mjs`:

```js
export function buildTrackArtistRows(tracks) {
  return tracks.flatMap((track) => {
    const slugs = [...new Set(
      String(track.artist_slug ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    )]
    return slugs.map((artist_slug, index) => ({
      track_slug: track.slug,
      artist_slug,
      position: index,
    }))
  })
}
```

`scripts/lib/track-artists.d.mts`:

```ts
export function buildTrackArtistRows(
  tracks: Array<{ slug: string, artist_slug?: string | null }>,
): Array<{ track_slug: string, artist_slug: string, position: number }>
```

- [ ] **Step 4: Прогнати тест**

Run: `npx vitest run tests/unit/trackArtistRows.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Підключити в `sync-supabase.mjs`**

Додати імпорт першим рядком після наявних:

```js
import { buildTrackArtistRows } from './lib/track-artists.mjs'
```

Після рядка `await sync('tracks', tracks)` (перед `await sync('videos', videos)`) вставити:

```js
const trackArtistRows = buildTrackArtistRows(tracks)
const desiredPairs = new Set(trackArtistRows.map(r => `${r.track_slug}\0${r.artist_slug}`))
const { data: existingPairs, error: pairsError } = await supabase
  .from('track_artists')
  .select('track_slug, artist_slug')
if (pairsError) { console.error('track_artists read error:', pairsError.message); process.exit(1) }
const stalePairs = (existingPairs ?? []).filter(p => !desiredPairs.has(`${p.track_slug}\0${p.artist_slug}`))
const staleByTrack = new Map()
for (const p of stalePairs) {
  if (!staleByTrack.has(p.track_slug)) staleByTrack.set(p.track_slug, [])
  staleByTrack.get(p.track_slug).push(p.artist_slug)
}
for (const [trackSlug, artistSlugs] of staleByTrack) {
  const { error } = await supabase
    .from('track_artists')
    .delete()
    .eq('track_slug', trackSlug)
    .in('artist_slug', artistSlugs)
  if (error) { console.error('track_artists cleanup error:', error.message); process.exit(1) }
}
if (stalePairs.length) console.log(`Removed ${stalePairs.length} stale track_artists`)
for (let i = 0; i < trackArtistRows.length; i += 200) {
  const { error } = await supabase
    .from('track_artists')
    .upsert(trackArtistRows.slice(i, i + 200), { onConflict: 'track_slug,artist_slug' })
  if (error) { console.error('track_artists error:', error.message); process.exit(1) }
}
console.log(`Synced ${trackArtistRows.length} track_artists`)
```

- [ ] **Step 6: Syntax check (без запуску сінку!)**

Run: `node --check scripts/sync-supabase.mjs && node --check scripts/lib/track-artists.mjs`
Expected: без виводу, exit 0. НЕ запускати сам сінк.

- [ ] **Step 7: Commit**

```bash
git add scripts/lib/track-artists.mjs scripts/lib/track-artists.d.mts scripts/sync-supabase.mjs tests/unit/trackArtistRows.test.ts
git commit -m "feat(sync): populate track_artists from CSV artist_slug"
```

---

### Task 8: Server utils `trackArtists` + indexed similar tracks у `/api/track/[id]`

**Files:**
- Create: `server/utils/trackArtists.ts`
- Modify: `server/api/track/[id].get.ts:32-59`
- Test: `tests/unit/trackApiSimilar.test.ts`

**Interfaces:**
- Produces (auto-imported Nitro server utils):
  - `fetchTrackArtistSlugs(trackSlug: string): Promise<string[]>` — artist slugs трека з `track_artists`, впорядковані за `position`;
  - `fetchCoArtistTrackSlugs(artistSlugs: string[]): Promise<Set<string>>` — slug-и всіх треків цих артистів;
  - `fetchArtistTrackSlugs(artistSlug: string): Promise<Set<string>>` — для Task 9.
- Consumes: глобальні `supabaseAdmin`, `createError`.
- Поведінковий контракт: у Supabase-режимі при порожній `track_artists` (до першого сінку) — fallback на CSV; Firebase-режим — CSV без запитів до Supabase. Форма відповіді endpoint не змінюється.

- [ ] **Step 1: Написати падаючий тест**

`tests/unit/trackApiSimilar.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const rows = [
  { slug: 'main-track', title: 'Main', artist_name: 'Zymosis', artist_slug: 'zymosis', bpm: 100, audio_url: null, release_slug: 'rel-1', track_number: 1 },
  { slug: 'alias-track', title: 'Alias', artist_name: 'E.R.S.', artist_slug: 'ers', bpm: 90, audio_url: null, release_slug: 'rel-1', track_number: 2 },
  { slug: 'csv-track', title: 'Csv', artist_name: 'Zymosis', artist_slug: 'zymosis', bpm: 85, audio_url: null, release_slug: 'rel-1', track_number: 3 },
  { slug: 'unrelated-track', title: 'Other', artist_name: 'Other', artist_slug: 'other', bpm: 80, audio_url: null, release_slug: 'rel-1', track_number: 4 },
]

const releaseRow = { slug: 'rel-1', date: '2020-01-01T00:00:00.000Z', visible: true }

const GLOBALS = [
  'defineCachedEventHandler', 'catalogCacheOptions', 'createError',
  'fetchAllCatalogTrackRows', 'isSupabaseCatalogSource', 'useSupabase',
  'mapReleaseFromSupabase', 'supabaseAdmin', 'fetchLikeCount',
  'fetchTrackArtistSlugs', 'fetchCoArtistTrackSlugs',
  'fetchFirebaseEntitiesBySlugs', 'isPublicEntity',
]

function makeEvent(id: string) {
  return { context: { params: { id } } }
}

describe('track detail similar tracks', () => {
  beforeEach(() => {
    const g = globalThis as Record<string, unknown>
    vi.resetModules()
    g.defineCachedEventHandler = (handler: unknown) => handler
    g.catalogCacheOptions = () => ({})
    g.createError = (input: { statusMessage?: string }) => new Error(input.statusMessage ?? 'Error')
    g.fetchAllCatalogTrackRows = async () => rows
    g.mapReleaseFromSupabase = (row: Record<string, unknown>) => row
    g.fetchLikeCount = async () => 0
    g.useSupabase = () => ({
      from: () => ({
        select: () => ({ in: () => ({ eq: async () => ({ data: [releaseRow], error: null }) }) }),
      }),
    })
    g.supabaseAdmin = () => ({
      from: () => ({
        select: () => ({ in: async () => ({ data: [{ slug: 'zymosis', title: 'Zymosis' }], error: null }) }),
      }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of GLOBALS) delete (globalThis as Record<string, unknown>)[key]
  })

  it('uses track_artists links in Supabase mode (catches CSV alias mismatches)', async () => {
    const g = globalThis as Record<string, unknown>
    g.isSupabaseCatalogSource = () => true
    g.fetchTrackArtistSlugs = vi.fn(async () => ['zymosis'])
    g.fetchCoArtistTrackSlugs = vi.fn(async () => new Set(['main-track', 'alias-track']))

    const { default: handler } = await import('../../server/api/track/[id].get')
    const result = await (handler as (e: unknown) => Promise<{ similarTracks: { slug: string }[] }>)(makeEvent('main-track'))

    expect(result.similarTracks.map(t => t.slug)).toEqual(['alias-track'])
    expect(g.fetchCoArtistTrackSlugs).toHaveBeenCalledWith(['zymosis'])
  })

  it('falls back to CSV matching when track_artists is empty', async () => {
    const g = globalThis as Record<string, unknown>
    g.isSupabaseCatalogSource = () => true
    g.fetchTrackArtistSlugs = vi.fn(async () => [])
    g.fetchCoArtistTrackSlugs = vi.fn(async () => new Set<string>())

    const { default: handler } = await import('../../server/api/track/[id].get')
    const result = await (handler as (e: unknown) => Promise<{ similarTracks: { slug: string }[] }>)(makeEvent('main-track'))

    expect(result.similarTracks.map(t => t.slug)).toEqual(['csv-track'])
  })

  it('keeps CSV matching in Firebase mode without querying track_artists', async () => {
    const g = globalThis as Record<string, unknown>
    g.isSupabaseCatalogSource = () => false
    g.isPublicEntity = () => true
    g.fetchFirebaseEntitiesBySlugs = async (collection: string) =>
      collection === 'releases' ? [releaseRow] : [{ slug: 'zymosis', title: 'Zymosis' }]
    g.fetchTrackArtistSlugs = vi.fn(async () => ['must-not-be-called'])
    g.fetchCoArtistTrackSlugs = vi.fn(async () => new Set(['must-not-be-called']))

    const { default: handler } = await import('../../server/api/track/[id].get')
    const result = await (handler as (e: unknown) => Promise<{ similarTracks: { slug: string }[] }>)(makeEvent('main-track'))

    expect(result.similarTracks.map(t => t.slug)).toEqual(['csv-track'])
    expect(g.fetchTrackArtistSlugs).not.toHaveBeenCalled()
    expect(g.fetchCoArtistTrackSlugs).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Переконатися, що тест падає**

Run: `npx vitest run tests/unit/trackApiSimilar.test.ts`
Expected: FAIL — перші два тести (alias-track не потрапляє в similar, бо handler ще парсить CSV).

- [ ] **Step 3: Створити `server/utils/trackArtists.ts`**

```ts
export async function fetchTrackArtistSlugs(trackSlug: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin()
    .from('track_artists')
    .select('artist_slug, position')
    .eq('track_slug', trackSlug)
    .order('position', { ascending: true })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return ((data ?? []) as { artist_slug: unknown }[]).map(row => String(row.artist_slug))
}

export async function fetchCoArtistTrackSlugs(artistSlugs: string[]): Promise<Set<string>> {
  if (!artistSlugs.length) return new Set()

  const { data, error } = await supabaseAdmin()
    .from('track_artists')
    .select('track_slug')
    .in('artist_slug', artistSlugs)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return new Set(((data ?? []) as { track_slug: unknown }[]).map(row => String(row.track_slug)))
}

export async function fetchArtistTrackSlugs(artistSlug: string): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin()
    .from('track_artists')
    .select('track_slug')
    .eq('artist_slug', artistSlug)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return new Set(((data ?? []) as { track_slug: unknown }[]).map(row => String(row.track_slug)))
}
```

- [ ] **Step 4: Переписати блок artist/similar у `server/api/track/[id].get.ts`**

Замінити рядки 32–35 (обчислення `artistSlugs`):

```ts
    const csvArtistSlugs = (track.artist_slug || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)

    const indexedArtistSlugs = isSupabaseCatalogSource()
      ? await fetchTrackArtistSlugs(track.slug)
      : []
    const artistSlugs = indexedArtistSlugs.length ? indexedArtistSlugs : csvArtistSlugs
```

Замінити блок similar tracks (рядки 50–59):

```ts
    const coArtistTrackSlugs = isSupabaseCatalogSource() && indexedArtistSlugs.length
      ? await fetchCoArtistTrackSlugs(artistSlugs)
      : null

    const seenSimilar = new Set<string>([track.slug])
    const similarTracks: ReleaseTrackRow[] = []
    for (const row of rows) {
      if (seenSimilar.has(row.slug)) continue
      const isSimilar = coArtistTrackSlugs
        ? coArtistTrackSlugs.has(row.slug)
        : artistSlugs.some(slug => row.artist_slug.split(',').map(s => s.trim()).includes(slug))
      if (!isSimilar) continue
      seenSimilar.add(row.slug)
      similarTracks.push(row)
      if (similarTracks.length >= 8) break
    }
```

Решта handler (occurrences, releases, `Promise.all` з `fetchArtists`/`fetchLikeCount`, сортування артистів, відповідь) — без змін.

- [ ] **Step 5: Прогнати тести**

Run: `npx vitest run tests/unit/trackApiSimilar.test.ts`
Expected: PASS (3 tests).
Run: `npx nuxi typecheck`
Expected: без помилок.

- [ ] **Step 6: Commit**

```bash
git add server/utils/trackArtists.ts "server/api/track/[id].get.ts" tests/unit/trackApiSimilar.test.ts
git commit -m "feat(tracks): resolve track artists and similar tracks via track_artists"
```

---

### Task 9: Indexed фільтр у `/api/artist/[id]/tracks`

**Files:**
- Modify: `server/api/artist/[id]/tracks.get.ts:19-23`
- Test: `tests/unit/artistTracksIndexed.test.ts`

**Interfaces:**
- Consumes: `fetchArtistTrackSlugs(artistSlug): Promise<Set<string>>` з Task 8.
- Поведінка: Supabase-режим із непорожньою `track_artists` — членство в set замість CSV-спліту; порожня таблиця або Firebase-режим — поточна CSV-логіка. `titleMentionsArtist`-fallback і `RELEASE_FALLBACK` зберігаються.

- [ ] **Step 1: Написати падаючий тест**

`tests/unit/artistTracksIndexed.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const rows = [
  { slug: 'linked-track', title: 'Linked', artist_name: 'E.R.S.', artist_slug: 'ers', bpm: 90, audio_url: 'https://cdn/a.mp3', release_slug: 'rel-1', track_number: 1 },
  { slug: 'other-track', title: 'Other', artist_name: 'Other', artist_slug: 'other', bpm: 80, audio_url: 'https://cdn/b.mp3', release_slug: 'rel-1', track_number: 2 },
]

const GLOBALS = [
  'defineCachedEventHandler', 'catalogCacheOptions', 'createError', 'getRouterParam',
  'fetchAllCatalogTrackRows', 'isSupabaseCatalogSource', 'useSupabase',
  'fetchLikeCounts', 'fetchArtistTrackSlugs',
]

describe('artist tracks endpoint with track_artists index', () => {
  beforeEach(() => {
    const g = globalThis as Record<string, unknown>
    vi.resetModules()
    g.defineCachedEventHandler = (handler: unknown) => handler
    g.catalogCacheOptions = () => ({})
    g.createError = (input: { statusMessage?: string }) => new Error(input.statusMessage ?? 'Error')
    g.getRouterParam = (event: { context: { params: Record<string, string> } }, key: string) => event.context.params[key]
    g.fetchAllCatalogTrackRows = async () => rows
    g.fetchLikeCounts = async () => ({})
    g.isSupabaseCatalogSource = () => true
    g.useSupabase = () => ({
      from: (table: string) => ({
        select: () => {
          if (table === 'artists') {
            return Promise.resolve({ data: [{ slug: 'e-r-s', title: 'E.R.S.' }], error: null })
          }
          return { in: async () => ({ data: [{ slug: 'rel-1', cover_xl: '/cover.jpg' }], error: null }) }
        },
      }),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of GLOBALS) delete (globalThis as Record<string, unknown>)[key]
  })

  it('selects tracks via track_artists membership, not CSV aliases', async () => {
    const g = globalThis as Record<string, unknown>
    g.fetchArtistTrackSlugs = vi.fn(async () => new Set(['linked-track']))

    const { default: handler } = await import('../../server/api/artist/[id]/tracks.get')
    const result = await (handler as (e: unknown) => Promise<{ slug: string }[]>)({ context: { params: { id: 'e-r-s' } } })

    expect(result.map(t => t.slug)).toEqual(['linked-track'])
    expect(g.fetchArtistTrackSlugs).toHaveBeenCalledWith('e-r-s')
  })

  it('falls back to CSV split when the index has no rows for the artist', async () => {
    const g = globalThis as Record<string, unknown>
    g.fetchArtistTrackSlugs = vi.fn(async () => new Set<string>())

    const { default: handler } = await import('../../server/api/artist/[id]/tracks.get')
    const result = await (handler as (e: unknown) => Promise<{ slug: string }[]>)({ context: { params: { id: 'ers' } } })

    expect(result.map(t => t.slug)).toEqual(['linked-track'])
  })
})
```

Примітка: у першому тесті slug `e-r-s` НЕ збігається з CSV `ers`, тож проходження можливе лише через index; у другому — навпаки.

- [ ] **Step 2: Переконатися, що тест падає**

Run: `npx vitest run tests/unit/artistTracksIndexed.test.ts`
Expected: FAIL — перший тест (CSV-логіка не знаходить `e-r-s`).

- [ ] **Step 3: Оновити handler**

У `server/api/artist/[id]/tracks.get.ts` після рядка 17 (`const self = …`) додати:

```ts
  const indexedTrackSlugs = isSupabaseCatalogSource()
    ? await fetchArtistTrackSlugs(artistSlug)
    : null
```

і замінити фільтр (рядки 19–23):

```ts
  let artistRows = allRows.filter((row) => {
    if (!row.audio_url) return false
    const linked = indexedTrackSlugs?.size
      ? indexedTrackSlugs.has(row.slug)
      : splitArtistSlugs(row.artist_slug).includes(artistSlug)
    if (linked) return true
    return self ? titleMentionsArtist(row.title, self) : false
  })
```

- [ ] **Step 4: Прогнати тести**

Run: `npx vitest run tests/unit/artistTracksIndexed.test.ts tests/unit/artistPageApi.test.ts tests/unit/artistTracks.test.ts`
Expected: PASS (нові + наявні artist-тести без регресій).

- [ ] **Step 5: Commit**

```bash
git add "server/api/artist/[id]/tracks.get.ts" tests/unit/artistTracksIndexed.test.ts
git commit -m "feat(artist): filter artist tracks via track_artists index"
```

---

### Task 10: Міграція `like_counters` + розширений RPC + backfill

**Files:**
- Create: `supabase/migrations/20260718_like_counters.sql`

**Interfaces:**
- Produces: таблиця `public.like_counters(entity, slug, total)`; RPC `increment_like` додатково інкрементує агрегат у тій самій транзакції; backfill з `SUM(count)` шести `*_likes` таблиць. Застосування — у Rollout.

- [ ] **Step 1: Створити міграцію**

`supabase/migrations/20260718_like_counters.sql`:

```sql
-- Aggregated public like counters, one row per (entity, slug).
-- Maintained atomically by increment_like(); reads no longer SUM the per-user
-- rows on every catalog request.
create table if not exists public.like_counters (
  entity text not null,
  slug text not null,
  total bigint not null default 0,
  primary key (entity, slug)
);

alter table public.like_counters enable row level security;

drop policy if exists "like_counters_public_read" on public.like_counters;
create policy "like_counters_public_read" on public.like_counters
  for select using (true);

grant select on public.like_counters to anon, authenticated;
grant all on public.like_counters to service_role;

-- Extend the existing security-definer RPC: bump the aggregate in the same
-- transaction as the per-user row, so no trigger is needed (all like writes
-- already funnel through this function).
create or replace function public.increment_like(
  p_table text,
  p_slug_col text,
  p_slug text,
  p_user_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
  v_entity text;
begin
  if p_table not in (
    'release_likes','artist_likes','track_likes',
    'video_likes','event_likes','playlist_likes'
  ) then
    raise exception 'invalid table %', p_table;
  end if;

  if p_slug_col not in (
    'release_slug','artist_slug','track_slug',
    'video_slug','event_slug','playlist_slug'
  ) then
    raise exception 'invalid slug column %', p_slug_col;
  end if;

  execute format(
    'insert into public.%I (user_id, %I, count) values ($1, $2, 1)
       on conflict (user_id, %I) do update set count = %I.count + 1
       returning count',
    p_table, p_slug_col, p_slug_col, p_table
  )
  into new_count
  using p_user_id, p_slug;

  v_entity := replace(p_table, '_likes', '');
  insert into public.like_counters (entity, slug, total)
  values (v_entity, p_slug, 1)
  on conflict (entity, slug) do update set total = like_counters.total + 1;

  return new_count;
end;
$$;

grant execute on function public.increment_like(text, text, text, uuid) to service_role;

-- Backfill aggregates from the per-user tables (idempotent).
insert into public.like_counters (entity, slug, total)
select 'release', release_slug, sum(count) from public.release_likes group by release_slug
on conflict (entity, slug) do update set total = excluded.total;

insert into public.like_counters (entity, slug, total)
select 'artist', artist_slug, sum(count) from public.artist_likes group by artist_slug
on conflict (entity, slug) do update set total = excluded.total;

insert into public.like_counters (entity, slug, total)
select 'track', track_slug, sum(count) from public.track_likes group by track_slug
on conflict (entity, slug) do update set total = excluded.total;

insert into public.like_counters (entity, slug, total)
select 'video', video_slug, sum(count) from public.video_likes group by video_slug
on conflict (entity, slug) do update set total = excluded.total;

insert into public.like_counters (entity, slug, total)
select 'event', event_slug, sum(count) from public.event_likes group by event_slug
on conflict (entity, slug) do update set total = excluded.total;

insert into public.like_counters (entity, slug, total)
select 'playlist', playlist_slug, sum(count) from public.playlist_likes group by playlist_slug
on conflict (entity, slug) do update set total = excluded.total;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260718_like_counters.sql
git commit -m "feat(db): like_counters aggregate table maintained by increment_like"
```

---

### Task 11: `countCacheRule` + публічні count endpoints

**Files:**
- Modify: `server/utils/cachePolicy.ts`
- Create: `server/utils/likeCountersHandler.ts`
- Create: `server/api/likes/count/releases.get.ts`
- Create: `server/api/artist-likes/count/artists.get.ts`
- Create: `server/api/track-likes/count/tracks.get.ts`
- Create: `server/api/video-likes/count/videos.get.ts`
- Create: `server/api/event-likes/count/events.get.ts`
- Create: `server/api/playlist-likes/count/playlists.get.ts`
- Test: `tests/unit/likeCountersHandler.test.ts`, Modify: `tests/unit/cachePolicy.test.ts`

**Interfaces:**
- Produces: `likeCountersHandler(entity: string)` → event handler, що повертає `{ slug: string, total: number }[]` для `entity`; шість GET endpoints; CDN-правило `${base}/count/**` = `public, max-age=60, stale-while-revalidate=300`.
- Consumes: таблиця `like_counters` (Task 10), глобальні `supabaseAdmin`, `defineEventHandler`, `createError`.
- Клієнт (Task 13) читає: `/api/likes/count/releases`, `/api/artist-likes/count/artists`, `/api/track-likes/count/tracks`, `/api/video-likes/count/videos`, `/api/event-likes/count/events`, `/api/playlist-likes/count/playlists`.

- [ ] **Step 1: Оновити тест cachePolicy (падає)**

У `tests/unit/cachePolicy.test.ts` у тесті `'keeps public like counters cacheable while mutations remain private'` замінити перший `expect` на:

```ts
    expect(rules['/api/track-likes/count/**']?.headers?.['Netlify-CDN-Cache-Control'])
      .toBe('public, max-age=60, stale-while-revalidate=300')
```

Run: `npx vitest run tests/unit/cachePolicy.test.ts`
Expected: FAIL (зараз там 1-годинне правило).

- [ ] **Step 2: Додати `countCacheRule`**

У `server/utils/cachePolicy.ts` після `privateCacheRule` додати:

```ts
const countCacheRule: RouteRule = {
  headers: {
    'Netlify-CDN-Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
  },
}
```

і в `buildApiRouteRules()` замінити `rules[`${base}/count/**`] = publicCacheRule` на:

```ts
    rules[`${base}/count/**`] = countCacheRule
```

Run: `npx vitest run tests/unit/cachePolicy.test.ts`
Expected: PASS.

- [ ] **Step 3: Написати падаючий тест handler-фабрики**

`tests/unit/likeCountersHandler.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('likeCountersHandler', () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as Record<string, unknown>).defineEventHandler = (handler: unknown) => handler
    ;(globalThis as Record<string, unknown>).createError = (input: { statusMessage?: string }) => new Error(input.statusMessage ?? 'Error')
  })

  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of ['defineEventHandler', 'createError', 'supabaseAdmin']) {
      delete (globalThis as Record<string, unknown>)[key]
    }
  })

  it('returns slug/total pairs filtered by entity', async () => {
    let filteredEntity = ''
    ;(globalThis as Record<string, unknown>).supabaseAdmin = () => ({
      from: () => ({
        select: () => ({
          eq: async (_col: string, value: string) => {
            filteredEntity = value
            return { data: [{ slug: 'va-fantazma', total: 7 }, { slug: 'other', total: '3' }], error: null }
          },
        }),
      }),
    })

    const { likeCountersHandler } = await import('../../server/utils/likeCountersHandler')
    const handler = likeCountersHandler('release') as () => Promise<{ slug: string, total: number }[]>

    await expect(handler()).resolves.toEqual([
      { slug: 'va-fantazma', total: 7 },
      { slug: 'other', total: 3 },
    ])
    expect(filteredEntity).toBe('release')
  })

  it('throws on query error', async () => {
    ;(globalThis as Record<string, unknown>).supabaseAdmin = () => ({
      from: () => ({
        select: () => ({ eq: async () => ({ data: null, error: { message: 'boom' } }) }),
      }),
    })

    const { likeCountersHandler } = await import('../../server/utils/likeCountersHandler')
    const handler = likeCountersHandler('release') as () => Promise<unknown>

    await expect(handler()).rejects.toThrow('boom')
  })
})
```

Run: `npx vitest run tests/unit/likeCountersHandler.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Реалізувати фабрику й endpoints**

`server/utils/likeCountersHandler.ts`:

```ts
export function likeCountersHandler(entity: 'release' | 'artist' | 'track' | 'video' | 'event' | 'playlist') {
  return defineEventHandler(async () => {
    const { data, error } = await supabaseAdmin()
      .from('like_counters')
      .select('slug, total')
      .eq('entity', entity)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })

    return ((data ?? []) as { slug: unknown, total: unknown }[]).map(row => ({
      slug: String(row.slug),
      total: Number(row.total) || 0,
    }))
  })
}
```

Шість endpoint-файлів, кожен — один рядок:

`server/api/likes/count/releases.get.ts`:
```ts
export default likeCountersHandler('release')
```
`server/api/artist-likes/count/artists.get.ts`:
```ts
export default likeCountersHandler('artist')
```
`server/api/track-likes/count/tracks.get.ts`:
```ts
export default likeCountersHandler('track')
```
`server/api/video-likes/count/videos.get.ts`:
```ts
export default likeCountersHandler('video')
```
`server/api/event-likes/count/events.get.ts`:
```ts
export default likeCountersHandler('event')
```
`server/api/playlist-likes/count/playlists.get.ts`:
```ts
export default likeCountersHandler('playlist')
```

- [ ] **Step 5: Прогнати тести й typecheck**

Run: `npx vitest run tests/unit/likeCountersHandler.test.ts tests/unit/cachePolicy.test.ts`
Expected: PASS.
Run: `npx nuxi typecheck`
Expected: без помилок.

- [ ] **Step 6: Commit**

```bash
git add server/utils/cachePolicy.ts server/utils/likeCountersHandler.ts server/api/likes/count server/api/artist-likes/count server/api/track-likes/count server/api/video-likes/count server/api/event-likes/count server/api/playlist-likes/count tests/unit/likeCountersHandler.test.ts tests/unit/cachePolicy.test.ts
git commit -m "feat(likes): public like counter endpoints backed by like_counters"
```

---

### Task 12: Прибрати `like_count` з кешованих content DTO

**Files:**
- Modify: `server/api/release/[id].get.ts`, `server/api/artist/[id].get.ts`, `server/api/video/[id].get.ts`, `server/api/event/[id].get.ts`, `server/api/playlist/[id].get.ts`, `server/api/track/[id].get.ts`, `server/api/tracks/[release_slug].get.ts`, `server/api/artist/[id]/tracks.get.ts`
- Delete: `server/utils/likeCounts.ts`, `tests/unit/likeCounts.test.ts`

**Interfaces:**
- Produces: catalog detail/list відповіді БЕЗ `like_count`/`likeCount`; лічильники доступні тільки через count endpoints (Task 11). `fetchLikeCount`/`fetchLikeCounts`/`fetchPagedRows` видаляються (єдиний споживач `fetchPagedRows` — сам `likeCounts.ts`).

- [ ] **Step 1: Почистити detail endpoints**

`server/api/release/[id].get.ts` — замінити рядки 27–33 на:

```ts
    const slugs = releaseTracklistSlugs(release)
    const tracksBySlug = slugs.length ? await fetchCatalogTracksBySlug(slugs) : new Map()

    return { ...release, tracklist: hydrateReleaseTracklist(release, tracksBySlug) }
```

У `artist/[id].get.ts`, `video/[id].get.ts`, `event/[id].get.ts`, `playlist/[id].get.ts` — видалити рядок `const count = await fetchLikeCount(…)` і замінити `return { ...artist, like_count: count }` (аналогічно для `video`/`eventEntity`/`playlist`) на повернення самої змінної: `return artist`, `return video`, `return eventEntity`, `return playlist`.

`server/api/track/[id].get.ts` — прибрати `fetchLikeCount` з `Promise.all` (лишити тільки `fetchArtists`):

```ts
    const artists = await fetchArtists(artistSlugs)
```

і видалити `likeCount` з об'єкта відповіді.

- [ ] **Step 2: Почистити track list endpoints**

`server/api/tracks/[release_slug].get.ts` — замінити рядки 28–32 на:

```ts
  return releaseTracks
```

`server/api/artist/[id]/tracks.get.ts` — видалити рядки 48–50 (`countMap` + мапінг) і повернути `tracks` напряму:

```ts
  return tracks
```

- [ ] **Step 3: Видалити likeCounts утиліту й тест**

```bash
git rm server/utils/likeCounts.ts tests/unit/likeCounts.test.ts
```

Прибрати тепер зайві моки з тестів Task 8/9: у `tests/unit/trackApiSimilar.test.ts` видалити рядок `g.fetchLikeCount = async () => 0` і елемент `'fetchLikeCount'` зі списку `GLOBALS`; у `tests/unit/artistTracksIndexed.test.ts` — рядок `g.fetchLikeCounts = async () => ({})` і елемент `'fetchLikeCounts'`.

Перевірити відсутність згадок: `grep -rn "fetchLikeCount\|fetchLikeCounts\|fetchPagedRows" server/ app/ tests/`
Expected: порожній вивід.

- [ ] **Step 4: Прогнати сюїту й typecheck**

Run: `npm run test:unit`
Expected: PASS (без `likeCounts.test.ts`; тести Task 8/9 оновлені).
Run: `npx nuxi typecheck`
Expected: помилки можливі в `app/` (сторінки досі читають `like_count`) — це очікувано і лагодиться в Task 13; серверна частина без помилок. Якщо typecheck падає лише на app-файлах зі списку Task 13 — продовжити.

- [ ] **Step 5: Commit**

```bash
git add -A server/ tests/
git commit -m "refactor(likes): drop like_count from cached catalog DTOs"
```

---

### Task 13: Клієнт — гідрація лічильників із count endpoints

**Files:**
- Modify: `app/composables/createLikes.ts`
- Modify: `app/composables/useLikes.ts`, `useArtistLikes.ts`, `useTrackLikes.ts`, `useVideoLikes.ts`, `useEventLikes.ts`, `usePlaylistLikes.ts`
- Modify: `app/pages/release/[id].vue`, `app/pages/artist/[id].vue`, `app/pages/video/[id].vue`, `app/pages/event/[id].vue`, `app/pages/playlist/[id].vue`, `app/pages/track/[id].vue`
- Modify: `app/types/index.ts`

**Interfaces:**
- Produces: `createLikes(key: string, apiBase: string, countsUrl?: string): LikesApi` — API незмінний (`isLiked`, `likeCount`, `toggleLike`, `setCount`); за наявності `countsUrl` composable сам вантажить публічні totals `{ slug, total }[]` в `onMounted` і мержить через наявний `setCount` (`Math.max`).

- [ ] **Step 1: Розширити `createLikes`**

У `app/composables/createLikes.ts`:

Сигнатура:

```ts
export function createLikes(key: string, apiBase: string, countsUrl?: string): LikesApi {
```

Після `const likeCounts = useState…` додати:

```ts
  const countsLoaded = useState<boolean>(`${key}-like-counts-loaded`, () => false)
```

Після функції `load()` додати:

```ts
  async function loadCounts() {
    if (!countsUrl || countsLoaded.value) return
    countsLoaded.value = true
    const rows = await $fetch<{ slug: string, total: number }[]>(countsUrl).catch(() => [])
    for (const { slug, total } of rows) setCount(slug, total)
  }
```

Замінити `onMounted`:

```ts
  onMounted(() => {
    loadCounts()
    if (hasIdentity() && !loaded.value) load()
  })
```

- [ ] **Step 2: Передати countsUrl у шести composables**

```ts
// app/composables/useLikes.ts
export function useLikes() {
  return createLikes('release', '/api/likes', '/api/likes/count/releases')
}
```
```ts
// app/composables/useArtistLikes.ts
export function useArtistLikes() {
  return createLikes('artist', '/api/artist-likes', '/api/artist-likes/count/artists')
}
```
```ts
// app/composables/useVideoLikes.ts
export function useVideoLikes() {
  return createLikes('video', '/api/video-likes', '/api/video-likes/count/videos')
}
```
```ts
// app/composables/useEventLikes.ts
export function useEventLikes() {
  return createLikes('event', '/api/event-likes', '/api/event-likes/count/events')
}
```
```ts
// app/composables/usePlaylistLikes.ts
export function usePlaylistLikes() {
  return createLikes('playlist', '/api/playlist-likes', '/api/playlist-likes/count/playlists')
}
```
У `app/composables/useTrackLikes.ts` — перший рядок тіла:

```ts
  const { isLiked, likeCount, toggleLike, setCount } = createLikes('track', '/api/track-likes', '/api/track-likes/count/tracks')
```

- [ ] **Step 3: Прибрати ініціалізацію з content у сторінках**

- `app/pages/release/[id].vue`: у `onMounted` видалити два рядки:
  ```ts
  if (item.value) setCount(item.value.slug, item.value.like_count ?? 0)
  tracks.value?.forEach(t => setTrackCount(t.slug, t.like_count))
  ```
  У локальному типі `Track` (рядок 11) прибрати `, like_count: number`. Якщо `setCount`/`setTrackCount` більше не використовуються в файлі — прибрати їх із деструктуризацій `useLikes()`/`useTrackLikes()`.
- `app/pages/artist/[id].vue`: видалити рядок `setCount(item.value!.slug, item.value!.like_count ?? 0)`; прибрати `setCount` з деструктуризації, якщо не використовується.
- `app/pages/video/[id].vue`, `app/pages/event/[id].vue`, `app/pages/playlist/[id].vue`: те саме (по одному рядку `setCount(item.value!.slug, item.value!.like_count ?? 0)`).
- `app/pages/track/[id].vue`: видалити рядок `setTrackCount(track.value.slug, data.value!.likeCount ?? 0)`; прибрати `setTrackCount` з деструктуризації `useTrackLikes()`, якщо не використовується.

- [ ] **Step 4: Почистити типи**

У `app/types/index.ts` видалити рядки `like_count?: number` (6 шт.: Release ~54, ReleaseTrack ~100, Track ~116, Video ~140, Event ~167, Playlist ~191) і `likeCount?: number` у `TrackResponse` (~126). Номери рядків орієнтовні — шукати за вмістом.

- [ ] **Step 5: Повна перевірка**

Run: `npm run test:unit`
Expected: PASS повністю.
Run: `npx nuxi typecheck`
Expected: без помилок.
Run: `grep -rn "like_count" app/ server/`
Expected: порожньо.

- [ ] **Step 6: Commit**

```bash
git add app/
git commit -m "feat(likes): hydrate public like counters from count endpoints"
```

---

### Task 14: Документація + фінальна верифікація

**Files:**
- Modify: `AGENTS.md`, `docs/roadmap/completed.md`

- [ ] **Step 1: Оновити AGENTS.md**

1. У секції **Catalog export** замінити речення про форму `artists`:
   > `artists` is an object keyed by slug (`artists.irukanji`, not a numeric array).

   на:
   > `artists`, `tracks`, `videos`, `events`, `friends` are arrays of objects with `slug` inside; `releases` and `playlists` stay objects keyed by slug. `scripts/sync-firebase.mjs` converts the arrays to slug-keyed objects before writing (Firebase always stores objects keyed by slug); it also supports `--dry-run` to preview keys without network. A YAML twin `server/data/sentimony-db.yml` round-trips via `scripts/convert-json-yml.mjs` / `convert-yml-json.mjs`.

2. У секції **Tracks (first-class)** замінити початок:
   > `tracks` in the export is an object keyed by canonical slug

   на:
   > `tracks` in the export is an array of objects with canonical slug

   і додати в кінець секції:
   > Track↔artist links are normalized into Supabase `track_artists(track_slug, artist_slug, position)` (populated by `sync:supabase` from the CSV `artist_slug`; no FK to `artists` because of guest slugs). Supabase read paths (similar tracks, artist tracks) use the index with a CSV fallback when the table is empty; Firebase mode stays CSV-only.

3. У секції **Likes** додати наприкінці:
   > Public like totals live in `like_counters(entity, slug, total)`, bumped atomically inside the `increment_like` RPC and backfilled from `SUM(count)` (migration `20260718_like_counters.sql`). Catalog DTOs no longer embed `like_count`; clients hydrate totals from short-cached batch endpoints (`/api/likes/count/releases`, `/api/track-likes/count/tracks`, …, rule `countCacheRule`: `public, max-age=60, stale-while-revalidate=300`) via the `countsUrl` argument of `createLikes(key, apiBase, countsUrl)`.

4. Оновити baseline у **Commands**: замінити `34 files / 146 tests` на фактичне число після прогону.

- [ ] **Step 2: Закрити пункти 4 і 7 у ROADMAP**

Видалити секції `### 4. Відокремити content DTO від like counters` і `### 7. Нормалізувати track-artist модель` цілком; додати в `## Закрито з попередніх аудитів`:

```markdown
- Like counters відокремлено від content DTO: агрегат `like_counters` + RPC `increment_like`, batch count endpoints під `*/count/**` (60s public cache), `like_count` прибрано з кешованих catalog-відповідей.
- Track-artist модель нормалізовано: `track_artists(track_slug, artist_slug, position)` наповнюється sync:supabase з CSV; similar tracks і artist tracks у Supabase-режимі читають індекс, Firebase-режим лишився CSV fallback.
```

- [ ] **Step 3: Повна верифікація**

Run: `npm run test:unit` → Expected: PASS, зафіксувати нову кількість files/tests.
Run: `npx nuxi typecheck` → Expected: без помилок.
Run: `npm run build` → Expected: успішний production build.
Smoke (dev, обидва режими; лічильники будуть 0/помилки табл. `track_artists`/`like_counters` до застосування міграцій — перевіряємо, що сторінки рендеряться, а `.catch` шляхи тихі):
- `CATALOG_SOURCE=supabase npm run dev` → відкрити `/`, `/tracks`, `/artists`, `/release/va-fantazma`, `/track/36-a-final-thought`, `/artist/irukanji`
- `CATALOG_SOURCE=firebase npm run dev` → ті самі сторінки (аудіо здебільшого відсутнє — відомий stale-стан Firebase)

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md docs/roadmap/completed.md
git commit -m "docs: reflect array export, track_artists and like_counters"
```

---

### Task 15: Review follow-up — порожній co-artist index fallback + baseline

**Files:**
- Modify: `server/api/track/[id].get.ts`
- Test: `tests/unit/trackApiSimilar.test.ts`
- Modify: `AGENTS.md`
- Modify: `docs/roadmap/completed.md`

**Interfaces:**
- Consumes: `fetchCoArtistTrackSlugs(artistSlugs: string[]): Promise<Set<string>>`; порожній `Set` означає помилку lookup, неповний індекс або відсутність зв'язків.
- Produces: `/api/track/[id]` використовує CSV matching, коли co-artist index порожній; документований unit baseline синхронізовано з фактичним результатом.

- [ ] **Step 1: Додати падаючий handler-тест**

У `tests/unit/trackApiSimilar.test.ts` після тесту `'falls back to CSV matching when track_artists is empty'` додати:

```ts
  it('falls back to CSV matching when the co-artist index is empty', async () => {
    const g = globalThis as Record<string, unknown>
    g.isSupabaseCatalogSource = () => true
    g.fetchTrackArtistSlugs = vi.fn(async () => ['zymosis'])
    g.fetchCoArtistTrackSlugs = vi.fn(async () => new Set<string>())

    const { default: handler } = await import('../../server/api/track/[id].get')
    const result = await (handler as (e: unknown) => Promise<{ similarTracks: { slug: string }[] }>)(makeEvent('main-track'))

    expect(result.similarTracks.map(t => t.slug)).toEqual(['csv-track'])
    expect(g.fetchCoArtistTrackSlugs).toHaveBeenCalledWith(['zymosis'])
  })
```

- [ ] **Step 2: Переконатися, що тест падає**

Run: `npx vitest run tests/unit/trackApiSimilar.test.ts`

Expected: FAIL у новому тесті — отримано `[]` замість `['csv-track']`, бо порожній `Set` є truthy.

- [ ] **Step 3: Реалізувати мінімальний fallback**

У `server/api/track/[id].get.ts` замінити:

```ts
    const coArtistTrackSlugs = isSupabaseCatalogSource() && indexedArtistSlugs.length
      ? await fetchCoArtistTrackSlugs(artistSlugs)
      : null
```

на:

```ts
    const indexedCoArtistTrackSlugs = isSupabaseCatalogSource() && indexedArtistSlugs.length
      ? await fetchCoArtistTrackSlugs(artistSlugs)
      : null
    const coArtistTrackSlugs = indexedCoArtistTrackSlugs?.size
      ? indexedCoArtistTrackSlugs
      : null
```

Решту similar-tracks циклу не змінювати: `null` уже вмикає CSV matching.

- [ ] **Step 4: Прогнати цільовий тест**

Run: `npx vitest run tests/unit/trackApiSimilar.test.ts`

Expected: PASS, 4 tests.

- [ ] **Step 5: Зафіксувати фактичний unit baseline**

Run: `npm run test:unit`

Expected: PASS, 39 files / 161 tests.

У `AGENTS.md` замінити:

```markdown
Current focused verification baseline: `npm run test:unit` -> 39 files / 160 tests; `npx nuxi typecheck` passes with local Supabase env warnings.
```

на:

```markdown
Current focused verification baseline: `npm run test:unit` -> 39 files / 161 tests; `npx nuxi typecheck` passes with local Supabase env warnings.
```

У `docs/roadmap/completed.md` замінити:

```markdown
- Unit tests проходять: `npm run test:unit` -> 38 files, 156 tests.
```

на:

```markdown
- Unit tests проходять: `npm run test:unit` -> 39 files, 161 tests.
```

- [ ] **Step 6: Повна верифікація**

Run: `npx nuxi typecheck`

Expected: exit 0; локальні warnings про відсутні Supabase env допустимі.

Run: `npm run build`

Expected: успішний production build; відомі Tailwind sourcemap та VueUse PURE annotation warnings допустимі.

Run: `git diff --check`

Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
git add "server/api/track/[id].get.ts" tests/unit/trackApiSimilar.test.ts AGENTS.md docs/roadmap/completed.md
git commit -m "fix(tracks): fall back to CSV when co-artist index is empty"
```

---

## Rollout (після мержа; виконує користувач або агент із явного дозволу)

Порядок критичний: **міграції → deploy → сінки** (інакше count endpoints віддаватимуть помилку/порожньо, а `track_artists` буде порожньою — read paths мають CSV fallback, тож це деградація, не падіння).

1. Застосувати міграції через задокументований у AGENTS.md workaround (`db push` зламаний через `.env`-директорію):
   ```bash
   TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env/.env.local | cut -d= -f2)
   mkdir -p /tmp/sb/supabase && cp supabase/config.toml /tmp/sb/supabase/ && cp -r supabase/.temp /tmp/sb/supabase/ && touch /tmp/sb/.env
   cd /tmp/sb && SUPABASE_ACCESS_TOKEN="$TOKEN" npx supabase db query --linked --file <repo>/supabase/migrations/20260718_track_artists.sql
   cd /tmp/sb && SUPABASE_ACCESS_TOKEN="$TOKEN" npx supabase db query --linked --file <repo>/supabase/migrations/20260718_like_counters.sql
   ```
2. Звірити backfill: `select entity, count(*), sum(total) from like_counters group by entity;` проти `select sum(count) from release_likes;` тощо (через `db query`).
3. Deploy: `npm run deploy:stage`, smoke на stage, потім `npm run deploy:prod`.
4. `npm run sync:supabase` — наповнить `track_artists` (перевірити лог `Synced N track_artists`).
5. `node scripts/sync-firebase.mjs --dry-run` — очний контроль ключів, потім `npm run sync:firebase`.
6. Smoke на проді: лічильники лайків на detail-сторінках, similar tracks на `/track/[id]`, треки артиста на `/artist/[id]`.

## Верифікація плану проти спеки (self-review)

- Фаза 1 → Tasks 1–4; Фаза 2 → Task 5; Фаза 3 → Tasks 6–9; Фаза 4 → Tasks 10–13; верифікація/доки → Task 14; review follow-up → Task 15; порядок розгортання → Rollout. Покриття повне.
- Ризик зі спеки «між deploy і міграцією лічильники нульові» знято порядком Rollout (міграції першими).
