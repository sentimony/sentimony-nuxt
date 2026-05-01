# Page Override: Releases (`/releases`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Releases listing page.
> Source: derived from a UX audit of `app/pages/releases.vue` (47 lines today — flat grid of `<Item>`, no filters, coming-soon mixed with released, container `max-w-[112rem]` diverging from MASTER §2.3).
> This is the brand's largest catalog. Discovery quality matters more here than on any other listing.

## Pattern

- **Page role:** Browsable, scannable catalog of all releases. The portfolio-grid pattern from MASTER applies, but enhanced with **status-aware sectioning, year anchors, and lightweight filters**.
- **Composition:** `Coming Soon strip (conditional)` → `Filter chips + Sort` → `Year-grouped grid of <Item>` → `Empty state (filter)`.
- **Why diverge from current flat grid:** at >40 releases, a single uniform grid loses scan affordance. Coming-soon items always sort to the top by date and push real content down. Style/format metadata is unused for filtering despite being present in the schema.

## Layout (top → bottom)

```
container max-w-7xl   ← override of current max-w-[112rem]; aligned with MASTER §2.3
│
├── <PageTitle>Releases</PageTitle>           (after refactor #13; until then h1 inline)
│
├── COMING SOON STRIP   (only if any visible release has coming_soon=true)
│   ┌──────────────────────────────────────────────────────────────────┐
│   │ Coming Soon                                          [text-xs]   │
│   │ ─── horizontal scroll: <Item> cards (compact 70px), 1 row ───    │
│   └──────────────────────────────────────────────────────────────────┘
│   - reuse <Swiper> component (already used on home + detail pages)
│   - heading: <h2 class="text-sm uppercase tracking-widest text-white/50 mt-4 mb-2">
│   - this is the brand promise area — unreleased music gets prominence,
│     but does not invade the released-grid scan zone
│
├── TOOLBAR  (sticky top-[75px] z-10 bg-green-950/80 backdrop-blur-sm
│              border-b border-white/10 py-2 -mx-2 px-2)
│   ┌────────────────────────────────────────────────────────────────┐
│   │ Style: [All] [Psytrance] [Darkprog] [Psychill] [Compilation]   │
│   │                                            [Sort ▾]            │
│   └────────────────────────────────────────────────────────────────┘
│   - chips reuse pages/news.md filter-chip token
│   - sort: native <select> styled to match BtnPrimary
│     options: Newest · Oldest · Cat# ↑ · Cat# ↓ · Most liked · Title A–Z
│   - mobile: chips wrap onto 2 lines, sort moves to its own row
│
├── YEAR-GROUPED GRID  (released items only — coming-soon already shown above)
│   ┌─────────────────────────────────────────────────────┐
│   │ 2026                                       [h2]    │
│   │ <Item> <Item> <Item> <Item> <Item> <Item> <Item>    │
│   │                                                     │
│   │ 2025                                                │
│   │ <Item> <Item> <Item> ...                           │
│   └─────────────────────────────────────────────────────┘
│   - year header: text-3xl font-julius opacity-30 my-8
│     (same decorative chronology marker as in pages/news.md)
│   - flex flex-wrap justify-start gap-y-2 (current uses justify-center —
│     keep current alignment; year header anchors the eye instead of centering)
│   - <Item v-for="i in releasesInYear" category="release" :i="i" />
│
└── EMPTY STATE (filter result = 0)
    text-center py-24
    heroicons:archive-box-x-mark size 48 text-white/30
    "No releases match your filter" + [Show all] reset button
```

## Tokens (overrides + additions)

All from MASTER. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Container | `container max-w-7xl` (was `max-w-[112rem]`) | page wrapper |
| Coming Soon heading | `text-sm uppercase tracking-widest text-white/50 mt-4 mb-2` | strip header |
| Coming Soon strip | reuse `<Swiper>` styling already in use on home + detail | strip body |
| Toolbar — bg | `bg-green-950/80 backdrop-blur-sm border-b border-white/10` | sticky toolbar |
| Toolbar — sticky offset | `top-[75px]` | under main header |
| Style chip | reuse `pages/news.md` filter-chip token | toolbar chip row |
| Sort `<select>` | reuse `pages/tracks.md` toolbar select token | toolbar |
| Year header | `text-3xl font-julius opacity-30 my-8` (decorative anchor only) | between year sections |
| Empty state container | `text-center py-24` | filter zero-results |
| Empty state icon | `heroicons:archive-box-x-mark` size 48 `text-white/30` | empty |
| Empty state copy | `text-white/50` | empty |

**Container note:** `max-w-7xl` is the global default per MASTER §Spacing. Today's `max-w-[112rem]` was an unintended divergence (also present on `artists.vue`, see Cross-references). If a wider grid is genuinely required, propose a new `max-w-wide` token in MASTER first — do not divergent inline.

## Components

