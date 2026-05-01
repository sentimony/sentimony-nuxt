# Page Override: Tracks (`/tracks`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Tracks index page.
> Source: derived from a track-data-first reading. The page is a **catalog index / browse tool**, not a story page. It must not duplicate `/releases` (cover-grid catalogue) or `/news` (chronological stream). Its job is fast filtering by track-only metadata (BPM, artist, style, likes).

## Pattern

- **Page role:** Browsable, filterable, sortable index of all tracks across the catalog.
- **Composition:** `Stats strip` → `Sticky toolbar (search + sort + view)` → `BPM chips` → `Track list` (List view *or* Grouped-by-release view).
- **Why diverge from Master's portfolio-grid pattern:** square cover grids hide the per-track metadata (BPM, track number, like count). Tracks are dense, comparative items — they want a row format with sortable columns.

## Layout (top → bottom)

```
container max-w-7xl
│
├── <PageTitle>Tracks</PageTitle>          (after refactor #13; until then h1 inline)
│
├── STATS STRIP  (replaces the current bare flex of 6 counters)
│   ┌──────┬──────┬──────┬──────┬──────┬──────┐
│   │ 247  │  38  │  24  │  12  │  18  │ 32   │
│   │TRACKS│RELEAS│ARTIST│PLAYLI│VIDEOS│EVENTS│
│   └──────┴──────┴──────┴──────┴──────┴──────┘
│   - 6 cells in flex row, each cell flex-1
│   - dividers: border-r border-white/10 (last:border-r-0)
│   - number: text-2xl md:text-3xl text-white tabular-nums
│   - label: text-[10px] uppercase tracking-widest text-white/40
│   - cell wrapped in <NuxtLink> to its listing → hover bg-white/5, v-wave
│   - py-6 my-8
│
├── STICKY TOOLBAR  (sticky top-[75px] z-10 bg-green-950/80 backdrop-blur-sm
│                    border-b border-white/10 py-2 -mx-2 px-2)
│   ┌─────────────────────────────────────────────────────────────────┐
│   │ [🔎 search title or artist]   [Sort ▾]   [List | By release]    │
│   └─────────────────────────────────────────────────────────────────┘
│   - <form role="search">
│   - search input: rounded-md bg-white/5 border border-white/20 px-3 py-2
│     with leading icon heroicons:magnifying-glass (Iconify)
│   - sort: native <select> styled to match BtnPrimary (a11y > custom popover)
│     options: Newest · Oldest · BPM ↑ · BPM ↓ · Most liked · Title A–Z
│   - view toggle: 2-button segmented control with bg-white/{10|20} on active
│
├── BPM CHIPS  (flex flex-wrap gap-2 my-4, role="tablist")
│   [All]  [<120]  [120–130]  [130–140]  [140–150]  [>150]
│   - same chip token as pages/news.md filter chips
│
├── (DEFAULT: List view)
│   max-w-5xl mx-auto
│   <table class="w-full text-left">
│     <thead> sortable headers: # · Cover · Title / Artist · Release · Year · BPM · ♥
│     <tbody>
│       <tr is="NuxtLink" :to="/track/[slug]"> hover bg-white/20
│         <td>track number (text-white/40 tabular-nums)
│         <td>cover 40×40 rounded-sm ring-1 ring-white/30
│         <td>title (text-white) + artist (text-white/60 text-xs)
│         <td>release title (text-white/70, links to /release)
│         <td>year (text-white/50 tabular-nums)
│         <td>bpm pill (text-[10px] bg-white/10 px-1.5 py-0.5 rounded-sm)
│         <td>like count (heart icon + count, text-white/50)
│   </table>
│   - On <md: table collapses to stacked rows (display: block)
│       cover left, title/artist/release/year/bpm stacked right, no horizontal scroll
│   - Empty state if filter yields 0: heroicons:musical-note size 48 + "No tracks match"
│     + "Show all" button that resets all filters
│
└── (ALT: By release view)
    max-w-3xl mx-auto
    <ol> of <RelativeItem release> headers, each followed by an <ol> of tracks:
      <li> = <NuxtLink to="/track/[slug]"> with track number + artist + title + bpm
    - hover bg-white/10
    - This view is the only one keeping the existing tracklistCompact rendering
      pattern (but converted to real <NuxtLink>s — current v-html is fragile)
```

