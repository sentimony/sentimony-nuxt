# Page Override: Playlists (`/playlists`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Playlists listing page.
> Source: derived from a UX audit of `app/pages/playlists.vue` (47 lines today — flat grid of `<Item category="playlist">`, container `max-w-[112rem]`, sort applies `.reverse()` after a date-desc giving an ASC order — likely a bug or undocumented choice).
> Distinct from other listings: playlists are **curated content** (selections of tracks, often crossing label boundaries) — style/mood is a stronger axis than for any other content type.

## Pattern

- **Page role:** Browsable directory of curated playlists across moods and platforms (Spotify, Apple Music, YouTube, etc).
- **Composition:** `Spotlight (conditional)` → `Toolbar (style chips + sort)` → `Date-grouped grid of <Item category="playlist">` → `Empty state`.
- **Why diverge from `/releases` flat grid:** for playlists, **mood/style is the primary discovery axis**. A user looking for a "Dark Progressive Mix" cares about that label more than the release date. Style chips become a first-class control here.

## Layout (top → bottom)

```
container max-w-7xl   ← override of current max-w-[112rem]
│
├── <PageTitle>Playlists</PageTitle>
│
├── SPOTLIGHT  (only when at least one playlist has featured === true)
│   ┌──────────────────────────────────────────────────────────────────┐
│   │ Spotlight                                  [text-xs h2]          │
│   │ ┌──────┐  Style badge (e.g. DARK PROGRESSIVE)                    │
│   │ │ 140  │  Playlist Title                                         │
│   │ │ ×140 │  Curator · 24 tracks · 2h 15m                           │
│   │ │cover │                                                         │
│   │ └──────┘  [BtnPrimary] Listen on Spotify  [BtnPrimary] View page │
│   └──────────────────────────────────────────────────────────────────┘
│   - same Spotlight pattern as pages/artists.md
│   - Two CTAs: Spotify direct (primary) + view-page link
│   - Hidden completely when no featured playlist exists
│
├── TOOLBAR  (sticky top-[75px])
│   ┌──────────────────────────────────────────────────────────────┐
│   │ Style: [All] [Dark Prog] [Psychill] [Mix] [Sunset]            │
│   │                                                  [Sort ▾]    │
│   └──────────────────────────────────────────────────────────────┘
│   - style chips reuse pages/news.md filter-chip token
│   - chips DERIVED from data, normalised, deduplicated:
│     splitting Playlist.style on ',' and trimming, lower-casing
│     for matching but keeping a Title-Case display label
│   - sort options: Newest · Oldest · Most liked
│
├── GRID  (filtered + sorted, sort DESC by default — fix the current `.reverse()`)
│   ┌──────────────────────────────────────────────────┐
│   │ <Item category="playlist"> × N                   │
│   │ flex flex-wrap justify-center                    │
│   └──────────────────────────────────────────────────┘
│   - Year-grouping intentionally OMITTED (playlists are mood-led,
│     not chronology-led; year header would confuse the scan).
│     Style chips already deliver the primary scan affordance.
│
└── EMPTY STATE (filter result = 0)
    text-center py-24
    heroicons:queue-list size 48 text-white/30
    "No playlists match your filter"
    [Show all] reset button
```

## Tokens (overrides + additions)

All from MASTER. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Container | `container max-w-7xl` (was `max-w-[112rem]`) | page wrapper |
| Spotlight container | reuse `pages/artists.md` Spotlight token | spotlight |
| Style chip | reuse `pages/news.md` filter-chip token | toolbar |
| Sort `<select>` | reuse `pages/tracks.md` toolbar select token | toolbar |
| Toolbar | reuse `pages/releases.md` toolbar token | sticky toolbar |
| Empty state | reuse `pages/releases.md` empty-state token | filter zero result |

## Components

