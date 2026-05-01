# Page Override: Home (`/`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the home page.
> Source: derived from a UX audit of `app/pages/index.vue` (47 lines today — only about-copy + 2 logos, no Hero, no content rows).
> The home page is the brand's main landing surface. It currently underdelivers: no `<Hero>` component despite it being defined and exclusive to home, no content rows despite CLAUDE.md noting "На головній видно одночасно Releases і Artists".

## Pattern

- **Page role:** Brand landing — first impression, then immediate access to the catalog. Both showcase ("here is what we do") and entry-point ("here is what's new").
- **Composition:** `<Hero>` → `Latest Releases` (Swiper row) → `Featured Artists` (Swiper row) → `Latest News + Upcoming Events` (compact dual-block) → `About slab` (light surface) → `Footer`.
- **Why this composition:** Hero is the brand moment (Julius monumental); content rows below let visitors enter the catalog without navigating; news/events block surfaces what's current; about slab anchors identity at the bottom for those who scroll all the way.

## Layout (top → bottom)

```
(no border-t — home is the entry surface, no need for the seam)
│
├── <Hero>  (existing component — ONLY rendered on home)
│   - font-julius "Sentimony" + per-letter "RECORDS" spans
│   - gradient mask `from-transparent to-black/50` at bottom
│   - py-[7.5em]…py-[11.5em] dramatic silence
│   - existing component, no changes required for v1
│
├── LATEST RELEASES STRIP (existing <Swiper> pattern, used on detail pages)
│   ┌────────────────────────────────────────────────────────────┐
│   │ Latest Releases                              [h2]          │
│   │ ─── horizontal scroll: <Item category="release"> × 12 ──── │
│   │ "View all releases →" terminal link at end of strip        │
│   └────────────────────────────────────────────────────────────┘
│   - h2 styling: text-sm uppercase tracking-widest text-white/50
│     (same as existing Swiper category title)
│   - 12 newest visible non-coming-soon releases
│   - terminal "View all" card or footer link below the row
│
├── FEATURED ARTISTS STRIP
│   ┌────────────────────────────────────────────────────────────┐
│   │ Featured Artists                             [h2]          │
│   │ ─── horizontal scroll: <Item category="artist"> × 12 ───── │
│   │ "View all artists →"                                       │
│   └────────────────────────────────────────────────────────────┘
│   - sort by category_id (existing curatorial order on /artists)
│   - musicians + DJs only (omit mastering / designers from home;
│     they are surfaced on /artists, not the home reel)
│
├── DUAL BLOCK: LATEST NEWS · UPCOMING EVENTS  (compact, side-by-side on lg+)
│   ┌────────────────────────────────────────────────────────────┐
│   │ Latest News                Upcoming Events                 │
│   │ ─────────                  ───────────────                 │
│   │ • Apr 28  ANNOUNCE         • Sat May 17  Tel Aviv          │
│   │   Title                      Title                         │
│   │ • Apr 12  INTERVIEW        • Fri May 23  Berlin            │
│   │   Title                      Title                         │
│   │ • Apr 02  RELEASE          (no upcoming → block hidden)    │
│   │   Title                                                    │
│   │ View all news →            View all events →               │
│   └────────────────────────────────────────────────────────────┘
│   - flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 py-8
│   - 3 latest news rows (Tier-1 News when available; falls back
│     to Tier-2 aggregated feed per pages/news.md)
│   - upcoming events row sorted ASC (soonest first, per pages/events.md)
│   - either side hides entirely when its data is empty
│
├── ABOUT SLAB  (light surface — fixes the current text-green-500 bug)
│   ┌────────────────────────────────────────────────────────────┐
│   │ <article class="Content">                                  │
│   │   <h2>About Sentimony Records</h2>                          │
│   │   <p>Sentimony Records is an independent psychedelic music │
│   │      label founded in Kyiv, Ukraine, in the autumn of 2006 │
│   │      by the visionary Ihor Orlovskyi, also known by his    │
│   │      moniker <a>Irukanji</a>.</p>                          │
│   │   <p>The label's main mission ...</p>                      │
│   │   <p>Over the years, Sentimony Records has focused on its  │
│   │      most beloved psychedelic subgenres:                   │
│   │      <a>DarkProg Psytrance</a> and                         │
│   │      <a>Trippy Psychill</a>. ...</p>                       │
│   │   <div class="flex justify-center gap-4 mt-6">             │
│   │     <img src="logoOldUrl" w/h=60>                          │
│   │     <img src="logoNewUrlv1" w/h=60>                        │
│   │   </div>                                                   │
│   │ </article>                                                 │
│   └────────────────────────────────────────────────────────────┘
│   - Wraps the about copy in the existing `.Content` slab
│     (light surface). This automatically fixes the link-colour
│     conflict: links inherit `text-blue-700` per .Content rules,
│     replacing the current text-green-500 / hover:text-green-300
│     that violated DESIGN.md §2.1.
│   - Both logos (old v1 + new v3.1) survive as the version pair —
│     remove dead refs to v3.2 and v3.3 (currently commented out;
│     just delete the constants entirely per refactor backlog #11).
│
└── (Footer renders globally via layout, not here)
```

