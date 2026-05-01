# Page Override: Events (`/events`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Events listing page.
> Source: derived from a UX audit of `app/pages/events.vue` (59 lines today — flat grid of `<Item category="event">`, container `max-w-[112rem]`, no upcoming/past separation).
> Distinct from all other listings: events have a **time axis** (upcoming vs past) that is the most important UX dimension.

## Pattern

- **Page role:** Browsable directory of all label events — upcoming gigs/festivals to attend AND past performances as historical record.
- **Composition:** `Upcoming section (conditional)` → `Toolbar (filter + sort, applies to past only)` → `Past events grid (year-grouped)` → `Empty states (independent for past vs filter)`.
- **Why diverge from `/releases` pattern:** events have a **before/after** semantic that releases lack. Mixing them in one date-sorted grid hides the most important question: "is this happening, or did it happen?"

## Layout (top → bottom)

```
container max-w-7xl   ← override of current max-w-[112rem]
│
├── <PageTitle>Events</PageTitle>
│
├── UPCOMING SECTION  (only when at least one visible event has date >= today)
│   ┌─────────────────────────────────────────────────────────┐
│   │ Upcoming  ·  3                          [h2 + count]    │
│   │ <Item category="event"> × N — sorted date ASCENDING     │
│   │ (soonest first; opposite of past sort)                  │
│   └─────────────────────────────────────────────────────────┘
│   - h2: text-2xl my-6 (Montserrat, NOT font-julius)
│   - count: text-white/40 ml-2 tabular-nums
│   - grid: flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]
│   - Hidden completely (h2 + grid) when no upcoming events exist
│
├── TOOLBAR  (sticky top-[75px], applies to PAST only — upcoming is curatorial)
│   ┌─────────────────────────────────────────────────────────┐
│   │ Year: [All] [2026] [2025] [2024] ...     [Sort ▾]       │
│   └─────────────────────────────────────────────────────────┘
│   - year chips reuse pages/news.md filter-chip token
│   - chips derived from data (only years that actually have events)
│   - sort options: Newest first · Oldest first
│   - location filter intentionally NOT included v1 — Event.location
│     is rough free text without normalisation (Tel Aviv vs "Tel Aviv, IL"
│     vs "Israel"). Defer until normalised location field lands.
│
├── PAST EVENTS  (year-grouped grid, sort date DESC inside each year)
│   ┌─────────────────────────────────────────────────────────┐
│   │ 2026                                  [h2, font-julius] │
│   │ <Item> <Item> <Item> ...                                │
│   │                                                         │
│   │ 2025                                                    │
│   │ <Item> <Item> ...                                       │
│   │                                                         │
│   │ 2024                                                    │
│   │ ...                                                     │
│   └─────────────────────────────────────────────────────────┘
│   - year heading: text-3xl font-julius opacity-30 my-8
│     (same decorative chronology marker used in news.md, releases.md)
│   - sections hidden completely when filter yields 0 inside that year
│
└── EMPTY STATES (two distinct cases)
    ┌──────────────────────────────────────────────────┐
    │ Case A: no past events at all                    │
    │ → no past section renders (silent)               │
    ├──────────────────────────────────────────────────┤
    │ Case B: filter yields 0 across all past events   │
    │ → text-center py-24                              │
    │   heroicons:calendar-days size 48 text-white/30  │
    │   "No past events match your filter"             │
    │   [Show all] reset button                        │
    └──────────────────────────────────────────────────┘
```

## Tokens (overrides + additions)

All from MASTER. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Container | `container max-w-7xl` (was `max-w-[112rem]`) | page wrapper |
| Upcoming heading | `text-2xl my-6` Montserrat + count `text-white/40 ml-2 tabular-nums` | upcoming section |
| Toolbar | reuse `pages/releases.md` toolbar token | sticky toolbar |
| Year chip | reuse `pages/news.md` filter-chip token | toolbar chip row |
| Sort `<select>` | reuse `pages/tracks.md` toolbar select token | toolbar |
| Past year header | `text-3xl font-julius opacity-30 my-8` (chronology decoration) | between past years |
| Empty state | reuse `pages/releases.md` empty-state token | filter zero result |

## Components