## Tokens (overrides + additions)

All from Master. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Stats cell — number | `text-2xl md:text-3xl text-white tabular-nums` | stats strip |
| Stats cell — label | `text-[10px] uppercase tracking-widest text-white/40` | stats strip |
| Stats cell — divider | `border-r border-white/10 last:border-r-0` | between cells |
| Stats cell — hover | `bg-white/5` | clickable cells |
| Toolbar — bg | `bg-green-950/80 backdrop-blur-sm border-b border-white/10` | sticky toolbar |
| Toolbar — sticky offset | `top-[75px]` (sits below the 75px header) | sticky toolbar |
| Search input | `rounded-md bg-white/5 border border-white/20 px-3 py-2` | toolbar |
| Sort `<select>` | `rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm` | toolbar |
| View segmented — active | `bg-white/20 border-white/40` | view toggle |
| View segmented — inactive | `border-white/20 text-white/60 hover:bg-white/30` | view toggle |
| BPM chip | reuse `pages/news.md` filter chip token | bpm row |
| Table row hover | `bg-white/20` | list view |
| BPM pill (in row) | `text-[10px] bg-white/10 px-1.5 py-0.5 rounded-sm` | list view, mobile sub-meta |
| Track number | `text-white/40 tabular-nums` | list view |
| Mobile collapse breakpoint | `md` (≥768px = full table; below = stacked) | list view |

**Container override:** page wrapper `max-w-7xl` (was `max-w-4xl`). List view inner `max-w-5xl mx-auto`. By-release inner `max-w-3xl mx-auto`.

## Components

