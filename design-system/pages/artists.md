# Page Override: Artists (`/artists`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Artists listing page.
> Source: derived from a UX audit of `app/pages/artists.vue` (82 lines today — 4 category sections, no toolbar, container `max-w-[112rem]`, first `<h2>` commented out leaving Musicians section unanchored).
> Distinct from `releases.md`/`tracks.md` because Artists has a **structural axis** (4 categories) the others lack, plus inline-like on cards.

## Pattern

- **Page role:** Browsable directory of all collaborators across 4 roles: Producers & Musicians · DJs · Sound Engineers & Mastering · Visual Artists & Designers.
- **Composition:** `Spotlight (conditional)` → `Toolbar (search + sort)` → `4 category sections (h2 + count + grid)` → `Empty state`.
- **Why diverge from releases pattern:** artists have no release-date axis (no year grouping makes sense) and no tight style taxonomy worth chip-filtering. The category structure already provides scan affordance — augment it with sort + search, not chips.

## Layout (top → bottom)

```
container max-w-7xl   ← override of current max-w-[112rem]; aligned with MASTER §Spacing
│
├── <PageTitle>Artists</PageTitle>
│
├── SPOTLIGHT  (only when at least one artist has featured === true)
│   ┌──────────────────────────────────────────────────────────────────┐
│   │ Spotlight                              [text-xs h2 uppercase]    │
│   │ ┌──────┐ "Short curatorial copy or first paragraph of bio."      │
│   │ │ 140  │ Artist Name                                             │
│   │ │ ×140 │ Musician · Tel Aviv                                     │
│   │ │photo │                                                         │
│   │ └──────┘ [BtnPrimary] View profile                               │
│   └──────────────────────────────────────────────────────────────────┘
│   - container: bg-white/5 border border-white/10 rounded-md p-6 mb-8
│   - flex flex-col sm:flex-row gap-6
│   - photo via OpenImage (140×140)
│   - copy: text-white/80, max 3 lines line-clamp-3
│   - CTA: existing BtnPrimary linking to /artist/[slug]
│   - Hidden completely (not just empty) when no featured artist exists
│
├── TOOLBAR  (sticky top-[75px] z-10 bg-green-950/80 backdrop-blur-sm
│              border-b border-white/10 py-2 -mx-2 px-2)
│   ┌──────────────────────────────────────────────────────────────┐
│   │ [🔎 search name]                            [Sort ▾]         │
│   └──────────────────────────────────────────────────────────────┘
│   - search: rounded-md bg-white/5 border border-white/20 px-3 py-2
│     leading icon heroicons:magnifying-glass
│   - sort native <select> options:
│       Default (curatorial) · Most liked · Name A–Z · Recently liked
│
├── 4 CATEGORY SECTIONS  (each a real <section> with <h2>)
│   ┌─────────────────────────────────────────────────────┐
│   │ Producers & Musicians  ·  24                       │  ← h2 + count
│   │ <Item category="artist"> × N (with inline-like)    │
│   ├─────────────────────────────────────────────────────┤
│   │ DJs  ·  8                                          │
│   ├─────────────────────────────────────────────────────┤
│   │ Sound Engineers & Mastering Services  ·  3         │
│   ├─────────────────────────────────────────────────────┤
│   │ Visual Artists & Designers  ·  4                   │
│   └─────────────────────────────────────────────────────┘
│   - h2: text-2xl my-6 (Montserrat, NOT font-julius — these are
│     functional headers, not chronology decorators)
│   - count: text-white/40 ml-2 tabular-nums
│   - grid: flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]
│           (current behaviour preserved)
│   - section completely hidden (h2 + grid both removed) when count === 0
│     after applying search/sort
│
└── EMPTY STATE (search yields 0 across all categories)
    text-center py-24
    heroicons:user-group size 48 text-white/30
    "No artists match \"{{ search }}\""
    [Show all] reset button
```

## Tokens (overrides + additions)