**Reuse:**
- `<Item>` for grid cards — no change
- `<Swiper>` for the Coming Soon strip — already exists, used on home + detail
- `<NuxtLink>` row click target where applicable
- `<Icon>` Heroicons for sort/filter glyphs and empty state
- `<PageTitle>` once it lands (refactor backlog #13)
- `useDefaultSeo` once it lands (refactor backlog #2)

**Do not introduce:**
- ❌ A custom dropdown for sort — native `<select>` is the a11y win (same rule as `pages/tracks.md`)
- ❌ A new "ReleaseCard" — `<Item>` already covers this exact need
- ❌ A wide-container token — keep `max-w-7xl` until a second use case demands wider

## Data

No API changes required for v1. Existing `useReleases()` returns the full visible catalog.

**Client-side computed (in releases.vue):**

```ts
const styleFilter = ref<'all' | string>('all')
const sort = ref<'newest'|'oldest'|'cat-asc'|'cat-desc'|'liked'|'title'>('newest')

const visible = computed(() =>
  releases.value.filter(r => Boolean(r.visible))
)

const comingSoon = computed(() =>
  visible.value
    .filter(r => Boolean(r.coming_soon))
    .sort((a, b) => new Date(a.date ?? 0).getTime() - new Date(b.date ?? 0).getTime())
)

const released = computed(() =>
  visible.value.filter(r => !r.coming_soon)
)

const styleOptions = computed(() => {
  // Derive unique style tokens from the data, normalized
  const set = new Set<string>()
  released.value.forEach(r => r.style?.split(',').forEach(s => set.add(s.trim())))
  return Array.from(set).sort()
})

const filtered = computed(() =>
  styleFilter.value === 'all'
    ? released.value
    : released.value.filter(r => r.style?.toLowerCase().includes(styleFilter.value.toLowerCase()))
)

const sorted = computed(() => /* apply sort */)

const groupedByYear = computed(() => {
  const groups = new Map<string, Release[]>()
  for (const r of sorted.value) {
    const y = formatYear(r.date) || 'Unknown'
    if (!groups.has(y)) groups.set(y, [])
    groups.get(y)!.push(r)
  }
  return Array.from(groups.entries())  // preserves insertion order = sort order
})
```

**URL state:** persist `style`, `sort` as query params. Hydrate on mount; update via `navigateTo({ query }, { replace: true })` (no scroll reset).

## Interactions specific to this page

- **Coming Soon strip:** identical interaction model to home `<Swiper>` rows. Cards link to `/release/[slug]`. Strip is **conditional** — completely removed (not just empty) when no coming-soon items exist.
- **Style chips:** single-select tab group (same as `pages/news.md`). `[All]` resets the filter.
- **Sort `<select>`:** instant client-side resort (no fetch — full catalog already loaded).
- **Year header:** non-interactive, decorative anchor.
- **Item card:** unchanged from current behavior.
- **Empty state:** appears only when style/sort combo yields 0 results in the released grid (Coming Soon strip is independent of filters in v1 — does not collapse on filter mismatch).

## Accessibility specific to this page

- Heading hierarchy: `<h1>Releases</h1>` → `<h2>Coming Soon</h2>` (strip heading) → `<h2>2026</h2>` … `<h2>2025</h2>` (year anchors). All h2 to keep skim-friendly outline.
  - Year headers visually styled with `font-julius opacity-30` are still real `<h2>` elements with full text — not pseudo-headings.
- Toolbar `<form>` wraps filter chips and sort.
- Style chips: `role="tablist"` `aria-label="Filter releases by style"`; each `role="tab"` `aria-selected`.
- Sort: native `<select>` with `<label class="sr-only">Sort releases by</label>`.
- Empty state: `<div role="status">` so filter changes are announced.
- Coming Soon strip uses existing `<Swiper>` semantics (already accessible per home page audit).
- Focus order: page heading → coming-soon strip cards → style chips → sort → year sections → footer.
- All `v-wave` on chips, sort, items.

## Anti-patterns specific to this page

- ❌ **Do not paginate.** Catalog is bounded. If volume ever grows past 500, add `IntersectionObserver`-based chunking, not page-based pagination.
- ❌ **Do not show coming-soon items inside the year-grouped grid.** They have their own strip. Mixing produces the current "5 unreleased items at the top" UX bug.
- ❌ **Do not introduce per-style accent colours on chips.** Stay on the opacity scale.
- ❌ **Do not let `font-julius` year headers replace real `<h2>`s.** They are headings, not decorations — semantic markup with decorative styling.
- ❌ **Do not auto-scroll to top on filter change.** Preserve scroll.
- ❌ **Do not add inline-like to `<Item>`** for releases just because artists have it. Decision is currently `category === 'artist'` only — keep it (the like cluster on detail page already serves this).
- ❌ **Do not allow `max-w-[112rem]` to creep back in.** If a wider container is needed, document it in MASTER §Spacing first.

## Pre-delivery checklist (page-specific, in addition to MASTER)

- [ ] Container narrowed to `max-w-7xl`; visual smoke-test at 1440 / 1920 / 2560
- [ ] Coming Soon strip appears only when at least one `coming_soon === true` release is visible
- [ ] Coming Soon strip sorted by date **ascending** (soonest first); released grid sorted descending (newest first)
- [ ] Style chips derived from data, deduplicated, sorted alphabetically
- [ ] Sort options all functional: newest, oldest, cat# asc/desc (numeric where possible), most-liked, title A–Z
- [ ] URL query persists style + sort across reload
- [ ] Year sections render correctly across year boundary
- [ ] Year `<h2>` is real markup, not a `<div>` with heading styles
- [ ] Empty state appears for 0-result filters with working "Show all" reset
- [ ] Heading hierarchy linear: h1 → h2 (no skips, no h3 in v1)
- [ ] All chips and sort have `:focus-visible` ring
- [ ] All clickable surfaces have `v-wave`
- [ ] Verified at 375 / 768 / 1024 / 1440

## Cross-references

- Refactor backlog #2 (CLAUDE.md): `useDefaultSeo`, `useSortedByDate` extraction. Use here once shipped.
- Refactor backlog #12 (CLAUDE.md): container `max-w-[112rem]` divergence — **resolved here** by aligning to `max-w-7xl`. Same fix applies to `artists.vue`.
- Refactor backlog #13 (CLAUDE.md): `<PageTitle>` component. Use here once shipped.
- `pages/news.md`: filter-chip token, year-anchor pattern (consistent across pages).
- `pages/tracks.md`: sticky toolbar pattern, native `<select>` for sort, BPM-chips analog.
