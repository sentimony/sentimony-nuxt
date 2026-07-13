# Tracks First-Class Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Зробити треки first-class сутністю: секція `tracks` у `server/data/sentimony-db-export.json` (single source of truth, як releases/artists), канонічні slug виду `boggy-elf-dream-of-ashvattha-in`, many-to-many з релізами через впорядкований `release.tracklist: string[]`, поле `audio_url` (R2), синк у Firebase та Supabase тими самими `sync:*` скриптами.

**Architecture:** Export JSON отримує top-level `tracks` (об'єкт, ключ = канонічний slug) без `release_slug`/`track_number`; кожен реліз отримує `tracklist` — впорядкований масив track-slug'ів (позиція в масиві = номер треку в цьому релізі). Sync-скрипти більше не парсять `tracklistCompact` — вони дзеркалять export. Серверні ендпоінти «гідрують» slug'и з `release.tracklist` рядками з `tracks` і деривують `track_number = index + 1`. Лайки/прослуховування (тільки Supabase) ремапляться зі старих slug (`<release>-<n>`) на нові одним згенерованим SQL.

**Tech Stack:** Nuxt 4 / Nitro, Supabase (Postgres + CLI workaround через `/tmp/sb`), Firebase RTDB REST, Vitest.

## Global Constraints

- Канонічний slug: `slugifyTrack(\`${artist_name} ${title}\`)` — та сама функція, що вже є в `server/utils/releaseTracklist.ts:13` (NFKD-нормалізація, non-alnum → `-`).
- Лайки та play counts живуть ТІЛЬКИ в Supabase; у Firebase `tracks` пишемо лише каталожні поля (`slug`, `title`, `artist_name`, `artist_slug`, `bpm`, `audio_url`).
- `sync:firebase` / `sync:supabase` НЕ запускати без явного підтвердження користувача (пишуть у remote).
- `tracklistCompact` у релізах не чіпаємо — лишається як legacy/display джерело (прапорці 🇺🇦 тощо).
- Supabase CLI: тільки через `/tmp/sb` workaround з AGENTS.md (`db query --linked --file`), не `db push`.
- Один трек може бути в кількох релізах: однаковий `artist_name + title` на різних релізах = ТОЙ САМИЙ трек (один slug, один запис).
- Верифікаційний базлайн: `npm run test:unit` (зараз 25 files / 96 tests) і `npx nuxi typecheck` мають проходити після кожного таска.
- Старі URL `/track/<release>-<n>` мають відповідати 301-редіректом на канонічний URL (зовнішні лінки/сайтмапи вже проіндексовані).
- Коміти: користувач віддає перевагу малій кількості комітів; таски комітимо, наприкінці можливий squash.

---

### Task 1: One-time скрипт міграції export JSON

Створює `tracks` секцію в export, переводить кожен реліз на `tracklist: string[]`, зберігає мапінг старих slug → нових.

**Files:**
- Create: `scripts/migrate-tracks-export.mjs`
- Modify: `server/data/sentimony-db-export.json` (результат запуску)
- Create: `scripts/out/track-slug-mapping.json` (артефакт, gitignored)

**Interfaces:**
- Produces: export JSON з top-level `tracks: Record<slug, { slug, title, artist_name, artist_slug, bpm, audio_url }>` та `releases[*].tracklist: string[]`; `scripts/out/track-slug-mapping.json` = `Record<oldSlug, newSlug>` для Task 2.

- [ ] **Step 1: Написати скрипт**

```js
// scripts/migrate-tracks-export.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

const PATH = 'server/data/sentimony-db-export.json'
const data = JSON.parse(readFileSync(PATH, 'utf-8'))

const artistByTitle = new Map(
  Object.values(data.artists).map(a => [a.title.toLowerCase(), a.slug]),
)

function slugifyTrack(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function parseParagraph(p, index) {
  const numMatch = p.match(/<small>(\d+)\.<\/small>/)
  const trackNumber = numMatch ? parseInt(numMatch[1]) : index + 1
  const artistMatch = p.match(/<b>(.*?)<\/b>/)
  const artistName = artistMatch ? artistMatch[1].trim() : ''
  const withoutBpm = p.replace(/\s*<small>\([^)]*bpm\)<\/small>.*$/, '')
  const titleRaw = withoutBpm.replace(/^<small>\d+\.<\/small>[^<]*<b>.*?<\/b>\s*-\s*/, '')
  const title = titleRaw.replace(/<[^>]+>/g, '').trim()
  const bpmMatch = p.match(/\((\d+)(?:-(\d+))?bpm\)/i)
  let bpm = bpmMatch ? parseInt(bpmMatch[2] ?? bpmMatch[1]) : null
  if (bpm === 0) bpm = null
  return { trackNumber, artistName, title, bpm }
}

const tracks = {}
const mapping = {}
const conflicts = []

function upsertTrack({ artistName, title, bpm, url }) {
  const slug = slugifyTrack(`${artistName} ${title}`)
  if (!slug) return null
  const existing = tracks[slug]
  if (existing) {
    if (existing.artist_name !== artistName || existing.title !== title)
      conflicts.push({ slug, a: existing, b: { artistName, title } })
    if (bpm != null && existing.bpm == null) existing.bpm = bpm
    if (url && !existing.audio_url) existing.audio_url = url
    return slug
  }
  tracks[slug] = {
    slug,
    title,
    artist_name: artistName,
    artist_slug: artistByTitle.get(artistName.toLowerCase()) || slugifyTrack(artistName),
    bpm: bpm ?? null,
    audio_url: url || null,
  }
  return slug
}

for (const release of Object.values(data.releases)) {
  // Releases already migrated to structured entries (va-tempo-syndicate) carry urls.
  if (Array.isArray(release.tracklist) && release.tracklist.every(t => typeof t === 'object')) {
    release.tracklist = release.tracklist.map((t, i) => {
      const slug = upsertTrack({ artistName: t.artist, title: t.title, bpm: t.bpm, url: t.url })
      mapping[`${release.slug}-${t.track_number ?? i + 1}`] = slug
      return slug
    }).filter(Boolean)
    continue
  }
  const compact = Array.isArray(release.tracklistCompact) ? release.tracklistCompact : []
  const list = []
  for (const [index, item] of compact.entries()) {
    const parsed = parseParagraph(item.p ?? '', index)
    if (!parsed.title) continue
    const slug = upsertTrack({ artistName: parsed.artistName, title: parsed.title, bpm: parsed.bpm })
    if (!slug) continue
    mapping[`${release.slug}-${parsed.trackNumber}`] = slug
    list.push(slug)
  }
  release.tracklist = list
}

data.tracks = Object.fromEntries(Object.entries(tracks).sort(([a], [b]) => a.localeCompare(b)))

mkdirSync('scripts/out', { recursive: true })
writeFileSync('scripts/out/track-slug-mapping.json', JSON.stringify(mapping, null, 2))
writeFileSync(PATH, JSON.stringify(data, null, 1) + '\n')

console.log(`tracks: ${Object.keys(tracks).length}, mapping entries: ${Object.keys(mapping).length}`)
if (conflicts.length) {
  console.log('CONFLICTS (same slug, different metadata):')
  for (const c of conflicts) console.log(' -', c.slug, JSON.stringify(c.a), 'vs', JSON.stringify(c.b))
}
```

Важливо: перед `writeFileSync(PATH, …)` перевір актуальний стиль відступів export-файлу (`head -3 server/data/sentimony-db-export.json`) і збережи його (зараз 1 пробіл).

- [ ] **Step 2: Додати `scripts/out/` у `.gitignore`**

```gitignore
scripts/out/
```

- [ ] **Step 3: Запустити і перевірити**

Run: `node scripts/migrate-tracks-export.mjs`
Expected: `tracks: ~740-770, mapping entries: ~770+`, список conflicts (переглянути вручну: однакові artist+title на різних релізах — це ОЧІКУВАНО і не conflict; conflict лише коли метадані розходяться).

Run: `node -e "const d=require('./server/data/sentimony-db-export.json'); console.log(d.tracks['boggy-elf-dream-of-ashvattha-in']); console.log(Object.values(d.releases).find(r=>r.slug==='va-tempo-syndicate').tracklist.slice(0,3))"`
Expected: трек з `audio_url` на `pub-38745….r2.dev` і `tracklist` = `['boggy-elf-dream-of-ashvattha-in', 'shizolizer-gin-kinder-pingui', 'hypnotriod-the-sleep-detector']`.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-tracks-export.mjs .gitignore server/data/sentimony-db-export.json
git commit -m "feat: promote tracks to first-class export entity with canonical slugs"
```

---

### Task 2: Supabase — схема + remap лайків/прослуховувань

**Files:**
- Create: `supabase/migrations/20260707_tracks_first_class.sql`
- Create: `scripts/generate-track-slug-remap.mjs`
- Create: `scripts/out/20260707_remap_track_slugs.sql` (генерований, gitignored)

**Interfaces:**
- Consumes: `scripts/out/track-slug-mapping.json` з Task 1.
- Produces: таблиця `tracks(slug pk, title, artist_name, artist_slug, bpm, audio_url)` без `release_slug`/`track_number`; `track_likes.track_slug` і `track_plays.track_slug` вказують на нові slug'и.

- [ ] **Step 1: Схемна міграція**

```sql
-- supabase/migrations/20260707_tracks_first_class.sql
alter table tracks add column if not exists audio_url text;
alter table tracks drop constraint if exists tracks_release_track_key;
alter table tracks alter column release_slug drop not null;
alter table tracks alter column track_number drop not null;
alter table tracks drop column if exists release_slug;
alter table tracks drop column if exists track_number;
```

(Перед написанням фінальної версії звір реальні constraint-імена: `select conname from pg_constraint where conrelid = 'tracks'::regclass;` через `db query`.)

- [ ] **Step 2: Скрипт генерації remap SQL**

```js
// scripts/generate-track-slug-remap.mjs
import { readFileSync, writeFileSync } from 'fs'

const mapping = JSON.parse(readFileSync('scripts/out/track-slug-mapping.json', 'utf-8'))
const rows = Object.entries(mapping)
  .filter(([oldSlug, newSlug]) => newSlug && oldSlug !== newSlug)
  .map(([o, n]) => `('${o.replace(/'/g, "''")}', '${n.replace(/'/g, "''")}')`)

const sql = `
create temp table track_slug_map(old_slug text primary key, new_slug text);
insert into track_slug_map(old_slug, new_slug) values
${rows.join(',\n')};

-- Dedupe: user may end up liking the same canonical track twice via different releases.
delete from track_likes tl using track_slug_map m, track_likes keep
  where tl.track_slug = m.old_slug
    and keep.user_id = tl.user_id and keep.track_slug = m.new_slug;
update track_likes tl set track_slug = m.new_slug
  from track_slug_map m where tl.track_slug = m.old_slug;

insert into track_plays(track_slug, play_count)
  select m.new_slug, sum(tp.play_count) from track_plays tp
  join track_slug_map m on m.old_slug = tp.track_slug
  group by m.new_slug
on conflict (track_slug) do update set play_count = track_plays.play_count + excluded.play_count;
delete from track_plays tp using track_slug_map m where tp.track_slug = m.old_slug;
`
writeFileSync('scripts/out/20260707_remap_track_slugs.sql', sql)
console.log(`remap rows: ${rows.length}`)
```

- [ ] **Step 3: Згенерувати і застосувати обидва SQL**

```bash
node scripts/generate-track-slug-remap.mjs
TOKEN=$(grep SUPABASE_ACCESS_TOKEN .env/.env.local | cut -d= -f2)
mkdir -p /tmp/sb/supabase && cp supabase/config.toml /tmp/sb/supabase/ && cp -r supabase/.temp /tmp/sb/supabase/ && touch /tmp/sb/.env
cd /tmp/sb && SUPABASE_ACCESS_TOKEN="$TOKEN" npx supabase db query --linked --file <repo>/scripts/out/20260707_remap_track_slugs.sql
cd /tmp/sb && SUPABASE_ACCESS_TOKEN="$TOKEN" npx supabase db query --linked --file <repo>/supabase/migrations/20260707_tracks_first_class.sql
```

Порядок критичний: спершу remap (поки старі slug'и ще зіставні), потім схема. Перевірка: `select count(*) from track_likes where track_slug ~ '-[0-9]+$' and track_slug not in (select slug from tracks);` → очікувано 0 після синку (Task 3).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260707_tracks_first_class.sql scripts/generate-track-slug-remap.mjs
git commit -m "feat: supabase schema + likes/plays remap for canonical track slugs"
```

---

### Task 3: Sync-скрипти дзеркалять export (без парсингу)

**Files:**
- Modify: `scripts/sync-supabase.mjs` (прибрати `parseTrack`/`slugify`/цикл по `tracklistCompact`)
- Modify: `scripts/sync-firebase.mjs` (те саме)
- Delete: `scripts/migrate-tracks.mjs` (застарілий дублікат)

**Interfaces:**
- Consumes: `data.tracks` (об'єкт) і `releases[*].tracklist` (string[]) з Task 1.
- Produces: Supabase `tracks` рядки `{ slug, title, artist_name, artist_slug, bpm, audio_url }`; Supabase `releases.tracklist` jsonb = string[]; Firebase вузли `tracks/<slug>` (ті самі поля, без null) і `releases/<slug>/tracklist`.

- [ ] **Step 1: sync-supabase.mjs**

Замінити весь блок parseTrack/seenTracks (рядки ~30–74) на:

```js
const tracks = Object.values(data.tracks)
```

`releases`-маппінг лишити як є — `tracklist` тепер рядковий масив і йде в jsonb колонку без змін. Перед `await sync('tracks', tracks)` додати очищення legacy-рядків:

```js
const { error: cleanupError } = await supabase
  .from('tracks')
  .delete()
  .not('slug', 'in', `(${Object.keys(data.tracks).map(s => `"${s}"`).join(',')})`)
if (cleanupError) { console.error('tracks cleanup error:', cleanupError.message); process.exit(1) }
```

(Якщо `.not('slug','in',…)` впирається в ліміт довжини URL — замість цього `delete().gte('slug','')` перед upsert'ом: таблиця повністю переливається з export.)

- [ ] **Step 2: sync-firebase.mjs**

Замінити parseTrack-блок на:

```js
const tracks = Object.fromEntries(
  Object.entries(data.tracks).map(([slug, t]) => [slug, {
    slug: t.slug,
    title: t.title,
    artist_name: t.artist_name,
    artist_slug: t.artist_slug,
    ...(t.bpm != null ? { bpm: t.bpm } : {}),
    ...(t.audio_url ? { audio_url: t.audio_url } : {}),
  }]),
)
```

Лайки/plays у Firebase не пишемо (constraint). REST `PUT` на `tracks` замінює вузол цілком — legacy-ключі зникнуть автоматично.

- [ ] **Step 3: Видалити migrate-tracks.mjs**

```bash
git rm scripts/migrate-tracks.mjs
```

- [ ] **Step 4: Запустити sync:supabase (ПІСЛЯ підтвердження користувача) і перевірити**

Run: `npm run sync:supabase`
Expected: `Synced ~740+ tracks`, без помилок.
Verify (через `db query`): `select slug, audio_url from tracks where slug = 'boggy-elf-dream-of-ashvattha-in';` → 1 рядок з R2 url; `select count(*) from tracks where slug ~ '.*-[0-9]+$' and slug like 'va-%';` → перевірити що legacy slug'и зникли.

- [ ] **Step 5: Commit**

```bash
git add scripts/sync-supabase.mjs scripts/sync-firebase.mjs
git commit -m "feat: sync scripts mirror first-class tracks from export"
```

---

### Task 4: Серверна гідрація tracklist (спільний util)

**Files:**
- Modify: `server/utils/releaseTracklist.ts` (переробити)
- Test: `tests/unit/releaseTracklist.test.ts`

**Interfaces:**
- Produces:
  - `type CatalogTrack = { slug: string; title: string; artist_name: string; artist_slug: string; bpm: number | null; audio_url: string | null }`
  - `hydrateReleaseTracklist(release, tracksBySlug: Map<string, CatalogTrack>): ReleaseTracklistEntry[]` — повертає `{ track_number, slug, artist, title, bpm, url }[]` (той самий shape, що вже споживають release-сторінка та `AudioTrackPlaylist`), `track_number = index + 1`, `url = audio_url ?? ''`.
  - `parseCompactTracklist(release, artistByTitle): CatalogTrack-подібні фолбек-рядки` — лишити для Firebase remote, який ще не синкнутий (переїздить логіка з `parseTrackParagraph`).

- [ ] **Step 1: Failing test**

```ts
// tests/unit/releaseTracklist.test.ts
import { describe, it, expect } from 'vitest'
import { hydrateReleaseTracklist } from '../../server/utils/releaseTracklist'

describe('hydrateReleaseTracklist', () => {
  const tracksBySlug = new Map([
    ['boggy-elf-dream-of-ashvattha-in', {
      slug: 'boggy-elf-dream-of-ashvattha-in', title: 'Dream Of Ashvattha (In)',
      artist_name: 'Boggy Elf', artist_slug: 'boggy-elf', bpm: 80,
      audio_url: 'https://r2.example/01.mp3',
    }],
  ])

  it('hydrates slugs in release order and derives track_number', () => {
    const release = { slug: 'va-tempo-syndicate', tracklist: ['boggy-elf-dream-of-ashvattha-in'] }
    expect(hydrateReleaseTracklist(release, tracksBySlug)).toEqual([{
      track_number: 1, slug: 'boggy-elf-dream-of-ashvattha-in',
      artist: 'Boggy Elf', title: 'Dream Of Ashvattha (In)', bpm: 80,
      url: 'https://r2.example/01.mp3',
    }])
  })

  it('skips slugs missing from the catalog', () => {
    const release = { slug: 'x', tracklist: ['missing', 'boggy-elf-dream-of-ashvattha-in'] }
    const result = hydrateReleaseTracklist(release, tracksBySlug)
    expect(result).toHaveLength(1)
    expect(result[0]!.track_number).toBe(2)
  })
})
```

- [ ] **Step 2: Run** `npm run test:unit -- releaseTracklist` → FAIL (`hydrateReleaseTracklist` не експортується).

- [ ] **Step 3: Імплементація**

```ts
// server/utils/releaseTracklist.ts (додати; normalizeReleaseTracklist видалити разом з mixTracks-гілкою)
export type CatalogTrack = {
  slug: string
  title: string
  artist_name: string
  artist_slug: string
  bpm: number | null
  audio_url: string | null
}

export function hydrateReleaseTracklist(
  release: Record<string, unknown>,
  tracksBySlug: Map<string, CatalogTrack>,
): ReleaseTracklistEntry[] {
  const slugs = Array.isArray(release.tracklist) ? release.tracklist as unknown[] : []
  return slugs
    .map((slug, index) => {
      const track = typeof slug === 'string' ? tracksBySlug.get(slug) : undefined
      if (!track) return null
      return {
        track_number: index + 1,
        slug: track.slug,
        artist: track.artist_name,
        title: track.title,
        bpm: track.bpm,
        url: track.audio_url ?? '',
      }
    })
    .filter((entry): entry is ReleaseTracklistEntry => entry !== null)
}
```

Позиція «трек без track_number, порядок задає реліз» реалізована саме тут.

- [ ] **Step 4: Run** `npm run test:unit -- releaseTracklist` → PASS.

- [ ] **Step 5: Commit** `git add server/utils/releaseTracklist.ts tests/unit/releaseTracklist.test.ts && git commit -m "feat: hydrate release tracklist from first-class tracks"`

---

### Task 5: firebaseCatalog.ts — читання first-class tracks

**Files:**
- Modify: `server/utils/firebaseCatalog.ts`
- Test: наявні юніт-тести, що покривають `parseTrackParagraph`/fetch-хелпери (знайти через `grep -rl firebaseCatalog tests/`), адаптувати.

**Interfaces:**
- Consumes: Firebase вузли `tracks/<slug>` (без `release_slug`/`track_number`) і `releases/<slug>/tracklist` (string[]).
- Produces:
  - `fetchFirebaseCatalogTracks(): Promise<Map<string, CatalogTrack>>` — всі stored tracks.
  - `fetchFirebaseTracksForRelease(releaseSlug)` — тепер: реліз → `hydrateReleaseTracklist` → повертає `ReleaseTracklistEntry[]`-сумісні рядки, розширені `artist_slug` та `release_slug` (щоб API-shape не зламався): `{ slug, title, artist_name, artist_slug, bpm, audio_url, release_slug, track_number }`.
  - `fetchAllFirebaseTracks()` — ітерує публічні релізи в порядку їх `tracklist`, той самий розширений shape (трек у 2 релізах = 2 рядки з різними `release_slug`).
  - Фолбек: якщо в релізу немає `tracklist`-масиву (remote ще не синкнутий) — стара гілка `parseTrackParagraph` по `tracklistCompact` лишається, але slug рахувати канонічно: `slugifyFirebaseTrackPart(\`${artistName} ${title}\`)`.

- [ ] **Step 1:** Оновити `toStoredTrack` (без release_slug/track_number, з `audio_url`), додати `fetchFirebaseCatalogTracks`, переписати обидві fetch-функції через `hydrateReleaseTracklist`. У `parseTrackParagraph` замінити `slug: \`${releaseSlug}-${trackNumber}\`` на канонічний artist-title slug.
- [ ] **Step 2:** `npm run test:unit` → полагодити тести, що очікували старі slug'и.
- [ ] **Step 3:** Commit: `git commit -am "feat: firebase catalog reads first-class tracks via release tracklist"`

---

### Task 6: API-ендпоінти

**Files:**
- Modify: `server/api/tracks/index.get.ts`
- Modify: `server/api/tracks/[release_slug].get.ts`
- Modify: `server/api/track/[id].get.ts`
- Modify: `server/api/release/[id].get.ts`
- Test: `tests/unit/artistPageApi.test.ts` та інші зачеплені (`npm run test:unit`)

**Interfaces:**
- Consumes: `hydrateReleaseTracklist` (Task 4), `fetchFirebaseCatalogTracks`/`fetchAllFirebaseTracks` (Task 5).
- Produces (shape для фронтенду):
  - `GET /api/tracks` → `{ slug, title, artist_name, artist_slug, bpm, audio_url, release_slug, track_number }[]` — розгортка по релізах (трек у N релізах = N рядків); порядок: релізи за датою desc, всередині — порядок `tracklist`.
  - `GET /api/tracks/[release_slug]` → те саме для одного релізу.
  - `GET /api/track/[slug]` → `{ track, release, releases, artists, releaseTracks, similarTracks, likeCount }`, де `releases` — усі релізи, що містять трек; `release` — основний (найраніший за датою); legacy slug `<release>-<n>` → 301 на канонічний URL.
  - `GET /api/release/[id]` → реліз з гідрованим `tracklist: ReleaseTracklistEntry[]` (сумісно з поточними `AudioTrackPlaylist` і темплейтом сторінки релізу).

- [ ] **Step 1: /api/release/[id]** — замінити `normalizeReleaseTracklist(release)` на гідрацію:

```ts
const tracksBySlug = await fetchCatalogTracksBySlug() // supabase: select * from tracks; firebase: fetchFirebaseCatalogTracks()
return { ...release, tracklist: hydrateReleaseTracklist(release, tracksBySlug), like_count: count }
```

У Supabase-гілці досить `.in('slug', release.tracklist)` замість повного каталогу.

- [ ] **Step 2: /api/tracks (index) + /api/tracks/[release_slug]** — обидва будуються з релізів: отримати публічні релізи (з `tracklist`), гідрувати, розгорнути в плоскі рядки з `release_slug` і `track_number = index + 1`. Supabase-гілка: `releases.select('slug, date, tracklist').eq('visible', true)` + `tracks.select('*')`, join у пам'яті (773 рядки — дешево, кешується `catalogCacheOptions()`).

- [ ] **Step 3: /api/track/[id] + legacy 301** — `findTrack`:

```ts
// 1) пряме влучання по канонічному slug у tracks
// 2) legacy: /^(.+)-(\d+)$/ → знайти реліз за групою 1, взяти release.tracklist[n-1]
//    → sendRedirect(event, `/api/track/${canonical}`, 301) на API-рівні НЕ треба;
//    редірект робимо на рівні сторінки: ендпоінт повертає { redirect: canonicalSlug },
//    а app/pages/track/[id].vue виконує navigateTo(`/track/${redirect}`, { redirectCode: 301, replace: true })
```

`releases` = релізи, чий `tracklist` містить slug (Supabase: `.contains('tracklist', JSON.stringify([slug]))` на jsonb; Firebase: фільтр у пам'яті). `similarTracks` — за `artist_slug` по всіх треках, як зараз.

- [ ] **Step 4:** `npm run test:unit` і `npx nuxi typecheck` → PASS; полагодити зачеплене.
- [ ] **Step 5: Commit** `git commit -am "feat: track APIs serve canonical slugs with release-ordered tracklists"`

---

### Task 7: Фронтенд — сторінки release/tracks/track

**Files:**
- Modify: `app/pages/release/[id].vue` (прибрати `canonicalTrackSlug()`, рядки 35–46, 383–392 — використовувати `t.slug` напряму)
- Modify: `app/pages/tracks.vue` (тип рядка + лінк на `audio_url`)
- Modify: `app/pages/track/[id].vue` (обробити `redirect` з API + показ `audio_url`, список релізів треку)
- Modify: `app/types/index.ts`, `app/types/database.types.ts` (TrackRow: `audio_url: string | null`, без обов'язкових `release_slug`/`track_number`)

**Interfaces:**
- Consumes: API-shape з Task 6.

- [ ] **Step 1: release/[id].vue** — `playerTracks` тепер `item.tracklist` як є (там уже `slug`/`url`); усі `canonicalTrackSlug(t.track_number)` → `t.slug`; функцію видалити.
- [ ] **Step 2: tracks.vue** — до рядка треку додати іконку-лінк на аудіо:

```html
<a v-if="t.audio_url" :href="t.audio_url" target="_blank" rel="noopener" class="text-foreground/40 hover:text-foreground/70">
  <Icon name="lucide:play" class="inline size-3.5 align-middle" mode="svg" />
</a>
```

- [ ] **Step 3: track/[id].vue** — на початку setup: `if (data.value?.redirect) await navigateTo(\`/track/${data.value.redirect}\`, { redirectCode: 301, replace: true })`; блок «Releases» зі списком усіх релізів треку (`data.releases`); плеєр/лінк для `track.audio_url`, якщо є.
- [ ] **Step 4:** `npx nuxi typecheck`, `npm run test:unit` (включно з `tests/unit/audioTrackPlaylist.test.ts`) → PASS.
- [ ] **Step 5: Commit** `git commit -am "feat: pages consume canonical track slugs and audio links"`

---

### Task 8: Sitemap + лайк-ендпоінти

**Files:**
- Modify: `server/utils/sitemapUrls.ts` (`buildSitemapUrls()` — track-URL'и тепер із `data.tracks` ключів, не з `parseTrackParagraph`)
- Modify: тести sitemap (`grep -rl sitemap tests/unit/`)
- Check (без змін очікувано): `server/api/track-likes*`, `server/api/track-plays*` — приймають slug як opaque string, ремап уже зроблено в Task 2.

- [ ] **Step 1:** Оновити тест sitemap: очікувати `/track/boggy-elf-dream-of-ashvattha-in` замість `/track/va-tempo-syndicate-1`; run → FAIL.
- [ ] **Step 2:** `buildSitemapUrls()`: `Object.keys(data.tracks ?? {}).map(slug => ({ loc: \`/track/${slug}\` }))`; run → PASS.
- [ ] **Step 3:** Commit `git commit -am "feat: sitemap track urls from first-class tracks"`

---

### Task 9: Firebase sync + наскрізна верифікація

- [ ] **Step 1 (потребує підтвердження користувача):** `npm run sync:firebase` → у RTDB з'являється вузол `tracks` з канонічними slug'ами і оновлені `releases/*/tracklist`.
- [ ] **Step 2:** `rm -rf .nuxt/cache/nitro/handlers` (стале кеш-пастка з минулого разу).
- [ ] **Step 3:** Supabase-режим: `curl localhost:3001/api/tracks | head` → рядки з канонічними slug + `audio_url` для va-tempo-syndicate; сторінки `/tracks`, `/release/va-tempo-syndicate`, `/track/boggy-elf-dream-of-ashvattha-in` рендеряться; `/track/va-tempo-syndicate-1` → 301 на канонічний.
- [ ] **Step 4:** Firebase-режим: `CATALOG_SOURCE=firebase NUXT_IGNORE_LOCK=1 npm run dev -- --port 3002` → ті самі перевірки; лайки/plays працюють (вони Supabase-only).
- [ ] **Step 5:** Повний прогін: `npm run test:unit`, `npx nuxi typecheck`.
- [ ] **Step 6:** Оновити AGENTS.md (розділ Catalog export: описати `tracks` секцію + `release.tracklist`; оновити baseline тестів) і закомітити.

## Відкриті рішення (зафіксовані в цьому плані)

1. **Many-to-many без join-таблиці:** зв'язок зберігається як `release.tracklist: string[]` (однаково працює у Firebase і Supabase jsonb); `track_number` — похідне від позиції. Окремої таблиці `release_tracks` не заводимо (YAGNI).
2. **Дедуплікація треку:** однаковий канонічний slug на різних релізах = один трек; його bpm/audio_url беруться з першого джерела, конфлікти метаданих скрипт логуватиме для ручного розбору.
3. **`audio_url` на треку, не на зв'язку:** один канонічний файл на трек; якщо колись з'являться різні версії на різних релізах — тоді й з'явиться привід для join-таблиці.
4. **Legacy slug'и:** 301-редірект на сторінці `/track/[id]`; лайки/plays ремапляться SQL-ом один раз; згенерований remap SQL не комітиться (gitignored artifact), комітиться лише генератор.
