# Catalog Features — Design Spec
**Date:** 2026-07-02  
**Branch:** hot-fix (target: new feature branch)

## Overview

Five independent UI/data features that enrich the artist and release catalog pages:

1. Designer portfolio gallery on artist detail pages
2. Organized Events on artist detail pages (+ DB `organizer` field)
3. `/artists/all` — full text list with country flags
4. Artist Swiper category dividers
5. Genre filter pages `/releases/psytrance` and `/releases/psychill`

---

## 1. Designer Portfolio Gallery

### Goal
When viewing an artist detail page for a `category === 'designer'` artist, show a "Portfolio" section listing the release covers they designed.

### Data
Every designer is already credited in `releases[].artists` (string or string[]). All 15 designers have at least one release. `matik` has 35+, `juju` 8, `artrama` 6.

### Implementation
- `artist/[id].vue` already fetches `useReleases()`.
- Add `computed` `portfolioReleases`: filter `releases` where `r.artists` includes the current artist's slug.
- Render below the existing bio/links block, only when `item.category === 'designer' && portfolioReleases.length > 0`.
- Layout: `grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2`, each cell a `<NuxtLink :to="'/release/' + r.slug">` wrapping `<NuxtImg :src="r.cover_xl" ...>`.
- Section heading: "Portfolio".

### Notes
- No new API calls; reuses `releasesAsync` already present.
- Artists without a `cover_xl` on some releases: use `r.cover_xl || r.cover_og` as fallback; skip items with no cover.

---

## 2. Organized Events (Hagen / Organizer field)

### Goal
Allow marking which artist(s) organized a given event, and surface "Organized Events" on the artist detail page.

### DB Change
Add optional `organizer?: string[]` field to event records in `server/data/server/sentimony-db-export.json`. This is an array of artist slugs (e.g. `["hagen"]`). Populated editorially by the user via the JSON file before running `sync:firebase` / `sync:supabase`.

### Type Change
In `app/types/index.ts`, extend `Event`:
```ts
export interface Event extends BaseEntity {
  // ...existing fields...
  organizer?: string[]
}
```

### Implementation
- On `artist/[id].vue`: also fetch `useEvents()`.
- Add `computed` `organizedEvents`: filter events where `e.organizer?.includes(slug)`.
- Render new section "Organized Events" with `<Item>` cards (`category="event"`) only when `organizedEvents.length > 0`.
- Section appears between the bio block and the existing releases section.

### Notes
- No Supabase migration needed yet; if Supabase becomes the event source it will need a column.
- Firebase path: `events/{slug}/organizer` array node — handled by existing `sync:firebase` script.

---

## 3. `/artists/all` — Text List with Country Flags

### Goal
A lightweight, SEO-friendly page listing every visible artist — no photos, but with country flag indicators — grouped by category.

### Route
`app/pages/artists/all.vue` → `/artists/all`

Nuxt 4 supports `artists.vue` (→ `/artists`) and `artists/all.vue` (→ `/artists/all`) simultaneously.

### Flag Library
**`flag-icons`** (npm, MIT, ~300 KB, `fi fi-{iso2}` CSS classes). Framework-agnostic — works in Nuxt via a CSS import. No Vue wrapper needed.

Import in the component:
```ts
import 'flag-icons/css/flag-icons.min.css'
```

### Country Extraction
`location` is free text. Extraction logic in `app/utils/countryFlag.ts`:

```ts
// Returns ISO 3166-1 alpha-2 lowercase or null
export function locationToIso2(location: string): string | null
```

Algorithm:
1. Take last segment after `->` (handles "Kyiv, Ukraine -> Warsaw, Poland" → "Warsaw, Poland").
2. Take last comma-separated part and trim.
3. Look up in a static map of ~30 countries present in the DB.

Static map covers: Ukraine, Russian Federation, USA, United States, Germany, Italy, France, Denmark, Sweden, Netherlands, Greece, Malta, South Africa, Australia, Brazil, Mexico, Romania, United Kingdom, India, North Macedonia, Guatemala, Chile, Austria, Poland, Belgium.

