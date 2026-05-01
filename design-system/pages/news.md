# Page Override: News (`/news`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the News listing page.
>
> **Two-tier evolution.** This page transitions from an **aggregated feed** (current — releases + events + videos sorted by date) to a **first-class News entity feed** (target — editorial content with its own detail page). Both tiers coexist for the transition window, then Tier 1 deprecates the aggregator role of this page.

## Status: transitional

| Tier | Source | Purpose | When |
|------|--------|---------|------|
| **Tier 2 (current)** | Aggregated `releases + events + videos`, date desc | "What's new on the label" feed; auto-built from existing entities | Active until enough Tier 1 content exists |
| **Tier 1 (target)** | First-class `News` entities (own slugs, own detail pages at `/news/[slug]`) | Editorial: announcements, interviews, press releases, label updates, recaps | New entity to be added |

**Long-term intent:** `/news` becomes an editorial blog-style index of News entities. The aggregated feed pattern (release+event+video) moves out — either to a dedicated `/feed` or `/updates` route, or vanishes entirely once News entities cover the same notification need editorially.

For the transition window: both render side-by-side on `/news`, with News entities (Tier 1) getting visual priority above the aggregator stream (Tier 2). A feature flag (`NEWS_TIER` env var) can hide Tier 2 once enough News content exists.

## Pattern

- **Page role:** First-class News entries (editorial) + transitional aggregated feed (release/event/video chronology).
- **Composition (target):** `Featured news (latest News entity, full-bleed)` → `News filters` → `News timeline (grouped Year → Month)` → `(transitional) Aggregated feed below, separated by visible boundary`.
- **Why diverge from MASTER's portfolio-grid pattern:** News is a *stream*, not a catalogue. The latest item gets release-page-style prominence (cover + excerpt + read-more), the rest is a dense scannable timeline.

## Layout (top → bottom)

```
container max-w-7xl
│
├── <PageTitle>News</PageTitle>
│
├── FEATURED NEWS BLOCK  (Tier 1; only when ≥1 News entity exists)
│   ┌──────────────────────────────────────────────────────────────┐
│   │ <article>                                                    │
│   │ flex flex-col lg:flex-row gap-6, mb-12                       │
│   │                                                              │
│   │ LEFT  : <NuxtLink to="/news/[slug]"> wrapping cover           │
│   │         OpenImage 180×180 (mobile) / 256×256 (desktop)       │
│   │                                                              │
│   │ RIGHT :                                                      │
│   │   <span class="font-mono text-xs uppercase text-white/60     │
│   │     bg-white/5 px-2 py-0.5 rounded-sm"> Category badge       │
│   │     (ANNOUNCEMENT / INTERVIEW / PRESS / UPDATE / RECAP)      │
│   │   <p class="text-sm text-white/50"> Date · Author · 4 min read│
│   │   <h2 class="text-2xl md:text-4xl">                          │
│   │     <NuxtLink to="/news/[slug]">{{ title }}</NuxtLink>       │
│   │   </h2>                                                      │
│   │   <p class="text-white/70 line-clamp-3"> excerpt</p>         │
│   │   <BtnPrimary> Read more → /news/[slug]                      │
│   │ </article>                                                   │
│   └──────────────────────────────────────────────────────────────┘
│
├── NEWS FILTER CHIPS  (only when ≥1 News entity)
│   ┌──────────────────────────────────────────────────────────────┐
│   │ Type: [All] [Announcements] [Interviews] [Press] [Updates]   │
│   │                                                  [Sort ▾]    │
│   └──────────────────────────────────────────────────────────────┘
│   - chips reuse pages/news.md filter-chip token (self-reference)
│   - chips derived from News.category enum
│   - sort: Newest · Oldest · Most read (when readable_count exists)
│
├── NEWS TIMELINE  (Tier 1 — News entities, grouped Year → Month)
│   ┌──────────────────────────────────────────────────────────────┐
│   │ 2026                                  [h2 font-julius/30]    │
│   │ ───── April ─────                                            │
│   │ ┌───┐  Apr 28  ·  ANNOUNCEMENT                               │
│   │ │img│  News title                                       [→]  │
│   │ └───┘  excerpt one-liner...                                  │
│   │                                                              │
│   │ ┌───┐  Apr 12  ·  INTERVIEW                                  │
│   │ │img│  News title                                       [→]  │
│   │ └───┘  excerpt one-liner...                                  │
│   └──────────────────────────────────────────────────────────────┘
│   - <ol> with <li> per News entity
│   - row click target wraps the whole row
│   - cover thumbnail size-16 md:size-20 (matches transitional rows)
│
├── (TRANSITIONAL) AGGREGATED FEED  (Tier 2)
│   - Hidden behind feature flag `process.env.NEWS_TIER === 'tier-1-only'`
│   - When shown, separated from News timeline by visible boundary:
│     <hr class="border-white/10 my-12">
│     <h2 class="text-sm uppercase tracking-widest text-white/40 mb-2">
│       Catalog updates
│     </h2>
│     <p class="text-xs text-white/50 mb-6">
│       Auto-generated from new releases, events, and videos.
│     </p>
│   - Below this boundary: the original aggregated timeline
│     (release+event+video) with the existing row design.
│   - Eventually removed; for now provides notification continuity
│     until News entities cover the same ground.
│
└── EMPTY STATES (independent)
    - No News entities + Tier 2 disabled: "No news yet" + heroicons:newspaper
    - News filter yields 0: "No news matches this filter" + Show all
    - Aggregated feed empty (no recent releases/events/videos): silent
```