## Tokens (overrides + additions)

All from MASTER + Light Surfaces. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Page wrapper | `container max-w-7xl` (was `max-w-lg`) | content rows |
| Strip h2 | `text-sm uppercase tracking-widest text-white/50` | row category title (existing Swiper pattern) |
| "View all" link | `text-sm text-white/60 hover:text-white transition-colors` | terminal nav link |
| Dual-block container | `flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 py-8` | news + events side-by-side |
| Dual-block column | `flex-1 min-w-0` | each side |
| Dual-block row | `flex items-start gap-3 py-2 hover:bg-white/5 rounded-sm` | each list item |
| Dual-block row date | `text-xs text-white/50 tabular-nums shrink-0 w-16` | leading date |
| Dual-block row category badge | `font-mono text-[10px] uppercase tracking-widest text-white/60` | inline category |
| About slab | reuse `.Content` class (existing) | about wrapper |
| About slab h2 | `text-sm font-bold m-0` (per #17, real `<h2>`) | section heading |
| About logos row | `flex justify-center gap-4 mt-6` | two-logo footer |

## Components

**Reuse:**
- `<Hero>` — keep as is, only rendered on home (its existing contract)
- `<Swiper>` — already used on home + detail; reuse for content strips
- `<Item category="...">` — strip cards
- `<NuxtLink>` for "View all" links and dual-block rows
- `<PageTitle>` — NOT used on home (home doesn't show "Home" as a title; the Hero IS the title)

**Do not introduce:**
- ❌ A new HomePage hero variant — the existing `<Hero>` is the brand moment
- ❌ A "live now" banner / countdown — same anti-pattern as event-detail (fights ISR caching)
- ❌ Auto-rotating featured carousels — curatorial = stable; rotation creates timing/a11y issues

## Data

No API changes required for v1. Use existing composables:

```ts
// app/pages/index.vue (after refactor)
const { data: releasesRaw } = await useReleases()
const { data: artistsRaw } = await useArtists()
const { data: newsRaw } = await useNews()           // when News entity lands (pages/news.md)
const { data: eventsRaw } = await useEvents()

const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))
const artists  = computed(() => toArray<Artist>(artistsRaw.value, 'artists'))
const events   = computed(() => toArray<Event>(eventsRaw.value, 'events'))

const latestReleases = computed(() =>
  releases.value
    .filter(r => r.visible && !r.coming_soon)
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
    .slice(0, 12)
)

const featuredArtists = computed(() =>
  artists.value
    .filter(a => a.visible && (a.category === 'musician' || a.category === 'dj'))
    .sort((a, b) => (a.category_id ?? 0) - (b.category_id ?? 0))
    .slice(0, 12)
)

const upcomingEvents = computed(() => {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  return (events.value ?? [])
    .filter(e => e.visible && e.date && new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
    .slice(0, 3)
})

const latestNews = computed(() => /* News entity slice 0..3 once schema lands */)
```

## Interactions specific to this page

- **Hero:** non-interactive (decorative). The existing per-letter "RECORDS" spans hint at future motion (currently static).
- **Swiper rows:** existing horizontal-scroll behaviour. Click on `<Item>` navigates to detail.
- **"View all" terminal link:** navigates to the corresponding listing.
- **Dual-block rows:** each is a `<NuxtLink>` to the entity detail page.
- **About slab:** authored prose with internal links via `v-html`; no special interaction.

## Accessibility specific to this page

- Heading hierarchy: `<h1>` is in the `<Hero>` (existing — Sentimony brand title). Then:
  - `<h2>Latest Releases</h2>` (Swiper)
  - `<h2>Featured Artists</h2>` (Swiper)
  - `<h2>Latest News</h2>` + `<h2>Upcoming Events</h2>` (dual-block columns)
  - `<h2>About Sentimony Records</h2>` (about slab)
- Linear, no skips.
- `<Hero>` decorative spans — already accessible (assuming the existing `<Hero>` component renders `<h1>` semantically; verify on implementation).
- Dual-block rows: each row is a `<NuxtLink>` with `aria-label` summarising the item.
- About slab images: `alt` attributes on logos; logos are decorative-redundant after the Hero so `alt=""` is acceptable on the second pair OR keep both with descriptive alt (favour descriptive for keyboard users).
- All `v-wave` on row links and "View all" links.

## Anti-patterns specific to this page

- ❌ **Do not use `text-green-500 hover:text-green-300` for about-slab links.** Wrap the about copy in `.Content` to inherit `text-blue-700`, OR formally document a green-link variant in DESIGN.md (decision: **wrap in `.Content`**, simplest; the green colour was an undocumented divergence).
- ❌ **Do not paginate Swiper rows.** Bounded `slice(0, 12)`; horizontal scroll is the affordance.
- ❌ **Do not render content rows as a vertical grid on home.** Strips are the home pattern; full grid is reserved for `/releases`, `/artists`, etc.
- ❌ **Do not auto-play any embedded media on home.** Same rule as everywhere — no autoplay without explicit user gesture.
- ❌ **Do not show inactive Swiper categories** (e.g. mastering / designers). Home is for primary surfaces.
- ❌ **Do not keep the dead `logoNewUrlv2`, `logoNewUrlv3` constants.** Per refactor backlog #11.
- ❌ **Do not let the dual-block sit at `max-w-7xl` while the about slab is `max-w-[640px]`.** Inconsistent gutters create visual jumps; keep dual-block at the page's container width and slab at its own (640px) for prose readability — this IS the intended hierarchy.

## Pre-delivery checklist (page-specific, in addition to MASTER)

### Structure & semantics

- [ ] `<Hero>` rendered (existing component, no change)
- [ ] `<Swiper>` strip "Latest Releases" with 12 newest non-coming-soon visible releases
- [ ] `<Swiper>` strip "Featured Artists" with 12 musicians/DJs sorted by category_id
- [ ] Dual-block "Latest News + Upcoming Events" side-by-side on lg+, stacked on mobile
- [ ] Either column hides entirely when its data is empty
- [ ] About copy moved into `.Content` slab; links automatically inherit `text-blue-700`
- [ ] `text-green-500` / `hover:text-green-300` removed from `aboutDescription` markup
- [ ] Dead logo constants (`logoNewUrlv2`, `logoNewUrlv3`) deleted
- [ ] About copy moved out of `<script>` literal into `app/constants/about.ts` (refactor backlog #11)
- [ ] Heading hierarchy: h1 (Hero) → h2 (4 sections) — linear, no skips
- [ ] Page wrapper `max-w-7xl` for content rows; about slab `.Content` keeps its own 640px

### Behaviour

- [ ] All `v-wave` on Swiper cards, "View all" links, dual-block rows
- [ ] All `:focus-visible` rings present (#14, #15)
- [ ] No autoplay; no live tickers

### Data

- [ ] `useReleases()`, `useArtists()`, `useEvents()`, `useNews()` (when shipped) feed home strips
- [ ] No client-side full-collection extra fetches beyond what's needed for slicing
- [ ] Latest News falls back to Tier-2 aggregated feed when News entity has 0 entries (per pages/news.md migration plan)

### Visual

- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Hero remains the brand moment — not visually overshadowed by content rows below
- [ ] Strips scroll smoothly; no horizontal-overflow on the page itself
- [ ] About slab respects Light Surfaces contract (border-t between dark and light surfaces, since hero/strips are dark and slab is light)

### SEO

- [ ] `useSeoMeta` covers home with brand-level title and description (current setup is fine)
- [ ] Optional JSON-LD `Organization` schema for Sentimony Records (label info, founder, founding date, sameAs social links)

## Out of scope (deferred / open questions)

- **Animated Hero** (per-letter scramble / fade-in): the existing per-letter spans are reserved for future animation; not part of this design pass.
- **"What's playing now"** widget — needs live state; ISR-incompatible.
- **Newsletter signup** — depends on email-marketing integration.
- **Personalized recommendations** for logged-in users — out of scope; profile page already surfaces likes.
- **Mobile sidebar with home-only featured nav** — `<OpenSidebar>` already covers nav; no special home variant.
- **i18n landing variants** (`/uk`, `/en`) — out of scope until label commits to multi-language.

## Cross-references

- `pages/news.md`: Latest News strip uses News entity (Tier 1) with Tier 2 fallback per migration plan.
- `pages/events.md`: Upcoming events row uses date-based filter consistent with /events.
- `pages/releases.md`: "Latest Releases" excludes coming-soon (those have their own strip on /releases).
- `pages/artists.md`: "Featured Artists" omits mastering/designer categories (home is for primary surfaces).
- Refactor backlog #11: about copy in `app/constants/about.ts`; dead logos deleted; green-link conflict resolved by `.Content` wrapping.
- Refactor backlog #2: `useDefaultSeo` once shipped.
- MASTER §Light Surfaces: about slab consumes the `.Content` contract; no conflicts.
- MASTER §Components: `<Hero>`, `<Swiper>`, `<Item>` are the building blocks — all already exist.