All from MASTER. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Container | `container max-w-7xl` (was `max-w-[112rem]`) | page wrapper |
| Spotlight container | `bg-white/5 border border-white/10 rounded-md p-6 mb-8` | spotlight |
| Spotlight heading | `text-xs uppercase tracking-widest text-white/50 mb-2` | "Spotlight" label |
| Toolbar — bg | `bg-green-950/80 backdrop-blur-sm border-b border-white/10` | sticky toolbar |
| Toolbar — sticky offset | `top-[75px]` | under main header |
| Search input | reuse `pages/tracks.md` toolbar token | toolbar |
| Sort `<select>` | reuse `pages/tracks.md` toolbar token | toolbar |
| Section h2 | `text-2xl my-6` (Montserrat) | category headers |
| Section count | `text-white/40 ml-2 tabular-nums` | inline after h2 |
| Empty state | reuse `pages/releases.md` empty-state token | filter zero result |

**Container note:** identical resolution to `releases.md` — narrow from `max-w-[112rem]` to `max-w-7xl` per MASTER §Spacing.

**Decision on commented-out h2 (current line 41):** **bring it back.** The first section ("Producers & Musicians") must be anchored visually and semantically; an unlabelled section is an a11y regression and breaks the heading hierarchy.

## Components

**Reuse:**
- `<Item category="artist">` — keep, already supports inline-like
- `<OpenImage>` for spotlight photo
- `<BtnPrimary>` for spotlight CTA
- `<Icon>` Heroicons
- `<PageTitle>` once shipped (refactor backlog #13)
- `useDefaultSeo` once shipped (refactor backlog #2)

**Do not introduce:**
- ❌ A custom dropdown — native `<select>` (a11y win)
- ❌ Style chips — `Artist.style` is comma-separated free text with low normalisation; chip filtering would be noisy. Search covers this need.
- ❌ A new "ArtistCard" — `<Item>` already does this exact job
- ❌ A separate Spotlight component — inline layout, single use, defer extraction

## Data

**Schema additions required:**

```ts
// app/types/index.ts — Artist
export interface Artist extends BaseEntity {
  // ... existing fields
  featured?: boolean   // NEW — for Spotlight
  like_count?: number  // NEW (server-side aggregate) — for "Most liked" sort
}
```

`featured` is a curatorial boolean; only ONE artist should have it true at any time (UI assumes single spotlight). Validation: server-side or admin tooling, not enforced in TypeScript.

`like_count` should be precomputed in `/api/artists` payload (not fetched per-artist). If aggregating in Supabase costs too much, fall back to "Recently liked" sort using a `last_liked_at` field instead.

**Composables:** existing `useArtists()` is sufficient.

**Client-side computed (in artists.vue):**

```ts
const search = ref('')
const sort = ref<'default' | 'liked' | 'name' | 'recent'>('default')

const visibleArtists = computed(() =>
  artists.value.filter(a => Boolean(a.visible))
)

const featured = computed(() =>
  visibleArtists.value.find(a => a.featured) ?? null
)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return visibleArtists.value
  return visibleArtists.value.filter(a =>
    a.title?.toLowerCase().includes(q) ||
    a.name?.toLowerCase().includes(q)
  )
})

const sorted = computed(() => {
  switch (sort.value) {
    case 'liked':   return [...filtered.value].sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0))
    case 'name':    return [...filtered.value].sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''))
    case 'recent':  return [...filtered.value]  // server already orders this
    default:        return [...filtered.value].sort((a, b) => (a.category_id ?? 0) - (b.category_id ?? 0))
  }
})

const groupedByCategory = computed(() => ({
  musician:  sorted.value.filter(a => a.category === 'musician'),
  dj:        sorted.value.filter(a => a.category === 'dj'),
  mastering: sorted.value.filter(a => a.category === 'mastering'),
  designer:  sorted.value.filter(a => a.category === 'designer'),
}))
```

**URL state:** persist `search`, `sort` as query params. Hydrate on mount.

## Interactions specific to this page

- **Search:** debounce 200ms, case-insensitive, matches `title` OR `name` (DJ aliases differ from real names — match both).
- **Sort:** instant client-side resort.
- **Section visibility:** when search/sort yields 0 in a category, the entire `<section>` (h2 + grid) is removed. Only when ALL 4 categories are empty does the global empty state appear.
- **Spotlight:** independent of filters in v1 — always shown when a featured artist exists, even if search would otherwise hide them. (Rationale: spotlight is curatorial, not exploratory.)
- **Item card:** inline-like behaviour unchanged. Click navigates to `/artist/[slug]`.

## Accessibility specific to this page

- Heading hierarchy: `<h1>Artists</h1>` → `<h2>Spotlight</h2>` (when present) → `<h2>Producers & Musicians</h2>` … `<h2>Visual Artists & Designers</h2>`. Linear, no skips.
- Section count is plain text inside the h2, not a separate element (`<h2>Producers & Musicians <span class="text-white/40 ml-2">24</span></h2>`).
- Toolbar `<form role="search">` wraps search input.
- Sort: native `<select>` with `<label class="sr-only">Sort artists by</label>`.
- Empty state: `<div role="status">` so search-result changes are announced.
- Each Item card already has accessible like button (`aria-pressed`, `aria-label`) via `Item.vue`.
- Focus order: page heading → spotlight CTA → search → sort → section grids → footer.
- All `v-wave` on chips, sort, items.

## Anti-patterns specific to this page

- ❌ **Do not paginate.** Artist directory is small (≤50). Full listing is the right pattern.
- ❌ **Do not introduce style chips.** `Artist.style` is too noisy for chip filtering — would create chips with 1-artist memberships and poor reuse. Search handles it.
- ❌ **Do not group by location/country.** Geography is metadata, not a primary axis.
- ❌ **Do not allow `font-julius` on category headers.** They are functional headers; the year-anchor decoration is reserved for chronology pages (releases, news).
- ❌ **Do not show a Spotlight that auto-rotates.** Curatorial = stable. If we ever want rotation, it becomes a different pattern requiring MASTER amendment.
- ❌ **Do not let empty categories render an empty grid with just the h2.** Hide the entire section.
- ❌ **Do not auto-scroll to top on filter change.** Preserve scroll.

## Pre-delivery checklist (page-specific, in addition to MASTER)

- [ ] Container narrowed to `max-w-7xl`; verified at 1440 / 1920 / 2560
- [ ] First section heading `<h2>Producers & Musicians</h2>` is restored (currently commented out)
- [ ] All 4 sections have `<h2>` with count appended (`text-white/40 tabular-nums`)
- [ ] Spotlight renders only when a `featured: true` artist exists
- [ ] Search filters across both `title` AND `name` fields
- [ ] Sort options all functional, including `liked` ordering using server-side `like_count`
- [ ] Empty category sections (post-filter) hide both h2 and grid
- [ ] Global empty state appears only when ALL 4 sections are empty
- [ ] URL query persists search + sort across reload
- [ ] Spotlight ignores filter state (always visible when featured artist exists)
- [ ] All `v-wave` on toolbar inputs and item cards
- [ ] Heading outline: h1 → h2 (no skips)
- [ ] Verified at 375 / 768 / 1024 / 1440

## Cross-references

- Refactor backlog #2: `useDefaultSeo`, `useSortedByDate` — use here once shipped.
- Refactor backlog #12: `max-w-[112rem]` divergence — resolved here.
- Refactor backlog #13: `<PageTitle>` — use here once shipped.
- `pages/releases.md`: same toolbar pattern, same container resolution, same empty-state token.
- `pages/tracks.md`: search input + native `<select>` patterns reused.
- `pages/news.md`: filter-chip token NOT reused here (artists do not chip-filter).
- MASTER `<Item>` — inline-like for `category === 'artist'` is the only place this fires; document there if behaviour changes.