**Reuse:**
- `<NuxtLink>` for row click target (no wrapper component)
- `<Icon>` for sort/search/empty-state glyphs (Heroicons)
- `<RelativeItem>` for By-release view headers
- `<PageTitle>` once it lands (refactor backlog #13); until then inline `<h1>`

**Do not introduce:**
- ❌ `Item.vue` square cards — wrong pattern for an index
- ❌ A custom dropdown component — native `<select>` is the a11y win
- ❌ A new "TrackRow" component — single-page use; keep inline

**To extract later (out of scope for this page, but track-page benefits):**
- The 6-cell stats strip pattern could become `<StatsStrip :cells>` if reused on `/contacts` or `/profile`. Defer until second use case appears.

## Data

**API change required.** Today only `/api/tracks/[releaseId]` exists. For the index, add:

```ts
// server/api/tracks/index.get.ts
export default defineCachedEventHandler(async () => {
  // Supabase: tracks LEFT JOIN releases LEFT JOIN artists
  // Return denormalized index rows
}, { maxAge: 3600 })

type IndexTrack = {
  slug: string
  title: string
  artist_name: string
  artist_slug?: string
  track_number: number
  bpm: number | null
  like_count: number
  release_slug: string
  release_title: string
  release_year: string  // pre-formatted to avoid client formatDate
  release_style?: string
  cover_th?: string
}
```

Cache headers identical to other API routes (1h CDN cache + 24h SWR — already set globally in nuxt.config).

**Composable:**

```ts
// app/composables/useTracksIndex.ts
export const useTracksIndex = () =>
  useAsyncData<IndexTrack[]>('tracks-index', () => $fetch('/api/tracks'))
```

**Client-side computed (in tracks.vue):**

```ts
const search = ref('')
const sort = ref<'newest'|'oldest'|'bpm-asc'|'bpm-desc'|'liked'|'title'>('newest')
const view = ref<'list'|'by-release'>('list')
const bpmRange = ref<'all'|'<120'|'120-130'|'130-140'|'140-150'|'>150'>('all')

const filtered = computed(() => /* search + bpmRange */)
const sorted   = computed(() => /* apply sort */)
const grouped  = computed(() => /* by release_slug, only when view==='by-release' */)
```

URL state: persist `search`, `sort`, `view`, `bpm` as query params. Hydrate on mount, update via `navigateTo({ query }, { replace: true })` (no scroll reset).

## Interactions specific to this page

- **Search:** debounce 200ms client-side filter (no server round-trip — full index already loaded). On submit (Enter): just blur the input; results are live.
- **Sort:** native `<select>` change → updates `sort.value` → re-renders sorted list.
- **View toggle:** instant client-side switch. Preserve scroll position when switching.
- **BPM chips:** same model as news filters. Multi-select OPTIONAL — keep single-select v1 for simplicity.
- **Row click:** entire `<tr>` (or stacked div on mobile) is the click target → `/track/[slug]`. `v-wave`.
- **Release link inside row:** stops propagation so it can navigate to `/release/[slug]` instead of `/track/[slug]`.
- **Sticky toolbar:** stays under the 75px header; backdrop-blur lets the photo background show through.
- **Empty filter result:** show "No tracks match" with a "Show all" button that resets `search`, `bpm`, but keeps `sort` and `view` (those are display preferences, not query).

## Accessibility specific to this page

- Stats strip: each cell is `<NuxtLink>` with `aria-label="247 tracks"` (since the visual breaks number and label apart).
- Toolbar `<form role="search">` wraps search input.
- Sort: native `<select>` with `<label class="sr-only">Sort tracks by</label>`.
- BPM chips: `role="tablist"` + `aria-label="Filter by BPM"`, each chip `role="tab"` `aria-selected`.
- View toggle: `role="radiogroup"` with `aria-label="View mode"`, each button `role="radio"` `aria-checked`.
- Table: real `<table>` with `<th scope="col">`. Sortable headers: `aria-sort="ascending|descending|none"` on the active sort column.
- Row link: `<tr>` cannot wrap an anchor. Use one of:
  - **Recommended:** `<a class="contents">` over the cells (display: contents) — modern, accessible
  - Or keep a single anchor in title cell + JS `onclick` on `<tr>` mirroring `aria-rowindex` (more code, weaker a11y)
- Empty state: `<div role="status">` so filter changes are announced.
- Heading hierarchy: page `<h1>Tracks</h1>` only. By-release view headers are `<RelativeItem>` cards, not `<h2>`s.
- Focus order: title → stats strip cells → search → sort → view toggle → BPM chips → table rows.
- Mobile: ensure no horizontal scroll on the table (stacked block layout under `md`).

## Anti-patterns specific to this page

- ❌ **Do not paginate.** Catalog is finite (~250 tracks). Full client-side index + filters outperforms paginated server queries.
- ❌ **Do not embed inline players in rows.** 250 audio iframes = jank. The detail page already has the player.
- ❌ **Do not use `font-julius` for table content.** Tabular numerals are Montserrat with `tabular-nums`.
- ❌ **Do not introduce per-style accent colours.** Style chips (if added later) stay on opacity scale.
- ❌ **Do not let the sticky toolbar overlap the page heading.** Keep `top-[75px]` so the heading scrolls out cleanly above it.
- ❌ **Do not auto-scroll to top on filter change.** Preserve scroll — user is exploring.
- ❌ **Do not render `tracklistCompact` via `v-html`** in the new By-release view. Convert to structured `<NuxtLink>`s.

## Pre-delivery checklist (page-specific, in addition to Master)

- [ ] `/api/tracks` index endpoint deployed and cached (1h CDN + 24h SWR)
- [ ] Stats strip reads counters from real data, not hardcoded
- [ ] Stats cells link to corresponding listings (not currently clickable)
- [ ] Sticky toolbar stays under header on scroll, no overlap
- [ ] Search filter is debounced, case-insensitive, matches title OR artist
- [ ] Sort options all functional, including BPM sort with null-handling (nulls last)
- [ ] BPM chips behave as single-select tab group with URL persistence
- [ ] View toggle preserves scroll position
- [ ] Mobile table collapses to stacked rows below `md`, no horizontal scroll
- [ ] Empty state appears for 0-result filters with working "Show all" reset
- [ ] Real `<NuxtLink>` rows in By-release view (no `v-html` tracklist)
- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Heading hierarchy linear: `<h1>Tracks</h1>` only
- [ ] All interactive elements have `:focus-visible` ring
- [ ] All `v-wave` on row links and stats cells

## Cross-references

- Refactor backlog #2 (CLAUDE.md): `useSortedByDate`, `useDefaultSeo`, `<EntityList>` extraction. The new index does NOT use `<EntityList>` (different pattern), but should still use `useDefaultSeo` once available.
- Refactor backlog #13 (CLAUDE.md): `<PageTitle>` component. Use it here once shipped.
- Refactor backlog #20 (CLAUDE.md): `/api/tracks/[release_slug]` rename. The new `/api/tracks` index is a separate endpoint, not affected by the rename.
