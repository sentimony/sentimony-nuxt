# Page Override: Artist Detail (`/artist/[id]`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Artist detail page.
> Source: derived from an audit of `app/pages/artist/[id].vue` (236 lines today). Shares ~70% of structure with `release-detail.md` (cover + meta + Tabs + `.Content` slab); this override documents the **shared changes** and the **artist-specific** decisions.

## Pattern

- **Page role:** Single-artist deep page. Shows who they are (photo, name, role, location, style), how to follow / listen (CTAs + embedded media), what they made on the label (discography), with bio prose.
- **Composition:** `Breadcrumb` → `Title block (category + name + subtitle + actions)` → `Hero block (photo + structured meta + grouped CTAs + Tabs)` → `Discography grid` → `.Content slab (bio)`.
- **Why diverge from current artist page:** category is hidden from view (it's in the DB but invisible in UI), follow CTA is buried under "Links" cluster, discography is a flat list inside the light slab — three distinct UX losses, all fixable with the same patterns we set for release-detail.

## Layout (top → bottom)

```
border-t border-white/30                           (existing seam, keep)
│
├── BREADCRUMB                                     ← NEW (per backlog #16)
│   ← Artists
│
├── TITLE BLOCK  (centered, container max-w-7xl)
│   ┌────────────────────────────────────────────────┐
│   │       MUSICIAN          ← category badge       │
│   │       (font-mono text-xs uppercase             │
│   │        tracking-widest text-white/60           │
│   │        bg-white/5 px-2 py-0.5 rounded-sm)      │
│   │                                                │
│   │     Artist Name                                │
│   │     (h1: text-2xl md:text-4xl my-2 md:my-4)    │
│   │                                                │
│   │     Tel Aviv · Psytrance, Darkprog             │
│   │     (subtitle row: text-[11px] md:text-[13px]  │
│   │      text-white/50, ' · ' separator,           │
│   │      drops empty fields gracefully)            │
│   │                                                │
│   │     [♥ Like 12]  [↗ Share]  [↳ Follow Bandcamp]│
│   │     (action row — 3 actions, same height,      │
│   │      Follow CTA only when bandcamp_url exists  │
│   │      OR soundcloud_url for DJ category)        │
│   └────────────────────────────────────────────────┘
│
├── HERO BLOCK  (flex flex-col lg:flex-row gap-6)
│   ├── <SvgTriangle/> decorative
│   │
│   ├── LEFT (photo + structured meta + CTA groups)
│   │   ├── OpenImage size-[140px] sm:size-[280px] md:size-[320px]
│   │   │   (was 100/190; same enlargement as release-detail)
│   │   │
│   │   ├── <dl> structured metadata
│   │   │   <dt>Name</dt><dd>{{ name }}</dd>
│   │   │   <dt>Location</dt><dd>{{ location }}</dd>
│   │   │   <dt>Styles</dt><dd>{{ style }}</dd>
│   │   │
│   │   ├── CTA GROUP 1 — label conditional on category:
│   │   │   ┌──────────────┬─────────────────────────────────────┐
│   │   │   │ category     │ label  / contents                   │
│   │   │   ├──────────────┼─────────────────────────────────────┤
│   │   │   │ musician     │ Listen · Bandcamp, Spotify, Apple,  │
│   │   │   │              │   YT Music, YouTube                 │
│   │   │   │ dj           │ Listen · SoundCloud, Spotify, YT,   │
│   │   │   │              │   YT Music                          │
│   │   │   │ mastering    │ Portfolio · SoundCloud, YouTube     │
│   │   │   │ designer     │ Portfolio · (Discogs, Wikipedia)    │
│   │   │   └──────────────┴─────────────────────────────────────┘
│   │   │
│   │   └── CTA GROUP 2 — also conditional:
│   │       musician/dj  → Connect (Facebook, Instagram, Discogs, Wikipedia)
│   │       mastering    → Contact (Discogs, Facebook, Instagram, Wikipedia)
│   │       designer     → Contact (Instagram, Facebook)
│   │
│   └── RIGHT (max-w-[540px] mx-auto)
│       <Tabs>  ← becomes <MediaPlayers/> per refactor backlog #4
│       YouTube playlist / SoundCloud track — lazy-mount only the active tab
│       Hide entire Tabs block when neither youtube_playlist_id nor
│       soundcloud_track_id exist (mastering/designer commonly lack both)
│
├── DISCOGRAPHY  (NEW, dark surface, between hero and .Content)
│   ┌─────────────────────────────────────────────────┐
│   │ Discography  ·  12 releases                    │  ← h2
│   │ <Item category="release"> × N                  │
│   │ flex flex-wrap justify-center                  │
│   └─────────────────────────────────────────────────┘
│   - Hidden when artist has 0 releases on label
│   - Sort by release date desc
│   - Same Item component as /releases page — visual consistency
│
└── .Content SLAB  (light surface, bio only)
    ├── Bio (item.information, v-html — Firebase content trusted)
    └── (the current "Releases with X" list block is REMOVED from here —
         moved up to the Discography section above on dark surface)
```

## Tokens (overrides + additions)

All from MASTER + Light Surfaces. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Breadcrumb | `text-xs text-white/50 hover:text-white mt-2` | top of page |
| Category badge | `font-mono text-xs uppercase tracking-widest text-white/60 bg-white/5 px-2 py-0.5 rounded-sm` | above h1 |
| Subtitle row | `text-[11px] md:text-[13px] text-white/50` | under h1 |
| Subtitle row separator | ` · ` (literal text, not markup) | between fields |
| Action row | `flex justify-center gap-2 mb-4 flex-wrap` | like + share + follow |
| Like / Share buttons | reuse `pages/release-detail.md` action-button token | actions |
| Follow CTA | reuse `<BtnPrimary>` (same height as Like/Share via shared token) | hero action |
| Cover (hero) | `size-[140px] sm:size-[280px] md:size-[320px]` | photo |
| Meta `<dl>` | `grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm` | replaces float `<p>` |
| Meta `<dt>` | `text-white/50` | label column |
| CTA group heading | `text-xs uppercase tracking-widest text-white/50 mt-6 mb-2` | Listen/Connect/Portfolio/Contact labels |
| CTA group container | `flex flex-wrap gap-2` | replaces vertical cluster |
| Discography section | `container max-w-7xl mt-12` | between hero and .Content |
| Discography heading | `text-2xl my-6` (Montserrat) + count `text-white/40 ml-2 tabular-nums` | h2 |
| Discography grid | `flex flex-wrap justify-center w-full` | reuse releases-page grid pattern |

## Components

**Reuse:**
- `<OpenImage>` (enlarge, fix `aria-hidden` per backlog #19)
- `<BtnPrimary>` for all CTAs including Follow
- `<Tabs>` / `<Tab>` until extracted (backlog #4)
- `<Item category="release">` for discography grid
- `<SvgTriangle>`, `<Icon>` Heroicons

**To extract (refactor backlog — same as release-detail):**
- `<MediaPlayers :links?>` (#4) — for artist this consumes a smaller links shape: `{ youtube_playlist_id?, soundcloud_track_id? }`
- `<EntityLinks :links group="...">` (#5) — works for artists too; group keys: `listen | portfolio | connect | contact` resolved per category
- `<MediaComingSoon>` (#10) — same as release page
- `<PageTitle>` (#13)

**To introduce on this page (new):**
- **Category badge** — small enough to inline; same shape as release cat# badge
- **Conditional CTA group label** — pure computed, no component
- **Discography section** — uses existing `<Item>`; the section itself is page-local layout

## Data

**API change required (`/api/artist/[slug]` payload extension):**

```ts
// server/api/artist/[id].get.ts — extend response shape
type ArtistDetailResponse = Artist & {
  releases_full: Array<Pick<Release, 'slug'|'title'|'cover_th'|'date'|'cat_no'|'coming_soon'|'new'>>
  // sorted by date desc, only releases that include this artist's slug
}
```

This eliminates the current pattern of fetching the entire `useReleases()` collection on every artist detail page (refactor backlog #3 — same fix as release-detail).

**Composable:** existing `useArtist(id)` extends to return `releases_full` in one payload. Drop the `useReleases()` import in `pages/artist/[id].vue`.

**Computed for category-conditional UI:**

```ts
const followPlatform = computed(() => {
  if (item.value?.bandcamp_url)   return { url: item.value.bandcamp_url, label: 'Follow on Bandcamp', icon: 'cib:bandcamp' }
  if (item.value?.category === 'dj' && item.value?.soundcloud_url)
    return { url: item.value.soundcloud_url, label: 'Follow on SoundCloud', icon: 'fa-brands:soundcloud' }
  return null  // no follow CTA for mastering/designer
})

const ctaGroups = computed(() => {
  const cat = item.value?.category
  if (cat === 'musician' || cat === 'dj') {
    return {
      primary: { label: 'Listen', platforms: [/* listen platforms with v-if guards */] },
      secondary: { label: 'Connect', platforms: [/* social platforms */] },
    }
  }
  if (cat === 'mastering') {
    return {
      primary: { label: 'Portfolio', platforms: ['soundcloud_url', 'youtube_url'] },
      secondary: { label: 'Contact', platforms: ['discogs', 'facebook', 'instagram', 'wikipedia_url'] },
    }
  }
  if (cat === 'designer') {
    return {
      primary: { label: 'Portfolio', platforms: ['discogs', 'wikipedia_url'] },
      secondary: { label: 'Contact', platforms: ['instagram', 'facebook'] },
    }
  }
  return { primary: null, secondary: null }
})
```

## Interactions specific to this page

### Title block

- **Category badge:** non-interactive. Selectable text (visitors copy "MUSICIAN" / "DJ" for context).
- **Subtitle row:** plain text. Drop missing fields gracefully — never render orphan separators (`· · Tel Aviv`).

### Action row

- **Like:** identical to release-detail — tooltip "Sign in to like" for unauthenticated, hidden on touch.
- **Share:** same Web Share API → clipboard → fallback chain as release-detail. Toast "Link copied" on clipboard success.
- **Follow CTA:** `<BtnPrimary>` to bandcamp_url (musician) / soundcloud_url (dj) / hidden (mastering/designer). Opens external in new tab (existing BtnPrimary behaviour).

### Hero block

- **Photo:** unchanged behaviour — OpenImage lightbox + Esc close. Fix emoji aria-hidden (#19).
- **CTA groups:** conditional labels per category (computed from `item.category`). Empty groups (e.g. designer with no platforms) hide entirely.
- **Tabs player:** lazy-mount per backlog #4. Hidden when neither `youtube_playlist_id` nor `soundcloud_track_id` exist.

### Discography section

- **Item cards:** unchanged behaviour from `/releases` listing. Click → `/release/[slug]`.
- **Heading count:** `Discography · 12 releases` — `releases` always plural in copy (English convention; if i18n lands later, branch on count).
- **Sort:** date desc, fixed (no toggle on this page — discography is chronological by nature).

### `.Content` slab

- **Bio only.** The current "Releases with X" list is REMOVED from here and replaced by the Discography section above. This avoids the awkward visual switch from light slab into a list of release-line entries.
- **Section labels** (if bio sub-sections appear) as `<h2>` per backlog #17.

### Keyboard

- All actions reachable via Tab. `:focus-visible` ring on every button and link (backlog #14, #15).
- Esc closes OpenImage lightbox.
- **Do NOT add page-level arrow shortcuts** — same rule as release-detail and track-detail (audio iframe conflicts).

## Accessibility specific to this page

- Heading hierarchy: `<h1>Artist Name</h1>` → `<h2>Discography</h2>` → `<h3>Listen / Connect / Portfolio / Contact</h3>` (CTA group labels). Linear, no skips.
- Category badge: `<span>`, NOT a heading.
- Subtitle row: `<p>` with separators in text (read as one line — acceptable).
- `<dl>` semantic for metadata.
- Like, Share, Follow: each with `aria-label` (`"Like Artist Name"`, `"Share artist profile"`, `"Follow Artist Name on Bandcamp"`).
- Tooltip on guest like: `role="tooltip"` linked via `aria-describedby` when shown.
- Discography grid: each `<Item>` already accessible; no additional wrapping needed.
- Iframe in Tabs: explicit `title` (already done).
- Breadcrumb: `<nav aria-label="Breadcrumb"><ol><li>← Artists</li></ol></nav>`.
- Empty/conditional content (no Tabs, no Discography for new artists): nothing rendered, not a hidden empty container.

## Anti-patterns specific to this page

- ❌ **Do not show "Listen" CTA group for mastering/designer.** Semantically wrong — they don't release music. Use category-conditional labels.
- ❌ **Do not keep float-based meta layout.** Same `clear-left` hack issue as release-detail; switch to `<dl>` + flex.
- ❌ **Do not render "Follow on Bandcamp" inline inside the Links cluster.** It's the primary CTA — promote to action row.
- ❌ **Do not render the discography as a flat `<RelativeItem>` list.** Use the same `<Item>` grid as `/releases` for visual consistency.
- ❌ **Do not show JSON-LD `MusicGroup` schema for mastering/designer.** Use `Person` (with `jobTitle: 'Mastering Engineer' | 'Visual Designer'`) instead, OR omit the schema for these categories.
- ❌ **Do not preload all iframe tabs.** Lazy-mount only active.
- ❌ **Do not collapse category badge into the subtitle row.** It's identity, not metadata — different visual weight.
- ❌ **Do not allow Spotlight curatorial copy to outshine the bio.** Spotlight (on `/artists`) is a teaser; the full bio lives only here in the `.Content` slab.

## Pre-delivery checklist (page-specific, in addition to MASTER)

### Structure & semantics

- [ ] Breadcrumb `← Artists` above title block, focusable
- [ ] Category badge above h1, font-mono uppercase, non-interactive
- [ ] Subtitle row drops missing fields without orphan separators
- [ ] Action row: Like + Share + (conditional) Follow at same visual height
- [ ] Photo sized `size-[140px] sm:size-[280px] md:size-[320px]`
- [ ] Meta uses `<dl>` with semantic `<dt>` / `<dd>`
- [ ] CTA groups use conditional labels by category (Listen/Portfolio + Connect/Contact)
- [ ] CTA group labels are real `<h3>` (or h2 — match release-detail decision)
- [ ] Discography is a separate dark-surface section between Hero and .Content
- [ ] Discography heading shows count
- [ ] `.Content` slab contains ONLY bio (no embedded discography list)
- [ ] No `float-left` / `clear-left` survivors

### Behaviour

- [ ] Follow CTA appears for musician (bandcamp) AND dj (soundcloud), absent for mastering/designer
- [ ] Tabs hidden entirely when no media IDs exist
- [ ] Empty CTA groups hide their `<h3>` along with the buttons
- [ ] Discography hidden when 0 releases
- [ ] Share uses navigator.share → clipboard fallback (same as release-detail)
- [ ] Like tooltip "Sign in to like" only when unauthenticated AND not on touch
- [ ] OpenImage `⛄` placeholder wrapped in `aria-hidden` (#19)
- [ ] Only active Tabs iframe is mounted (lazy)
- [ ] All `:focus-visible` rings present (#14, #15)

### Data

- [ ] `releases_full` resolved server-side in `/api/artist/[slug]` (#3)
- [ ] `useArtist()` is `useAsyncData` with explicit key (already correct)
- [ ] No `useReleases()` import on artist detail page (full-collection fetch removed)
- [ ] 404-throw moved above any `onMounted` references (#9)

### JSON-LD (out of design-system scope, recommended)

- [ ] `MusicGroup` schema for `category === 'musician' | 'dj'`
- [ ] `Person` schema (with `jobTitle`) for `category === 'mastering' | 'designer'`
- [ ] `sameAs` includes Bandcamp, Spotify, Discogs, Wikipedia URLs (filter null)

### Visual

- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Photo scales smoothly across breakpoints
- [ ] CTA groups wrap cleanly per category
- [ ] All `v-wave` on interactive elements
- [ ] Light Surfaces contract respected for `.Content` slab

## SEO upgrade (out of design-system scope, recommended)

```ts
// for musician / dj
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'MusicGroup',
      name: item.value.title,
      genre: item.value.style,
      url: absoluteUrl.value,
      image: item.value.photo_xl,
      sameAs: [
        item.value.bandcamp_url,
        item.value.spotify,
        item.value.soundcloud_url,
        item.value.discogs,
        item.value.wikipedia_url,
      ].filter(Boolean),
      album: releasesFull.value.map(r => ({
        '@type': 'MusicAlbum',
        name: r.title,
        url: `https://sentimony.com/release/${r.slug}`,
      })),
    }),
  }],
})

// for mastering / designer — use Person schema with jobTitle
```

## Out of scope (deferred / open questions)

- **Tracks featuring this artist** (separate from albums) — requires `/api/artist/[slug]` to also return `tracks_appearing_on`. Defer until track-relations data is consolidated server-side.
- **Plays / followers external counts** (Spotify, Bandcamp APIs). Out of scope; brittle rate-limited integrations.
- **Sticky play-bar** while scrolling — same out-of-scope as release-detail.md and track-detail.md. Defer until pattern is agreed in MASTER.
- **Featured field admin UI** — required for the Spotlight on `/artists` to work, but is admin tooling, not page design.
- **Artist photo as ambient blur background** — same anti-pattern flag as release-detail.md (conflicts with global photo bg). Permanent unless §2 fixed-bg rule is revisited.

## Cross-references

- Refactor backlog #3: server-resolved `releases_full`. Required.
- Refactor backlog #4: `<MediaPlayers>` extraction. Required.
- Refactor backlog #5: `<EntityLinks>` extraction. Required, with category-aware group keys.
- Refactor backlog #7: `useFetch` → `useAsyncData` (already mostly correct here; verify).
- Refactor backlog #9: 404-throw ordering. Required.
- Refactor backlog #10: `<MediaComingSoon>` extraction.
- Refactor backlog #13: `<PageTitle>`. Use here once shipped.
- Refactor backlog #14, #15: `:focus-visible` parity. Required.
- Refactor backlog #16: breadcrumb. Implemented as section above.
- Refactor backlog #17: section labels semantic upgrade. Required.
- Refactor backlog #18: lazy iframe + reduced-motion.
- Refactor backlog #19: emoji aria-hidden in OpenImage.
- `pages/artists.md`: Spotlight needs `featured: boolean` schema field — same field used on this detail page (no UI consequence here, just schema co-dependency).
- `pages/release-detail.md`: shares Breadcrumb, action row, `<dl>` meta, lazy iframe, share button, tooltip-on-guest-like, no-arrow-shortcuts patterns. Implementation should reuse the same components/utilities.
- `pages/track-detail.md`: same out-of-scope policy for sticky play-bar.
- MASTER §Light Surfaces: `.Content` slab now contains ONLY bio, not the discography list — clearer separation of light/dark surface intent.
