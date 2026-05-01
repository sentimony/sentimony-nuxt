# Page Override: Videos (`/videos`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Videos listing page.
> Source: derived from a UX audit of `app/pages/videos.vue` (47 lines today — flat grid of `<Item category="video">`, container `max-w-[112rem]`, no toolbar, no featured zone).
> Distinct from other listings: video is the only catalog where the **content itself is the cover** (YouTube thumbnail). Featured-zone with click-to-play preview makes far more sense here than on releases/artists.

## Pattern

- **Page role:** Browsable catalog of music videos, live performances, visualizers, mixes — anything the label has on YouTube.
- **Composition:** `Featured video (latest, click-to-play hero)` → `Toolbar (filter + sort)` → `Year-grouped grid of <Item category="video">` → `Empty state`.
- **Why diverge from `/releases` flat grid:** videos are the only content type where users want to *preview* before navigating. A featured zone with playable hero leverages that, while the rest of the catalog stays in the existing brand grid for visual consistency.

## Layout (top → bottom)

```
container max-w-7xl   ← override of current max-w-[112rem]
│
├── <PageTitle>Videos</PageTitle>
│
├── FEATURED (newest video, click-to-play)
│   ┌─────────────────────────────────────────────────────────┐
│   │  ┌──────────────────────────────────────────────────┐   │
│   │  │                                                  │   │
│   │  │   16:9 YouTube thumbnail (cover_xl or YT auto)   │   │
│   │  │                                                  │   │
│   │  │              ▶  (large play overlay)             │   │
│   │  │                                                  │   │
│   │  └──────────────────────────────────────────────────┘   │
│   │  Music Video · Apr 28, 2026          [text-xs/50]       │
│   │  Video Title                         [h2 text-2xl]      │
│   │  Artist Name (link to /artist/[slug] when resolved)     │
│   │  [BtnPrimary] Watch full video → /video/[slug]          │
│   └─────────────────────────────────────────────────────────┘
│   - aspect-video full container width up to max-w-3xl mx-auto
│   - poster: cover_xl, fallback YT auto-thumbnail
│   - play overlay: rounded-full size-20, bg-white/20 backdrop-blur-sm
│     border border-white/30, heroicons:play-solid 32px text-white
│     (NOT bg-red — keep brand-neutral; never use platform colours)
│   - click on poster: NAVIGATES to /video/[slug] (does NOT autoplay
│     inline; the detail page is where the player lives)
│   - hidden when no videos exist
│
├── TOOLBAR  (sticky top-[75px])
│   ┌─────────────────────────────────────────────────────────┐
│   │ Type: [All] [Music Video] [Live] [Visualizer] [Mix]     │
│   │                                          [Sort ▾]       │
│   └─────────────────────────────────────────────────────────┘
│   - type chips reuse pages/news.md filter-chip token
│   - chips depend on Video.category field (NEW — see Data section)
│   - until category lands, render only the [All] chip + sort
│   - sort: Newest · Oldest · Most liked
│
├── YEAR-GROUPED GRID  (the released catalog, excluding the featured one)
│   ┌─────────────────────────────────────────────────────────┐
│   │ 2026                                  [h2, font-julius] │
│   │ <Item category="video"> × N                             │
│   │                                                         │
│   │ 2025                                                    │
│   │ ...                                                     │
│   └─────────────────────────────────────────────────────────┘
│   - same year-anchor pattern as releases.md / events.md
│   - <Item category="video"> uses cover_th (square) — keep brand
│     consistency. The 16:9 thumbnail is reserved for the featured
│     hero only.
│
└── EMPTY STATE (filter result = 0)
    text-center py-24
    heroicons:video-camera-slash size 48 text-white/30
    "No videos match your filter"
    [Show all] reset button
```

## Tokens (overrides + additions)

All from MASTER. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Container | `container max-w-7xl` (was `max-w-[112rem]`) | page wrapper |
| Featured wrapper | `max-w-3xl mx-auto mb-8` | featured block |
| Featured poster | `aspect-video w-full rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]` | poster image |
| Featured play overlay | `absolute inset-0 flex items-center justify-center` + `size-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 group-hover:bg-white/30` | play button |
| Featured caption row | `text-xs text-white/50 mt-3` | "Music Video · date" |
| Featured title | `text-2xl mt-1` (Montserrat) | h2 |
| Featured artist link | `text-sm text-white/70 hover:text-white` | artist line |
| Toolbar | reuse `pages/releases.md` toolbar token | sticky toolbar |
| Type chip | reuse `pages/news.md` filter-chip token | toolbar |
| Sort `<select>` | reuse `pages/tracks.md` toolbar select token | toolbar |
| Year header | `text-3xl font-julius opacity-30 my-8` | between years |
| Empty state | reuse `pages/releases.md` empty-state token | filter zero result |

## Components