## Tokens (overrides + additions)

All from MASTER. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| News category badge | `font-mono text-xs uppercase tracking-widest text-white/60 bg-white/5 px-2 py-0.5 rounded-sm` | featured + timeline |
| News meta line | `text-sm text-white/50` | date · author · reading time |
| News excerpt | `text-white/70 line-clamp-3` | featured |
| News timeline row | `flex items-center gap-3 py-3 hover:bg-white/5 rounded-sm transition-colors duration-200` | each row |
| Year header | `text-3xl font-julius opacity-30 my-8` | timeline year markers |
| Month divider | `flex items-center gap-3` + `<hr class="flex-1 border-white/10">` + label `text-xs text-white/40 uppercase tracking-widest` | between months |
| Filter chips | reuse from news.md (self-canonical) | toolbar |
| Boundary between Tier 1 / Tier 2 | `<hr class="border-white/10 my-12">` + small section heading | tier boundary |
| Empty state | reuse `pages/releases.md` empty-state token | filter zero |

## Components

**Reuse:**
- `<NuxtLink>` for row + featured links
- `<OpenImage>` (or plain `<img>`) for featured cover
- `<BtnPrimary>` for "Read more" CTA
- `<Icon>` Heroicons (chevron, newspaper)
- `<PageTitle>` once shipped (#13)

**Do not introduce:**
- ❌ A "NewsCard" component yet — single-page use, defer until reused on home/index featured zone
- ❌ A markdown renderer — News body is HTML in `.Content` slab on detail page (same trust model as release/artist `information`)
- ❌ Tag/topic chips at v1 — start with `category` enum; tags are an open-ended feature

## Data

**Schema additions required:**

```ts
// app/types/index.ts — NEW
export type NewsCategory =
  | 'announcement'
  | 'interview'
  | 'press-release'
  | 'label-update'
  | 'recap'
  | 'artist-spotlight'

export interface News extends BaseEntity {
  // BaseEntity: slug, title, visible, date
  category: NewsCategory
  excerpt: string                    // 1-2 sentences for cards / SEO
  body: string                       // HTML — full article body
  cover_og?: string
  cover_th?: string
  cover_xl?: string
  author?: string                    // display name
  reading_time_minutes?: number      // server-computed from body word count
  related_release_slug?: string
  related_artist_slugs?: string[]
  related_event_slug?: string
  related_track_slug?: string
  related_video_slug?: string
  like_count?: number
  read_count?: number                // optional — for "Most read" sort
}

export interface NewsResponse {
  news: Record<string, News> | News[]
}
```

The existing `NewsItem` interface (in current `app/types/index.ts:200-207`) is the **aggregated-feed** type — keep it as is for Tier 2 compatibility, but rename internally to `AggregatedFeedItem` once Tier 1 reaches majority. Until then, both types coexist.

**API endpoints (new):**

```
GET /api/news              → News[]
GET /api/news/[slug]       → News (single, with related_* fully resolved server-side)
```

Cache headers identical to other content endpoints (1h CDN + 24h SWR).

**Composables (new):**

```ts
// app/composables/useNews.ts
export const useNews = () =>
  useAsyncData<NewsResponse>('news', () => $fetch('/api/news'))

// app/composables/useNewsItem.ts
export const useNewsItem = (slug: string) =>
  useAsyncData<News>(`news:${slug}`, () => $fetch(`/api/news/${slug}`))
```

**Tier 1/2 toggle (env-driven, no schema changes):**

```ts
const TIER_1_ONLY = process.env.NEWS_TIER === 'tier-1-only'
const showAggregatedFeed = computed(() =>
  !TIER_1_ONLY && (newsEntries.value.length === 0 || newsEntries.value.length < 5)
)
```

Default: show both. When News entity count ≥ 5 (heuristic), hide the aggregator visually. When `NEWS_TIER=tier-1-only`, hide unconditionally.

## Interactions specific to this page

### Featured block
- Cover and title are both clickable, navigating to `/news/[slug]`.
- `Read more` BtnPrimary same target.
- Reading time displayed when `reading_time_minutes` is present.

### Filter chips
- `[All]` resets.
- Chips derived from News.category enum, only categories with ≥1 entry are rendered.

### Timeline rows
- Entire row is one `<NuxtLink>`; cover, title, excerpt, chevron are within it.
- `v-wave` on the link.

### Tier 2 aggregated feed (transitional)
- Behaves identically to the current `news.vue` aggregated feed.
- Visually demoted: smaller heading ("Catalog updates"), explicit explanatory caption.
- When News entities exist and Tier 2 is active, Tier 2 is below Tier 1 with explicit boundary, never interleaved.

### Empty states
- "No news yet" — when zero News entities AND Tier 2 disabled.
- "No news matches this filter" — when filter applied to Tier 1 yields 0; Tier 2 not affected by Tier 1 filters.

## Accessibility specific to this page

- Heading hierarchy: `<h1>News</h1>` → `<h2>` for featured news title → `<h2>` for each year → `<h3>` for each month → (optional Tier 2 boundary) `<h2>Catalog updates</h2>` → `<h2>2026</h2>` (Tier 2 year, treated as new section).
- Hierarchy stays linear by treating the Tier 2 boundary as a sibling of Tier 1's year sections (both at h2). This requires the Tier 2 internal year headers to be h3 to avoid double h2-2026 collisions. Alternative: render Tier 2 as h2 if visually demarcated by the boundary `<h2>Catalog updates</h2>` and treat year inside Tier 2 as h3.
- Filter chips: `role="tablist"` `aria-label="Filter news by type"`.
- Sort: native `<select>` with sr-only label.
- Featured `<article>`.
- Timeline `<ol>` with `<li>`.
- Tier 2 separator `<hr>` is decorative; the `<h2>Catalog updates</h2>` heading provides the semantic break.
- Empty states: `<div role="status">`.

## Anti-patterns specific to this page

- ❌ **Do not interleave Tier 1 News entities with Tier 2 aggregated items.** Always keep Tier 1 above and Tier 2 below with explicit boundary.
- ❌ **Do not paginate.** Use chronological year/month groups; paginate later if archive grows past ~500 News entries.
- ❌ **Do not introduce per-category accent colours** for badges. Stay on opacity-scale.
- ❌ **Do not use `font-julius` for News titles.** Reserved for the year-anchor decoration.
- ❌ **Do not pre-render News body as Markdown.** HTML through `v-html` is the project's content trust model (Firebase/Supabase admin authored).
- ❌ **Do not auto-rotate the featured news.** Featured = newest News entity, deterministic.
- ❌ **Do not show the entire News body on the listing page.** Excerpt only; click-through to detail.
- ❌ **Do not let the Tier 2 aggregator appear ABOVE Tier 1.** Visual hierarchy = editorial first.

## Pre-delivery checklist (page-specific, in addition to MASTER)

### Tier 1 (News entities)

- [ ] News entity schema defined in `app/types/index.ts`
- [ ] `/api/news` and `/api/news/[slug]` endpoints serve News content
- [ ] `useNews()` and `useNewsItem(slug)` composables work
- [ ] Featured renders newest News entity; click navigates to `/news/[slug]`
- [ ] Category filter chips derived from data, only non-empty categories shown
- [ ] Sort options functional (Newest / Oldest; Most read when read_count exists)
- [ ] URL query persists category + sort
- [ ] Year/month grouping renders correctly across boundaries
- [ ] Heading hierarchy: h1 → h2 (featured) → h2 (year) → h3 (month) inside Tier 1

### Tier 2 (aggregated feed — transitional)

- [ ] Behaves identically to the previous aggregated feed
- [ ] Visually demoted with `<h2>Catalog updates</h2>` and caption
- [ ] Hidden when `process.env.NEWS_TIER === 'tier-1-only'`
- [ ] Boundary `<hr>` and heading provide clear visual + semantic separation
- [ ] No filter conflict with Tier 1 controls (Tier 2 unaffected by chips)

### Cross-tier

- [ ] Empty states distinct: no Tier 1 + Tier 2 disabled vs filter-zero in Tier 1
- [ ] All `v-wave` on rows and CTAs
- [ ] All `:focus-visible` rings present
- [ ] Verified at 375 / 768 / 1024 / 1440

## Migration path

1. **Phase 1 (now):** keep current aggregator behaviour. Add News entity schema + API + composables. No new UI yet.
2. **Phase 2:** add Tier 1 UI above the existing Tier 2 aggregator. First few News entries published. Both tiers visible.
3. **Phase 3:** once News entries accumulate (≥10), set `NEWS_TIER=tier-1-only` on staging to validate the editorial-only experience.
4. **Phase 4:** flip production to `tier-1-only` once editorial cadence is established. Remove Tier 2 code from `pages/news.vue`.
5. **Phase 5 (optional):** if the aggregator pattern is still useful, reintroduce at `/feed` with explicit "auto-generated" framing.

## Cross-references

- `pages/news-detail.md`: detail page for a single News entity (`/news/[slug]`).
- `pages/release-detail.md`, `pages/artist-detail.md`, `pages/event-detail.md`, `pages/track-detail.md`, `pages/video-detail.md`, `pages/playlist-detail.md`: any of these can be linked from a News entity via `related_*` fields.
- Refactor backlog #2: `useDefaultSeo` — use here once shipped.
- Refactor backlog #13: `<PageTitle>` — use here once shipped.
- MASTER §Light Surfaces: News detail body uses `.Content` slab (see `news-detail.md`); listing page does NOT use the slab (excerpts are dark-surface readable).
