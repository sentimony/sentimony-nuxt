# Release Tracklist Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Прискорити сторінки релізів з великим tracklist (напр. `/release/va-futured-vol-7`), прибравши дубльовану блокуючу гідратацію треків, зайві мережеві запити й повторну важку обробку назв на кожен трек — без змін у вигляді чи поведінці.

**Architecture:** Вимірювально-кероване виконання: baseline (кількість запитів + тайминг) → чотири незалежні оптимізації, кожна з власною верифікацією й окремим комітом → контрольний замір. Дані для `artist_slug` уже є на сервері в `CatalogTrack`, тож другий фетч треків усувається без нової логіки; related і track-plays виносяться з критичного шляху; обробка назв мемоізується на рівні util без зміни контракту компонентів.

**Tech Stack:** Nuxt 4 (SSR), Vue 3 `<script setup>`, `useFetch`/`useAsyncData`, Vitest (unit), reka-ui Tooltip, `npx nuxi typecheck`.

**Spec:** `docs/superpowers/specs/2026-07-21-release-tracklist-perf-design.md`

## Global Constraints

- Гілка `main`, **без git worktrees** (заборонено в цьому репо); нових npm-залежностей не додавати.
- Жодних змін у вигляді чи поведінці tracklist — тільки усунення зайвої роботи.
- Базлайн тестів зелений до і після кожної таски: `npm run test:unit` (39 файлів / 161 тест) і `npx nuxi typecheck` (локально можливі warnings про відсутні Supabase env — це ок).
- Коментарі в коді — англійською; код самодокументований, коментарі лише за потреби.
- Кожна оптимізація — окремий коміт; за бажанням користувача їх можна зсквошити перед мержем.
- Візуальна перевірка tracklist після кожної зміни на VA-релізі (`/release/va-futured-vol-7`) і звичайному (`/release/zymosis-an-endless-sense-of-the-past`).

---

### Task 1: Baseline вимірювання

**Files:** — (лише артефакти вимірювань, у git не комітяться)

**Interfaces:**
- Produces: зафіксовані числа baseline для порівняння в Task 7 (кількість XHR-запитів, час до інтерактивності/TBT на двох повільних і двох швидких релізах).

- [ ] **Step 1: Запустити dev**

Run: `npm run dev`
Expected: сервер на `http://localhost:3000` без помилок.

- [ ] **Step 2: Зняти baseline на повільних релізах**

Відкрити в чистому Chrome-профілі з відкритим DevTools → Network (disable cache) кожну зі сторінок:
- `/release/va-futured-vol-7`
- `/release/va-gatekey-vol-2`

Записати для кожної: кількість запитів до `/api/*`, наявність **обох** `/api/tracks/[slug]` і `/api/release/[slug]`, кількість викликів `/api/track-plays` (очікувано 2), DevTools → Performance TBT / Scripting time для першого завантаження.

- [ ] **Step 3: Зняти baseline на швидких релізах (контроль регресій)**

Ті самі метрики для:
- `/release/zymosis-an-endless-sense-of-the-past`
- `/release/mirror-me-azure-skies-and-golden-valleys`

Зберегти всі числа для опису PR — вони визначають, чи кожен крок дав вимірний зсув.

---

### Task 2: Прокинути `artist_slug` крізь гідратацію та прибрати дубль-фетч треків