**Reuse:**
- `<Item category="video">` — already wired with `cover_th`
- `<BtnPrimary>` for featured CTA
- `<Icon>` Heroicons (`heroicons:play-solid`)
- `<NuxtLink>` for poster click target
- `<PageTitle>` once shipped (#13)

**Do not introduce:**
- ❌ A 16:9 video card variant for the grid. The featured zone covers the "preview properly" need; mixing aspect ratios in the grid breaks brand cohesion.
- ❌ An inline-iframe in the featured zone. Click navigates to `/video/[slug]` — this preserves performance (no YouTube embed loaded on listing pages) and keeps `/video/[slug]` as the canonical destination.
- ❌ Custom video card. Square `<Item>` is the brand pattern.

## Data

**Schema additions required:**

```ts
// app/types/index.ts — Video
export type VideoCategory = 'music-video' | 'live' | 'visualizer' | 'mix' | 'documentary' | 'interview'

export interface Video extends BaseEntity {
  // ... existing fields
  category?: VideoCategory   // NEW — for filtering
  artist_slugs?: string[]    // NEW — for artist link in featured
  track_slug?: string        // NEW — when video is a track's official MV
  release_slug?: string      // NEW — when video belongs to a release
  like_count?: number        // NEW — server-side aggregate for sort
}
```

These also drive `/video/[id]` features (see `video-detail.md`).

Until `category` exists, render only the `[All]` chip; sort still works on date / like_count.

**Featured derivation:**

```ts
const featured = computed(() => videosSortedByDate.value[0] ?? null)
const rest = computed(() => videosSortedByDate.value.slice(1))
```

Featured ignores filter state — curatorial slot, not exploratory. Same rule as `/releases` Coming Soon strip and `/artists` Spotlight.

**Filter / sort applied to `rest` only:**

```ts
const typeFilter = ref<'all' | VideoCategory>('all')
const sort = ref<'newest' | 'oldest' | 'liked'>('newest')

const filteredRest = computed(() => /* apply typeFilter */)
const sortedRest = computed(() => /* apply sort */)
const groupedByYear = computed(() => /* group sortedRest by year */)
```

URL state: persist `type`, `sort` as query params.

## Interactions specific to this page

- **Featured poster click:** navigates to `/video/[slug]` (no inline play). This is the most important UX rule on this page — see `video-detail.md` for why the player lives there.
- **Type chips:** single-select tab group. Hidden when no `category` data exists.
- **Sort:** affects `rest` only, not featured.
- **Year headers:** non-interactive, decorative.
- **Item card click:** standard navigation to `/video/[slug]`.
- **Empty state:** distinct copy / icon for filter zero result vs entirely empty catalog.

## Accessibility specific to this page

- Heading hierarchy: `<h1>Videos</h1>` → `<h2>` for the featured title → `<h2>` for each year. The featured caption ("Music Video · Apr 28") is `<p>`, not a heading.
- Featured poster: wrapped in `<NuxtLink>` with `aria-label="Watch {video title}"`. Play overlay icon `aria-hidden="true"` (decorative, the link label carries semantics).
- Type chips: `role="tablist"` `aria-label="Filter videos by type"`.
- Sort: native `<select>` with `<label class="sr-only">Sort videos by</label>`.
- Empty state: `<div role="status">`.
- Each `<Item category="video">` already accessible via existing pattern.
- Focus order: page heading → featured CTA → type chips → sort → grid → footer.

## Anti-patterns specific to this page

- ❌ **Do not autoplay or auto-load YouTube iframe on the listing page.** Each YT embed is ~600KB JS + tracking; loading even one on a listing page is a perf regression. Click-through to detail page is the contract.
- ❌ **Do not use red play-button colour.** Brand-neutral white-translucent overlay only. Platform colours leak brand identity into our UI.
- ❌ **Do not paginate.** Catalog is bounded.
- ❌ **Do not show 16:9 thumbnails in the catalog grid.** Square `<Item>` keeps cohesion with `/releases` and `/artists`.
- ❌ **Do not filter the featured zone.** Curatorial.
- ❌ **Do not auto-scroll on filter change.**

## Pre-delivery checklist (page-specific, in addition to MASTER)

- [ ] Container narrowed to `max-w-7xl`
- [ ] Featured zone shows latest video with poster + play overlay + caption + title + artist link
- [ ] Featured poster click navigates to `/video/[slug]` (no inline play)
- [ ] Featured ignores filter state (always shown when ≥1 video)
- [ ] Play overlay uses brand-neutral colour, NOT platform red
- [ ] Type chips render only when `category` data exists; otherwise just `[All]`
- [ ] Sort options functional (Newest / Oldest / Most liked when `like_count` lands)
- [ ] URL query persists type + sort
- [ ] Year sections collapse correctly when filter yields 0 inside year
- [ ] Empty state appears for 0-result filters
- [ ] Heading hierarchy: h1 → h2 (featured) → h2 (each year)
- [ ] All `:focus-visible` rings present
- [ ] All `v-wave` on featured CTA, chips, sort, items
- [ ] Verified at 375 / 768 / 1024 / 1440

## Cross-references

- Refactor backlog #2: `useDefaultSeo`. Use here once shipped.
- Refactor backlog #12: container divergence — resolved here.
- Refactor backlog #13: `<PageTitle>`. Use here.
- `pages/releases.md`: Coming Soon strip = curatorial pattern analog (different content, same "always shown when populated, ignores filters" rule).
- `pages/news.md`: filter-chip token; year-anchor pattern.
- `pages/tracks.md`: sticky toolbar + native `<select>`.
- `pages/video-detail.md`: poster click navigates there; consistent player ownership.