**Reuse:**
- `<Item category="event">` — already wired
- `<Icon>` Heroicons
- `<PageTitle>` once shipped (#13)
- `useDefaultSeo` once shipped (#2)

**Do not introduce:**
- ❌ Custom dropdown — native `<select>` (a11y win)
- ❌ Location filter v1 — data normalisation prerequisite
- ❌ Map view — out of scope for listing; potentially a separate `/events/map` route in the future

## Data

**Time axis derivation (client-side, server timezone-agnostic):**

```ts
const now = new Date()
now.setHours(0, 0, 0, 0)  // start of today

const visible = computed(() => events.value.filter(e => Boolean(e.visible)))

const upcoming = computed(() =>
  visible.value
    .filter(e => e.date && new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
)

const past = computed(() =>
  visible.value
    .filter(e => !e.date || new Date(e.date) < now)
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
)
```

**Note on timezone:** events span multiple TZs. For listing-page accuracy, "today" is the user's local date — events happening tonight in Tel Aviv may already be "past" in NZ. This is acceptable for the listing; detail-page status badge can be more precise per event location if `Event` schema gains a TZ field.

**Year filter chips derived from data:**

```ts
const availableYears = computed(() => {
  const years = new Set<string>()
  past.value.forEach(e => {
    const y = formatYear(e.date)
    if (y) years.add(y)
  })
  return Array.from(years).sort((a, b) => b.localeCompare(a))  // desc
})
```

**Filter / sort applied to past only:**

```ts
const yearFilter = ref<'all' | string>('all')
const sort = ref<'desc' | 'asc'>('desc')

const filteredPast = computed(() => /* apply yearFilter */)
const groupedPast = computed(() => /* group filteredPast by year */)
```

URL state: persist `year`, `sort` as query params.

## Interactions specific to this page

- **Upcoming section** is curatorial — never filtered, never sorted by toolbar. Always sorted ASC (soonest first). When zero upcoming events exist, the section is hidden.
- **Year chips:** single-select tab group. `[All]` resets.
- **Sort:** affects past events only; default Newest first.
- **Empty states:** distinct for "no past events at all" (silent) vs "filter yields 0" (with reset CTA).

## Accessibility specific to this page

- Heading hierarchy: `<h1>Events</h1>` → `<h2>Upcoming</h2>` (when present) → `<h2>2026</h2>` ... `<h2>2024</h2>` (year anchors). All real `<h2>` elements with full text content; the `font-julius opacity-30` on year headers is decorative styling only.
- Toolbar `<form>` wraps year chips and sort.
- Year chips: `role="tablist"` `aria-label="Filter past events by year"`.
- Sort: native `<select>` with `<label class="sr-only">Sort past events by</label>`.
- Empty state: `<div role="status">` for filter-result announcement.
- Each `<Item>` already accessible.
- Focus order: page heading → upcoming items → year chips → sort → past sections → footer.

## Anti-patterns specific to this page

- ❌ **Do not paginate.** Bounded historical archive.
- ❌ **Do not sort upcoming events DESC.** Soonest-first is the whole point.
- ❌ **Do not filter or sort upcoming.** Curatorial zone, always shown when populated.
- ❌ **Do not introduce location chips v1.** Free-text location data would create noisy chips.
- ❌ **Do not auto-collapse past events** (e.g. "show 5, click for more") — past events ARE the catalog, not deprecated content.
- ❌ **Do not show a single date-desc grid** mixing upcoming and past. Time axis must be visible.
- ❌ **Do not auto-scroll to top on filter change.** Preserve scroll.

## Pre-delivery checklist (page-specific, in addition to MASTER)

- [ ] Container narrowed to `max-w-7xl`
- [ ] Upcoming section appears only when ≥1 event has `date >= today`
- [ ] Upcoming section sorted ASC (soonest first)
- [ ] Past events sorted DESC inside each year
- [ ] Year chips derived from data, no empty-year chips
- [ ] Sort options functional (Newest / Oldest)
- [ ] URL query persists year + sort
- [ ] Year sections hide when filter yields 0 inside that year
- [ ] Global empty state appears only when filter yields 0 across ALL past
- [ ] Heading outline: h1 → h2 (upcoming) + h2 (each year), no skips
- [ ] All `:focus-visible` rings present
- [ ] All `v-wave` on chips, sort, items
- [ ] Verified at 375 / 768 / 1024 / 1440

## Cross-references

- Refactor backlog #2: `useDefaultSeo`. Use here once shipped.
- Refactor backlog #12: container divergence — resolved here.
- Refactor backlog #13: `<PageTitle>`. Use here.
- `pages/releases.md`: Coming Soon strip pattern is conceptually similar to Upcoming section (both promote items "still ahead" above a chronological archive).
- `pages/news.md`: filter-chip token; year-anchor pattern.
- `pages/tracks.md`: sticky toolbar + native `<select>` patterns.
