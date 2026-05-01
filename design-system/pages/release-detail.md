# Page Override: Release Detail (`/release/[id]`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the single-release detail page.
> Source: derived from an audit of `app/pages/release/[id].vue` (446 lines today). Many issues already tracked in CLAUDE.md Refactoring backlog (#3–10, #14–19); this override documents the **design-level decisions** behind that work and adds new structural / UX recommendations not yet in the backlog.

## Pattern

- **Page role:** Single-release deep page. Shows what it is (cover, title, artists, metadata), how to listen / buy (player + platform CTAs), what's around it (tracklist, credits, related).
- **Composition:** `Breadcrumb` → `Title block (cat# + title + artists + actions)` → `Hero block (cover + structured meta + CTA groups + Tabs player)` → `.Content slab (tracklist + credits + relative + links)`.
- **Why this composition:** the page is currently float-based with metadata as flat `<p>` lines. A flex/grid + `<dl>` pass keeps the brand surface unchanged but fixes layout fragility, semantics, and CTA readability.

## Layout (top → bottom)

```
border-t border-white/30                           (existing seam, keep)
│
├── BREADCRUMB  (text-xs text-white/50 mt-2)
│   ← Releases    (NuxtLink to="/releases")
│
├── TITLE BLOCK  (centered, container max-w-7xl)
│   ┌────────────────────────────────────────────────┐
│   │       SRD-014   ← brand cat# badge             │
│   │       (font-mono text-xs uppercase             │
│   │        tracking-widest text-white/60           │
│   │        bg-white/5 px-2 py-0.5 rounded-sm)      │
│   │                                                │
│   │     Album Title                                │
│   │     (h1: text-2xl md:text-4xl my-2 md:my-4)    │
│   │                                                │
│   │     Artist A · Artist B                        │
│   │     (text-sm md:text-base text-white/80,       │
│   │      each artist linked to /artist/[slug])     │
│   │                                                │
│   │     2026 · Psytrance · LP · 75:42              │
│   │     (subtitle row: text-[11px] md:text-[13px]  │
│   │      text-white/50, ' · ' separator)           │
│   │                                                │
│   │     [♥ Like 12]   [↗ Share]                    │
│   │     (action row, gap-2, both buttons same      │
│   │      height/style)                             │
│   └────────────────────────────────────────────────┘
│
├── HERO BLOCK  (flex flex-col lg:flex-row gap-6)
│   ├── <SvgTriangle/> decorative
│   │
│   ├── LEFT (cover + structured meta + CTA groups)
│   │   ├── OpenImage size-[140px] sm:size-[280px] md:size-[320px]
│   │   │   (was 100/190; cover is the page hero — give it room)
│   │   │
│   │   ├── <dl> structured metadata (replaces float-based <p> lines)
│   │   │   grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm
│   │   │   <dt class="text-white/50">Release Date</dt><dd>{{ formattedDate }}</dd>
│   │   │   <dt class="text-white/50">Catalog Number</dt><dd class="font-mono">{{ cat_no }}</dd>
│   │   │   <dt class="text-white/50">Styles</dt><dd>{{ style }}</dd>
│   │   │   <dt class="text-white/50">Format</dt><dd>{{ format }}</dd>
│   │   │   <dt class="text-white/50">Total Time</dt><dd class="tabular-nums">{{ total_time }}</dd>
│   │   │
│   │   ├── CTA GROUP: Buy / Vinyl    (only if vinyl link exists)
│   │   │   <h3 class="text-xs uppercase tracking-widest text-white/50 mt-6 mb-2">Buy Vinyl</h3>
│   │   │   <div class="flex flex-wrap gap-2">
│   │   │     <BtnPrimary> Diggers Factory
│   │   │   </div>
│   │   │
│   │   ├── CTA GROUP: Download   (Bandcamp 16/24, Beatport, JunoDownload)
│   │   │   <h3 class="text-xs uppercase tracking-widest text-white/50 mt-6 mb-2">Download</h3>
│   │   │   <div class="flex flex-wrap gap-2"> ...BtnPrimary x N </div>
│   │   │
│   │   └── CTA GROUP: Stream   (Spotify, Apple, YT Music, Deezer, Amazon, Tidal, Qobuz, YT, SoundCloud)
│   │       <h3 class="text-xs uppercase tracking-widest text-white/50 mt-6 mb-2">Stream</h3>
│   │       <div class="flex flex-wrap gap-2"> ...BtnPrimary x N </div>
│   │
│   └── RIGHT (max-w-[540px] mx-auto)
│       <Tabs>  ← will become <MediaPlayers/> per refactor backlog #4
│       Bandcamp / SoundCloud / YouTube / YT Music — lazy-mount only the active tab
│
└── .Content SLAB  (light surface per MASTER Light Surfaces section)
    ├── information (HTML, v-html — Firebase content trusted)
    ├── <h2 class="text-sm font-bold m-0">Tracklist</h2>     ← was <small><b>
    │   <ol> ← real list, real <NuxtLink to /track/[slug]>
    │   each <li class="flex"> with separate <NuxtLink> (title) and <button> (like)
    │   — never nest <button> in <a>; never wrap interactive blocks in <p>
    │
    ├── <h2>Credits</h2>
    ├── <h2>Relative Releases</h2>     ← server-resolved per backlog #3
    ├── <h2>Relative Artists</h2>      ← server-resolved per backlog #3
    └── <h2>Links</h2>   (Discogs, Beatspace, Psyshop, Ektoplazm)
```

## Tokens (overrides + additions)

All from MASTER + Light Surfaces. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Breadcrumb | `text-xs text-white/50 hover:text-white mt-2` | top of page |
| Cat# brand badge | `font-mono text-xs uppercase tracking-widest text-white/60 bg-white/5 px-2 py-0.5 rounded-sm` | above h1 |
| Subtitle row separator | ` · ` literal in text, not markup | year/style/format/time row |
| Subtitle row | `text-[11px] md:text-[13px] text-white/50` | under artists |
| Action row | `flex justify-center gap-2 mb-4` | like + share |
| Like / Share buttons | `inline-flex items-center gap-2 border rounded px-4 py-2 text-sm transition-colors duration-200 hover:bg-white/10` | actions |
| CTA group heading | `text-xs uppercase tracking-widest text-white/50 mt-6 mb-2` | Listen/Buy/Download labels |
| CTA group container | `flex flex-wrap gap-2` | replaces vertical `mb-2 mr-2` cluster |
| Cover (hero) | `size-[140px] sm:size-[280px] md:size-[320px]` | was 100/190 |
| Meta `<dl>` | `grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm` | replaces float-based `<p>` |
| Meta `<dt>` | `text-white/50` | label column |
| Meta value (cat#) | `font-mono` | brand-id field |
| Meta value (time) | `tabular-nums` | numeric field |
| Section labels in `.Content` | `text-sm font-bold m-0` (as `<h2>`) | per MASTER Light Surfaces + backlog #17 |
| Tracklist row | `<li class="flex items-center justify-between gap-2">` | proper structure |

## Components

**Reuse:**
- `<OpenImage>` — keep, but enlarge (and fix `aria-hidden` per backlog #19)
- `<BtnPrimary>` — keep
- `<Tabs>` / `<Tab>` — keep until extracted into `<MediaPlayers>` (backlog #4)
- `<RelativeItem>` — keep
- `<SvgTriangle>` — keep
- `<Icon>` Heroicons

**To extract (refactor backlog — repeated here for design alignment):**
- `<MediaPlayers :links :tracks-number :track-number?>` (#4) — lazy-mounts iframe only for active tab
- `<EntityLinks :links group="stream|download|buy">` (#5) — replaces the 14× `<BtnPrimary v-if>` cluster
- `<MediaComingSoon>` (#10) — replaces the `comingMusic` HTML string
- `<PageTitle>` (#13) — replaces the inline `<h1>`

**To introduce on this page (new):**
- **Cat# badge** — small enough to inline; do not extract until a second use case
- **Share button** — small enough to inline; uses Web Share API with copy-link fallback (see Interactions)
- **Action row** (like + share grouped) — pure layout, no component

## Data

**API change (already in backlog #3 + #20 + #21):** `/api/release/[slug]` should return:
- The release itself
- `tracks` (resolved from current `/api/tracks/[slug]` — fold into single endpoint)
- `relative_releases_full` — resolved from `relative_releases: string[]` to full objects with `slug, title, cover_th, date`
- `relative_artists_full` — resolved from `artists: string | string[]` to full artist objects with `slug, title, photo_th`

This eliminates the current pattern of fetching the entire `useReleases()` + `useArtists()` collections on every detail page.

**Composable:** existing `useRelease(slug)` extends to return all of the above in one payload. Drop the separate `useFetch('/api/tracks/${id}')` call.

**No client-side state additions** beyond what already exists for likes.

## Interactions specific to this page

### Title block

- **Cat# badge:** non-interactive. Pure brand identity marker. Selectable text (users copy cat# for collectors / Discogs lookup).
- **Artist links:** each artist's name is a `<NuxtLink>` to `/artist/[slug]`. Comma-separated visually but each name is a discrete link.
- **Subtitle row** (`year · style · format · time`): plain text. Style and year may become filter-deeplinks to `/releases?style=...&year=...` later; **not in v1**.

### Action row

- **Like:** existing logic, with two refinements:
  1. When user is unauthenticated, the button is still visible; on click `navigateTo('/login')`. **Add a hover/focus tooltip** "Sign in to like" that appears only when `!user.value` (reuses footer-social tooltip pattern, `bg-[#8a0202]`).
  2. Hidden tooltip on touch devices (no hover) — fall back to the inline counter as the affordance.
- **Share:** new. Order of preference:
  1. `navigator.share({ title, url })` if available (mobile, modern browsers)
  2. `navigator.clipboard.writeText(window.location.href)` + ephemeral toast "Link copied" (3s, dismissible)
  3. Visual fallback: an `aria-label`-only icon button revealing nothing if neither API works (very rare in modern browsers)

### Hero block

- **Cover (`OpenImage`):** unchanged behaviour. Lightbox on click, Esc to close. Fix `aria-hidden` on the `⛄` placeholder (backlog #19).
- **CTA groups:** flex-wrap. On `<sm` they fit 1–2 per row; on desktop 4–6 per row. Group heading `<h3>` provides semantic skimming. Ordering: **Buy → Download → Stream** (purchase intent first, free streaming last — matches how the label monetises).
- **Tabs player:** lazy-mount per backlog #4. Only the active tab's iframe is rendered.

### `.Content` slab

- **Tracklist rows:** each `<li>` contains a `<NuxtLink>` (title) AND a `<button>` (like) **as siblings, not nested**. The current `<p v-for><NuxtLink>...<button>...</button></NuxtLink></p>` is invalid markup AND breaks screen readers (backlog #8).
- **Section labels** as real `<h2>` (backlog #17). Visual identical, semantic correct.
- **Relative releases / artists:** server-resolved per backlog #3 — no client-side full-collection fetch.

### Keyboard

- All actions reachable via Tab. `:focus-visible` ring on every button and link (backlog #14, #15).
- Esc closes the OpenImage lightbox (already implemented).
- **Do NOT add page-level keyboard shortcuts.** They would conflict with audio scrubbing inside Bandcamp/SoundCloud iframes (same rule as `pages/track-detail.md`).

## Accessibility specific to this page

- Heading hierarchy: `<h1>` (release title) → `<h2>` for `.Content` section labels (Tracklist, Credits, Relative Releases, Relative Artists, Links) and CTA group labels (Buy / Download / Stream — actually `<h3>` since CTA groups sit inside the hero block which is at h2-equivalent level, but in a flat structure h3 is fine; document explicitly which level on implementation).
  - **Decision:** keep CTA group labels as `<h3>` (subordinate to h1 title; siblings to no h2 in the hero). Section labels in `.Content` as `<h2>`. Linear outline: h1 → h2 (Tracklist) → ... ; h1 → h3 (Buy / Download / Stream) is acceptable as h2 is reserved for `.Content` sections.
  - If implementer prefers strict h1→h2→h3 nesting: promote CTA group labels to `<h2>` and `.Content` labels to `<h3>`. Either way must be consistent.
- Cat# badge: not announced as heading (`<span>`, not `<h2>`). Treated as inline metadata.
- Subtitle row: `<p>` with separators in text. Screen readers will read "2026 · Psytrance · LP · 75:42" as a single line — acceptable.
- `<dl>` for metadata: standard DT/DD pairing announces correctly.
- Like button: existing `aria-pressed` already in pattern. Tooltip `role="tooltip"` linked via `aria-describedby` when shown.
- Share button: `aria-label="Share this release"`; toast `role="status"` `aria-live="polite"`.
- Tracklist `<ol>` with `<li>` per track. Each `<NuxtLink>` and each like `<button>` are independent focusable items in the tab order.
- Breadcrumb: `<nav aria-label="Breadcrumb"><ol><li>← Releases</li></ol></nav>` (or single link if not adding full breadcrumb chain).
- Iframe: explicit `title` attribute (already done).

## Anti-patterns specific to this page

- ❌ **Do not keep `float-left` for cover layout.** Flex/grid is non-fragile; `<div class="clear-left" />` is a hack that should not survive the redesign.
- ❌ **Do not flatten metadata into more `<p>` tags.** `<dl>` is the correct structure for label/value pairs.
- ❌ **Do not nest `<button>` inside `<NuxtLink>`** in tracklist rows. Backlog #8.
- ❌ **Do not preload all 4 iframes.** Lazy-mount only the active tab.
- ❌ **Do not introduce per-platform brand colours** on `BtnPrimary`. Stay neutral, the platform icon carries the identity.
- ❌ **Do not place share button inside the meta `<dl>`.** It's an action, not metadata. Action row only.
- ❌ **Do not auto-advance to next release.** This page is a destination; navigation is explicit.
- ❌ **Do not let cat# become a link** in v1. Some collectors paste cat# into search engines — keep it pure text. (Future: `cat_no` → `/releases?cat_no=...` if we add that filter.)
- ❌ **Do not add Spotify-style ambient cover blur background** without explicit MASTER amendment. The brand has a global photo background; layering a per-release blurred cover on top creates competing surfaces. Permanent unless §2 fixed-bg rule is revisited.

## Pre-delivery checklist (page-specific, in addition to MASTER)

### Structure & semantics

- [ ] Breadcrumb `← Releases` above title block, focusable in tab order
- [ ] Cat# badge above h1, font-mono, non-interactive
- [ ] Subtitle row renders even when one or more fields are missing (graceful drop, no orphan separators)
- [ ] Action row contains Like + Share with identical visual height
- [ ] Cover sized `size-[140px] sm:size-[280px] md:size-[320px]`
- [ ] Meta block uses `<dl>` with semantic `<dt>` / `<dd>`; no `<p>` tags for labels
- [ ] CTA groups use real `<h3>` (or h2 — decision per implementation), wrapped in `flex flex-wrap gap-2`
- [ ] CTA group ordering: Buy → Download → Stream (existing groups respect this)
- [ ] Section labels in `.Content` are real `<h2>` (per backlog #17)
- [ ] Tracklist `<ol>` with `<li class="flex">`; `<NuxtLink>` and `<button>` are siblings, NOT nested
- [ ] No `float-left` / `clear-left` survivors in the meta layout

### Behaviour

- [ ] Share uses `navigator.share` → clipboard → graceful fallback chain
- [ ] Share success shows transient toast "Link copied" (3s, dismissible, `aria-live`)
- [ ] Like button shows tooltip "Sign in to like" only when unauthenticated AND not on touch
- [ ] OpenImage `⛄` placeholder wrapped in `aria-hidden="true"` (backlog #19)
- [ ] Only the active Tabs player iframe is mounted (lazy)
- [ ] No page-level keyboard shortcuts
- [ ] All `:focus-visible` rings present (backlog #14, #15)

### Data

- [ ] `relative_releases_full` and `relative_artists_full` are resolved server-side (backlog #3)
- [ ] Tracks fetched in single `/api/release/[slug]` payload, no separate `/api/tracks/[slug]` round-trip (backlog #20, #21)
- [ ] `useRelease()` uses `useAsyncData` with explicit key (backlog #7)
- [ ] 404-throw moved above `onMounted` registration (backlog #9)

### Compatibility

- [ ] `releases.vue` (listing) breadcrumb target works (`/releases` reachable)
- [ ] Light Surfaces contract respected: `.Content` keeps `bg-[#b5ccb5] text-black` + `text-blue-700` links + `border-black/30` dividers
- [ ] `text-green-500` link colour from `index.vue` does NOT appear here (per CLAUDE.md backlog #11 — green link is only an open question on the home page)

### Visual

- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Cover scales smoothly across breakpoints
- [ ] CTA groups wrap cleanly; no orphan single-button rows on common screens
- [ ] Subtitle row never wraps on mobile (drop fields with priority: time → format → style → year)
- [ ] All `v-wave` on interactive elements

## SEO upgrade (out of design-system scope, but recommended)

Add JSON-LD `MusicAlbum` schema in `useSeoMeta` block:

```ts
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'MusicAlbum',
      name: item.value.title,
      catalogNumber: item.value.cat_no,
      datePublished: item.value.date,
      genre: item.value.style,
      byArtist: artistsSortedByReleaseOrder.value.map(a => ({
        '@type': 'MusicGroup',
        name: a.title,
        url: `https://sentimony.com/artist/${a.slug}`,
      })),
      image: item.value.cover_xl || item.value.cover_og,
      url: absoluteUrl.value,
      // tracks: ... (optional, requires per-track JSON-LD)
    }),
  }],
})
```

Unlocks Google music card. **Not** part of this design override; flagged here for the implementation pass.

## Out of scope (deferred / open questions)

- **Sticky play-bar at top while scrolling** (mini-player pinned under main header). Same as `pages/track-detail.md` — introduces a second-tier sticky region that needs MASTER amendment first. Defer until a single new pattern is agreed.
- **Spotify-style ambient cover blur** — permanently out of scope (see Anti-patterns).
- **Style/year deeplink filters** from subtitle row — depends on `/releases` filter implementation landing first.
- **Per-track JSON-LD** in MusicAlbum schema — optional SEO depth, defer.

## Cross-references

- Refactor backlog #3 (CLAUDE.md): server-resolved relative releases/artists. Required.
- Refactor backlog #4: `<MediaPlayers>` extraction. Required.
- Refactor backlog #5: `<EntityLinks>` extraction. Required.
- Refactor backlog #6: kill `tracks-N` CSS in favour of computed iframe height. Required.
- Refactor backlog #7: `useFetch` → `useAsyncData` with explicit key. Required.
- Refactor backlog #8: tracklist invalid markup. Required.
- Refactor backlog #9: 404-throw ordering. Required.
- Refactor backlog #10: `<MediaComingSoon>` extraction. Required.
- Refactor backlog #11: `text-green-500` link colour question (home page only — does not apply here).
- Refactor backlog #13: `<PageTitle>`. Use here once shipped.
- Refactor backlog #14, #15: `:focus-visible` parity. Required.
- Refactor backlog #16: breadcrumb. Implemented as section "Breadcrumb" above.
- Refactor backlog #17: section labels semantic upgrade. Implemented.
- Refactor backlog #18: lazy iframe + reduced-motion. Required.
- Refactor backlog #19: `OpenImage` emoji aria-hidden. Required.
- Refactor backlog #20, #21: `/api/release/[slug]` payload consolidation. Required.
- `pages/news.md`: filter / chip patterns reused.
- `pages/tracks.md`: sticky toolbar pattern, native `<select>` for sort.
- `pages/track-detail.md`: same "no global keyboard shortcuts inside iframe-heavy pages" rule, same tooltip pattern for like-button, same Out-of-scope status for sticky play-bar.
- MASTER §Light Surfaces: `.Content` slab contract.