### Layout
- Page title: "All Artists"
- Four sections: Producers & Musicians / DJs / Sound Engineers & Mastering / Visual Artists & Designers
- Each row: `<NuxtLink>` → `[flag-span] Artist Title — location text`
- Flag span: `<span class="fi fi-{code} mr-2 rounded-sm" />` (inline, 1em height)
- If no parseable country: no flag, just name.
- On `/artists` page: add a small "View all (text)" link pointing to `/artists/all`.

### SEO
Indexed (useful for search). `useSeoMeta` with title "All Artists — Sentimony Records" and appropriate description.

---

## 4. Artist Swiper Category Dividers

### Goal
Visual separators between musician / DJ / mastering / designer groups inside the horizontal artist Swiper in `default.vue`.

### Swiper.vue API Change
Add optional prop:
```ts
sections?: Array<{ label: string; list: ItemEntity[] }>
```

When `sections` is provided (instead of `list`), render groups of `SwiperSlide`s separated by a non-interactive divider slide.

Divider slide: full-height, narrow (~2px line + rotated category label), `pointer-events-none`, visually distinct (semi-transparent border + label text).

`slideToActiveSlug()` updated to search across all sections when `sections` is used.

Backward compatibility: `list` prop still works unchanged.

### `default.vue` Change
Instead of passing `artistsSortedByCategoryId` as `list`, compute `artistSections`:
```ts
const artistSections = computed(() => [
  { label: 'Producers', list: filterByCategory('musician') },
  { label: 'DJs',       list: filterByCategory('dj') },
  { label: 'Mastering', list: filterByCategory('mastering') },
  { label: 'Designers', list: filterByCategory('designer') },
].filter(s => s.list.length > 0))
```

Pass as `:sections="artistSections"`.

---

## 5. Genre Filter Pages — Psytrance & Psychill

### Goal
Dedicated browsable pages for the two main release genres.

### Routes
- `app/pages/releases/psytrance.vue` → `/releases/psytrance`
- `app/pages/releases/psychill.vue` → `/releases/psychill`

Coexists with `releases.vue` (→ `/releases`) in Nuxt 4.

### Filtering
`release.style` is a comma-separated free-text string. Filter is case-insensitive substring match:
- Psytrance: `style.toLowerCase().includes('psytrance')`
- Psychill: `style.toLowerCase().includes('psychill')`

Current counts: Psytrance ~40 releases, Psychill ~30 releases. Overlap is possible (a release can appear on both pages).

### Shared Component
`app/components/ReleasesFiltered.vue` accepts `{ keyword: string, title: string, description: string }` props. Contains the `useReleases()` fetch, filter computed, and the item grid. Both genre pages instantiate this component.

### Navigation
On `/releases`, add two filter links at the top: "Psytrance" and "Psychill" (styled as pills/tabs). Active state when on the matching sub-route.

### SEO
Each page has its own `useSeoMeta()` + `useCanonical()`. Canonical points to the genre page URL. `routeRules` already applies public CDN cache headers to `/api/releases` so no extra cache config needed.

---

## File Map

| Action | Files |
|--------|-------|
| Create | `app/pages/artists/all.vue` |
| Create | `app/utils/countryFlag.ts` |
| Create | `app/components/ReleasesFiltered.vue` |
| Create | `app/pages/releases/psytrance.vue` |
| Create | `app/pages/releases/psychill.vue` |
| Modify | `app/pages/artist/[id].vue` — gallery + organized events |
| Modify | `app/components/Swiper.vue` — sections prop + divider slides |
| Modify | `app/layouts/default.vue` — pass sections to Swiper |
| Modify | `app/pages/artists.vue` — add link to /artists/all |
| Modify | `app/pages/releases.vue` — add genre filter tabs |
| Modify | `app/types/index.ts` — Event.organizer field |
| Modify | `server/data/server/sentimony-db-export.json` — add organizer to events |

## Out of Scope
- Supabase migration for `organizer` column (deferred until Supabase becomes the events source)
- More than two genre pages (psytrance / psychill cover the two main directions; others deferred)
- Artist search/filter on `/artists/all`