**Files:**
- Modify: `server/utils/releaseTracklist.ts` (тип `ReleaseTracklistEntry` рядки 1-8; `hydrateReleaseTracklist` рядки 52-71)
- Modify: `tests/unit/releaseTracklist.test.ts` (очікуваний об'єкт рядки 19-27)
- Modify: `app/types/index.ts` (інтерфейс `ReleaseTrack` рядки 58-65)
- Modify: `app/pages/release/[id].vue` (рядки 11, 16-24, 74-101, 395)

**Interfaces:**
- Consumes: `CatalogTrack.artist_slug` (уже присутній, `releaseTracklist.ts:14`).
- Produces: `ReleaseTracklistEntry` та клієнтський `ReleaseTrack` містять поле `artist_slug: string`; `/api/release/[id]` повертає його в кожному елементі `tracklist`. Сторінка релізу більше **не** фетчить `/api/tracks/[id]`.

- [ ] **Step 1: Оновити тест гідратації (failing)**

У `tests/unit/releaseTracklist.test.ts` додати `artist_slug` до очікуваного об'єкта в тесті «hydrates slugs in release order»:

```ts
    expect(hydrateReleaseTracklist(release, tracksBySlug)).toEqual([{
      track_number: 1,
      slug: 'boggy-elf-dream-of-ashvattha-in',
      artist: 'Boggy Elf',
      artist_slug: 'boggy-elf',
      title: 'Dream Of Ashvattha (In)',
      bpm: 80,
      url: 'https://r2.example/01.mp3',
    }])
```

- [ ] **Step 2: Запустити тест — має впасти**

Run: `npx vitest run tests/unit/releaseTracklist.test.ts`
Expected: FAIL — отриманий об'єкт не має `artist_slug`.

- [ ] **Step 3: Додати `artist_slug` у гідратацію**

У `server/utils/releaseTracklist.ts` розширити тип:

```ts
export type ReleaseTracklistEntry = {
  track_number: number
  slug: string
  artist: string
  artist_slug: string
  title: string
  bpm: number | null
  url: string
}
```

і мапований об'єкт у `hydrateReleaseTracklist`:

```ts
      return {
        track_number: index + 1,
        slug: track.slug,
        artist: track.artist_name,
        artist_slug: track.artist_slug,
        title: track.title,
        bpm: track.bpm,
        url: track.audio_url ?? '',
      }
```

- [ ] **Step 4: Запустити тест — має пройти**

Run: `npx vitest run tests/unit/releaseTracklist.test.ts`
Expected: PASS (усі 3 тести).

- [ ] **Step 5: Додати `artist_slug` у клієнтський тип**

У `app/types/index.ts` в інтерфейс `ReleaseTrack`:

```ts
export interface ReleaseTrack {
  track_number: number
  slug: string
  artist: string
  artist_slug: string
  title: string
  bpm: number | null
  url: string
}
```

- [ ] **Step 6: Прибрати дубль-фетч у сторінці релізу**

У `app/pages/release/[id].vue`:

Видалити локальний тип `Track` (рядок 11) — він більше не потрібен.

Прибрати другий елемент `Promise.all` і `tracksAsync`/`tracks`:

```ts
const [releaseAsync, relatedAsync] = await Promise.all([
  useRelease(id as string, { server: true }),
  useFetch<RelatedResponse>(`/api/release/${id}/related`),
])

const item = releaseAsync.data
const releaseError = releaseAsync.error
const relatedReleases = computed(() => relatedAsync.data.value?.releases ?? [])
const relatedArtists = computed(() => relatedAsync.data.value?.artists ?? [])
```

Видалити computed `artistSlugByTrackNumber` (колишні рядки 99-101).

У computed `playerTracks` брати slug напряму з елемента tracklist:

```ts
const playerTracks = computed(() =>
  (item.value?.tracklist ?? []).filter(t => t.url).map((t) => {
    return {
      title: `${t.artist} - ${t.title}`,
      titleSegments: splitTitleByArtists(`${t.artist} - ${t.title}`, titleArtists.value),
      url: t.url,
      slug: t.slug,
      artist: t.artist,
      artistSegments: splitTitleByArtists(t.artist, titleArtists.value),
      name: t.title,
      nameSegments: splitTitleByArtists(t.title, titleArtists.value),
      cover: releaseCover.value,
      releaseLink: route.path,
      artistLink: t.artist_slug ? `/artist/${t.artist_slug}` : undefined,
    }
  })
)
```

У шаблоні tracklist замінити slug у `TrackArtists`:

```html
                <TrackArtists :name="t.artist" :slug="t.artist_slug" />
```

- [ ] **Step 7: Тести + typecheck**

Run: `npm run test:unit && npx nuxi typecheck`
Expected: unit зелені; typecheck без помилок (Supabase env warnings — ок). Якщо typecheck скаржиться на невикористаний `Track`/`tracksAsync` — прибрати залишки.

- [ ] **Step 8: Візуальна перевірка**

Run: `npm run dev`, відкрити `/release/va-futured-vol-7`.
Expected: у DevTools → Network **немає** запиту `/api/tracks/va-futured-vol-7`; tracklist рендериться ідентично (номери, посилання на артистів клікабельні й ведуть на правильні `/artist/*`, назви з розбиттям артистів, BPM). Перевірити `/release/zymosis-an-endless-sense-of-the-past` — без регресій.

- [ ] **Step 9: Commit**

```bash
git add server/utils/releaseTracklist.ts tests/unit/releaseTracklist.test.ts app/types/index.ts "app/pages/release/[id].vue"
git commit -m "perf(release): carry artist_slug in hydration, drop duplicate tracks fetch"
```

---

### Task 3: Зробити related-фетч неблокуючим

**Files:**
- Modify: `app/pages/release/[id].vue` (рядки 16-26)

**Interfaces:**
- Consumes: результат Task 2 (`Promise.all` уже без tracks).
- Produces: `/api/release/[id]/related` не блокує SSR/перший пейнт; `relatedReleases`/`relatedArtists` лишаються тими самими computed.

- [ ] **Step 1: Винести related з блокуючого `await`**

У `app/pages/release/[id].vue` залишити в `await` тільки реліз, а related зробити lazy:

```ts
const releaseAsync = await useRelease(id as string, { server: true })
const relatedAsync = useFetch<RelatedResponse>(`/api/release/${id}/related`, { lazy: true })

const item = releaseAsync.data
const releaseError = releaseAsync.error
const relatedReleases = computed(() => relatedAsync.data.value?.releases ?? [])
const relatedArtists = computed(() => relatedAsync.data.value?.artists ?? [])
```

- [ ] **Step 2: Тести + typecheck**

Run: `npm run test:unit && npx nuxi typecheck`
Expected: зелено.

- [ ] **Step 3: Візуальна перевірка**

Run: dev, `/release/va-futured-vol-7`.
Expected: блок related (схожі релізи/артисти під фолдом) усе одно з'являється після завантаження; немає порожнього блоку чи layout shift у контенті над фолдом; `titleArtists` (розбиття назв) працює завдяки фолбеку на `allArtists`.

- [ ] **Step 4: Commit**

```bash
git add "app/pages/release/[id].vue"
git commit -m "perf(release): load related block lazily, unblock first paint"
```

---

### Task 4: Прибрати дубльований `/api/track-plays`

**Files:**
- Modify: `app/components/AudioTrackPlaylist.vue` (props рядки 7-21; `playCounts` рядок 26; `onMounted` рядки 33-40)
- Modify: `app/pages/release/[id].vue` (передача пропа у `<AudioTrackPlaylist>`)

**Interfaces:**
- Consumes: `playCounts` computed/ref сторінки релізу (`Record<string, number>`).
- Produces: `AudioTrackPlaylist` приймає опційний проп `playCounts?: Record<string, number>`; якщо переданий — компонент **не** робить власний `/api/track-plays` GET, а синхронізує лічильники з пропа за семантикою `Math.max` (як лайки). Артист-сторінка (`<AudioTrackPlaylist :tracks="…">` без пропа) поводиться як раніше — фетчить сама.

- [ ] **Step 1: Додати опційний проп і прибрати дубль-фетч у компоненті**

У `app/components/AudioTrackPlaylist.vue` розширити `defineProps`:

```ts
const props = defineProps<{
  tracks: {
    title: string
    titleSegments?: TitleSegment[]
    url: string
    slug?: string
    artist?: string
    artistSegments?: TitleSegment[]
    name?: string
    nameSegments?: TitleSegment[]
    cover?: string
    releaseLink?: string
    artistLink?: string
  }[]
  playCounts?: Record<string, number>
}>()
```

Замінити ініціалізацію та `onMounted`-фетч:

```ts
const playCounts = ref<Record<string, number>>({ ...(props.playCounts ?? {}) })
const countedThisSession = new Set<string>()

const trackSlugs = computed(() =>
  props.tracks.map(t => t.slug).filter((s): s is string => Boolean(s))
)

watch(() => props.playCounts, (incoming) => {
  if (!incoming) return
  for (const [slug, n] of Object.entries(incoming)) {
    if ((playCounts.value[slug] ?? 0) < n) playCounts.value[slug] = n
  }
})

onMounted(async () => {
  if (props.playCounts) return
  if (!trackSlugs.value.length) return
  try {
    playCounts.value = await $fetch<Record<string, number>>('/api/track-plays', {
      query: { slugs: trackSlugs.value.join(',') },
    })
  } catch { /* counts stay empty */ }
})
```

(Оптимістичний інкремент на play — `playCounts.value[slug] = (…) + 1` рядок ~70 — лишається без змін; `watch` з `Math.max` не занижує локальний інкремент.)

- [ ] **Step 2: Передати `playCounts` зі сторінки релізу**

У `app/pages/release/[id].vue` знайти рендер плеєра tracklist і передати проп:

```html
        <AudioTrackPlaylist
          ref="player"
          :tracks="playerTracks"
          :play-counts="playCounts"
        />
```

(Точні наявні атрибути `<AudioTrackPlaylist>` зберегти; додати лише `:play-counts="playCounts"`.)

- [ ] **Step 3: Тести + typecheck**

Run: `npm run test:unit && npx nuxi typecheck`
Expected: зелено. Особливо `tests/unit/audioTrackPlaylist.test.ts` — переконатися, що не зламано (за потреби оновити, якщо тест мокав `/api/track-plays` без пропа — там проп не передається, тож поведінка та сама).

- [ ] **Step 4: Візуальна перевірка**

Run: dev.
Expected:
- `/release/va-futured-vol-7` → у Network **один** `GET /api/track-plays` замість двох; лічильники прослуховувань у рядках tracklist і в плеєрі однакові; клік play інкрементує лічильник.
- `/artist/irukanji` (Sentimony-таб) → лічильники прослуховувань усе ще з'являються (компонент фетчить сам, бо пропа немає).

- [ ] **Step 5: Commit**

```bash
git add app/components/AudioTrackPlaylist.vue "app/pages/release/[id].vue"
git commit -m "perf(release): dedupe track-plays fetch via playCounts prop"
```

---

### Task 5: Мемоізувати `splitTitleByArtists`

**Files:**
- Modify: `app/utils/tracks.ts` (`splitTitleByArtists` рядки 15-40)
- Modify: `tests/unit/tracks.test.ts` (додати тест мемоізації)

**Interfaces:**
- Produces: `splitTitleByArtists(title, artists)` кешує похідний `{ known, pattern }` у `WeakMap`, keyed за посиланням на масив `artists`, тож дорога побудова regex з повного списку артистів відбувається один раз на рендер-прохід, а не на кожен виклик (сторінка релізу викликає її ~4× на трек). Сигнатура і повертане значення незмінні.

- [ ] **Step 1: Написати тест на незмінність результату (failing на перфі не перевіряємо — фіксуємо контракт)**

У `tests/unit/tracks.test.ts` додати:

```ts
it('returns identical segments across repeated calls with the same artists list', () => {
  const artists = [
    { slug: 'boggy-elf', title: 'Boggy Elf' },
    { slug: 'irukanji', title: 'Irukanji' },
  ]
  const a = splitTitleByArtists('Boggy Elf - Dream', artists)
  const b = splitTitleByArtists('Boggy Elf - Dream', artists)
  expect(b).toEqual(a)
  expect(splitTitleByArtists('Irukanji - Tamed Siren', artists)).toEqual([
    { text: 'Irukanji', slug: 'irukanji' },
    { text: ' - Tamed Siren', slug: null },
  ])
})
```

(Якщо у файлі немає імпорту — додати `import { splitTitleByArtists } from '../../app/utils/tracks'` у стилі наявних тестів.)

- [ ] **Step 2: Запустити тест — має пройти на поточній реалізації**

Run: `npx vitest run tests/unit/tracks.test.ts`
Expected: PASS (тест фіксує очікуваний вихід перед рефактором; він захищає від регресії).

- [ ] **Step 3: Додати мемоізацію regex**

У `app/utils/tracks.ts` винести побудову `known`+`pattern` у кеш за посиланням на `artists`:

```ts
type CompiledArtists = { known: { slug: string, title: string }[], pattern: RegExp | null }

const compiledCache = new WeakMap<object, CompiledArtists>()

function compileArtists(artists: { slug: string, title?: string }[]): CompiledArtists {
  const cached = compiledCache.get(artists)
  if (cached) return cached

  const known = artists
    .filter((artist): artist is { slug: string, title: string } => Boolean(artist.title && artist.slug))
    .sort((a, b) => b.title.length - a.title.length)

  const pattern = known.length
    ? new RegExp(
        `(?<![A-Za-z0-9])(?:${known.map(artist => escapeRegExp(artist.title)).join('|')})(?![A-Za-z0-9])`,
        'gi',
      )
    : null

  const compiled: CompiledArtists = { known, pattern }
  compiledCache.set(artists, compiled)
  return compiled
}

export function splitTitleByArtists(title: string, artists: { slug: string, title?: string }[]): TitleSegment[] {
  const { known, pattern } = compileArtists(artists)

  if (!title || !pattern) return [{ text: title, slug: null }]

  const segments: TitleSegment[] = []
  let cursor = 0

  for (const match of title.matchAll(pattern)) {
    const index = match.index!
    if (index > cursor) segments.push({ text: title.slice(cursor, index), slug: null })
    const artist = known.find(a => a.title.toLowerCase() === match[0].toLowerCase())
    segments.push({ text: match[0], slug: artist?.slug ?? null })
    cursor = index + match[0].length
  }

  if (cursor < title.length) segments.push({ text: title.slice(cursor), slug: null })
  return segments
}
```

Примітка: `pattern` має прапор `g`, тож `lastIndex` міг би текти між викликами — але `String.prototype.matchAll` створює власний ітератор і не залежить від `pattern.lastIndex`, тож кешований regex безпечний для повторного використання. **Не** використовувати кешований regex з `pattern.exec()`/`test()` у циклі.

- [ ] **Step 4: Тести + typecheck**

Run: `npm run test:unit && npx nuxi typecheck`
Expected: зелено — зокрема наявні тести `tracks.test.ts` і новий тест мемоізації.

- [ ] **Step 5: Візуальна перевірка + замір**

Run: dev, `/release/va-futured-vol-7`, DevTools → Performance запис першого рендеру.
Expected: назви треків з розбиттям артистів ідентичні; Scripting time при рендері tracklist нижчий за baseline (Task 1). Якщо зсуву немає — крок усе одно коректний і безпечний, лишити.

- [ ] **Step 6: Commit**

```bash
git add app/utils/tracks.ts tests/unit/tracks.test.ts
git commit -m "perf(tracks): memoize splitTitleByArtists regex per artists list"
```

---

### Task 6: Один `TooltipProvider` на весь tracklist (measurement-gated)

**Files:**
- Modify: `app/pages/release/[id].vue` (блок tracklist, рядки 387-444)

**Interfaces:**
- Produces: замість двох `TooltipProvider` на кожен рядок tracklist — один спільний `TooltipProvider`, що огортає весь список; тултипи Play/Plays працюють як раніше.

- [ ] **Step 1: Перевірити доцільність за Task 1/Task 5 замірами**

Якщо після Task 2-5 Scripting/рендер уже в межах швидких релізів — цей крок опційний; виконувати лише якщо кількість `TooltipProvider` (2 × N треків) усе ще помітна у Performance-профілі (багато однакових Radix-інстансів). Рішення зафіксувати в коміт-повідомленні або пропустити таск.

- [ ] **Step 2: Огорнути tracklist одним провайдером**

У `app/pages/release/[id].vue` обгорнути весь `<template v-if="item.tracklist?.length">` блок одним `<TooltipProvider :delay-duration="0">` і прибрати два per-row `<TooltipProvider>` (навколо кнопки Play та навколо лічильника Plays), лишивши всередині `<Tooltip>`/`<TooltipTrigger>`/`<TooltipContent>` без змін:

```html
          <TooltipProvider v-if="item.tracklist?.length" :delay-duration="0">
            <p
              v-for="t in item.tracklist"
              :key="t.slug"
              class="flex items-center justify-between gap-2"
            >
              <!-- ...span з TrackArtists/TrackTitle без змін... -->
              <span class="flex items-center gap-1 shrink-0">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <button
                      :disabled="!t.url"
                      @click="playFromTracklist(t.slug)"
                      class="flex items-center text-xs rounded px-2 py-1 transition-colors duration-200 hover:bg-foreground/10 text-foreground/40 hover:text-foreground/70 disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Play"
                    >
                      <Icon name="lucide:circle-play" size="16" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Play</TooltipContent>
                </Tooltip>
                <NuxtLink
                  :to="`/track/${t.slug}`"
                  class="flex items-center gap-1 text-xs border border-transparent rounded px-2 py-1 transition-colors duration-200 hover:bg-foreground/10 hover:border-foreground/20 text-foreground/40 hover:text-foreground/70"
                >
                  <Icon name="lucide:audio-lines" size="12" />
                  View Track
                </NuxtLink>
                <Tooltip v-if="playCounts[t.slug]">
                  <TooltipTrigger as-child>
                    <span class="flex items-center gap-1 text-xs font-mono px-2 py-1 text-foreground/40">
                      <Icon name="lucide:headphones" size="12" />
                      {{ playCounts[t.slug] }}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Plays</TooltipContent>
                </Tooltip>
                <!-- ...кнопка like без змін... -->
              </span>
            </p>
          </TooltipProvider>
```

(Зберегти весь внутрішній вміст `<span>` — like-кнопку, класи — точно як у наявному коді; змінюється лише обгортка провайдера.)

- [ ] **Step 3: Тести + typecheck**

Run: `npm run test:unit && npx nuxi typecheck`
Expected: зелено.

- [ ] **Step 4: Візуальна перевірка**

Run: dev, `/release/va-futured-vol-7`.
Expected: тултипи «Play» і «Plays» показуються при наведенні на кожен рядок; hover/фокус працюють. Якщо тултипи ламаються — відкотити цей таск (`git revert`/`git reset`), він опційний.

- [ ] **Step 5: Commit**

```bash
git add "app/pages/release/[id].vue"
git commit -m "perf(release): single TooltipProvider for tracklist rows"
```

---

### Task 7: Контрольний замір і фіксація

**Files:**
- Modify: `docs/superpowers/specs/2026-07-21-release-tracklist-perf-design.md` (за потреби — відмітка результатів)

- [ ] **Step 1: Повна верифікація**

Run: `npm run test:unit && npx nuxi typecheck`
Expected: usе зелено (базлайн 39 файлів / 161 тест + доданий тест мемоізації; типи без помилок).

- [ ] **Step 2: Порівняти з baseline**

Повторити заміри Task 1 на `/release/va-futured-vol-7`, `/release/va-gatekey-vol-2`, `/release/zymosis-an-endless-sense-of-the-past`, `/release/mirror-me-azure-skies-and-golden-valleys`.
Expected:
- немає `/api/tracks/[slug]` запиту;
- один `/api/track-plays` замість двох;
- related не блокує перший пейнт;
- Scripting/TBT на VA-релізах нижчі за baseline; швидкі релізи без регресій.
Зафіксувати числа «до/після» для опису PR.

- [ ] **Step 3: Зафіксувати результат у специфікації**

Додати в кінець `docs/superpowers/specs/2026-07-21-release-tracklist-perf-design.md` короткий блок «Результати» з фактичними числами (кількість запитів до/після, TBT до/після).

```bash
git add docs/superpowers/specs/2026-07-21-release-tracklist-perf-design.md
git commit -m "docs(perf): record release tracklist optimization results"
```

---

## Self-Review

- **Spec coverage:** §Рішення 1 → Task 2; §Рішення 2 → Task 3; §Рішення 3 → Task 5 (+ опційний Task 6 для TooltipProvider); §Рішення 4 → Task 4; §Критерії успіху → Task 1 (baseline) + Task 7 (контроль). Усі пункти покриті.
- **Placeholder scan:** кожен крок містить конкретний код/команду; «measurement-gated» Task 6 має явний критерій виконання/пропуску, не placeholder.
- **Type consistency:** `artist_slug: string` узгоджено між `ReleaseTracklistEntry` (server), `ReleaseTrack` (client) і використанням `t.artist_slug` у сторінці; `playCounts?: Record<string, number>` узгоджено між пропом компонента й `playCounts` сторінки.