**Reuse:**
- `<Item category="playlist">` — already wired
- `<OpenImage>` for spotlight cover
- `<BtnPrimary>` for spotlight CTAs (Listen on Spotify + View page)
- `<Icon>` Heroicons
- `<PageTitle>` once shipped (#13)

**Do not introduce:**
- ❌ Custom dropdown — native `<select>`
- ❌ A new "PlaylistCard" — `<Item>` already covers this
- ❌ Year-grouping (intentional omission for this page only)

## Data

**Schema additions required:**

```ts
// app/types/index.ts — Playlist
export interface Playlist extends BaseEntity {
  // ... existing fields
  featured?: boolean    // NEW — for Spotlight (single boolean, only one playlist at a time)
  curator?: string      // NEW — display name of who compiled the selection
  track_count?: number  // NEW — server-side aggregate from at_playlists
  duration_minutes?: number  // NEW — server-side aggregate; render as "2h 15m"
  like_count?: number   // NEW — server-side aggregate for sort
}
```

`track_count` and `duration_minutes` derive from the existing `release.at_playlists` reverse-lookup; compute server-side at API level so the listing payload doesn't need release joins.

**Style chip derivation:**

```ts
const styleChips = computed(() => {
  const map = new Map<string, string>()  // key=lower, value=display
  visiblePlaylists.value.forEach(p =>
    p.style?.split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
      map.set(s.toLowerCase(), s)
    })
  )
  return Array.from(map.values()).sort()
})
```

Style chips are derived from data; if `style` data is sparse, only `[All]` chip renders.

**Filter / sort:**

```ts
const styleFilter = ref<'all' | string>('all')  // lower-case match
const sort = ref<'newest' | 'oldest' | 'liked'>('newest')

const filtered = computed(() => /* match style case-insensitively */)
const sorted = computed(() => /* desc by default — replaces .reverse() */)
```

**Sort fix:** the current `playlists.vue:6-13` does `sort(date desc).reverse()` which gives ASC order. Drop the `.reverse()` — newest first is the listing-page default across the project. If the original intent was ASC (oldest first), that should be a sort option, not a hidden default.

URL state: persist `style`, `sort` as query params.

## Interactions specific to this page

- **Spotlight:** independent of filters (curatorial). Hidden when no featured playlist.
- **Style chips:** single-select tab group. `[All]` resets.
- **Sort:** instant client-side resort.
- **Item card:** unchanged behaviour, navigates to `/playlist/[slug]`.
- **Empty state:** shown when style/sort yields 0 in the grid (Spotlight is independent).

## Accessibility specific to this page

- Heading hierarchy: `<h1>Playlists</h1>` → `<h2>Spotlight</h2>` (when present) → no further headings (the grid is items, not sections).
- Style chips: `role="tablist"` `aria-label="Filter playlists by style"`.
- Sort: native `<select>` with `<label class="sr-only">Sort playlists by</label>`.
- Empty state: `<div role="status">`.
- All `v-wave` on chips, sort, items, spotlight CTAs.

## Anti-patterns specific to this page

- ❌ **Do not paginate.** Bounded archive.
- ❌ **Do not group by year.** Mood-led content; chronology is secondary.
- ❌ **Do not let `.reverse()` survive.** Fix the sort order to date DESC default; expose ASC as a sort option if needed.
- ❌ **Do not auto-select the first style chip on mount.** `[All]` is the default.
- ❌ **Do not introduce per-style accent colours on chips.** Stay on opacity scale.
- ❌ **Do not show empty style chips.** Chips derive from data; if style data is missing, only `[All]` renders.
- ❌ **Do not auto-scroll on filter change.**

## Pre-delivery checklist (page-specific, in addition to MASTER)

- [ ] Container narrowed to `max-w-7xl`
- [ ] `.reverse()` removed; default sort is date DESC (newest first)
- [ ] Style chips derived from `Playlist.style`, deduplicated and sorted
- [ ] Spotlight renders only when a `featured: true` playlist exists
- [ ] Sort options functional, including `liked` using server-side `like_count`
- [ ] URL query persists style + sort
- [ ] Empty state appears for 0-result filters with Show all reset
- [ ] Spotlight CTAs: Listen on Spotify (direct external) + View page (internal nav)
- [ ] All `v-wave`; all `:focus-visible` rings present
- [ ] Heading outline: h1 → h2 (Spotlight only when present)
- [ ] Verified at 375 / 768 / 1024 / 1440

## Cross-references

- Refactor backlog #2: `useDefaultSeo`. Use here once shipped.
- Refactor backlog #12: container divergence — resolved here.
- Refactor backlog #13: `<PageTitle>`. Use here.
- `pages/artists.md`: shared Spotlight pattern; same `featured: boolean` field shape (different entity).
- `pages/releases.md`: same toolbar + empty-state tokens.
- `pages/news.md`: filter-chip token.
- `pages/tracks.md`: native `<select>` token.
