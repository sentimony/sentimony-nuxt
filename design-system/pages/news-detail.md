# Page Override: News Detail (`/news/[slug]`)

> Inherits from `../MASTER.md`. Documents the **future** detail page for a single News entity.
>
> **Status: planned, not yet implemented.** Depends on the `News` entity schema introduced in `pages/news.md` (Tier 1). This override is the design contract that should be in place before code lands.

## Pattern

- **Page role:** Editorial article page — the place where the actual news content (an announcement, interview, press release, label update, recap) is read.
- **Composition:** `Breadcrumb` → `Title block (category badge + title + author/date/reading-time + actions)` → `Hero block (cover, full-bleed)` → `Body (`.Content` slab)` → `Related content (release / artist / event / track / video, when wired)` → `More from News (timeline of recent News entries)`.
- **Why this composition:** an article wants prose-first reading flow. The `.Content` slab handles legibility; everything else (cover, related, more-from-news) frames the reading experience without competing.

## Layout (top → bottom)

```
border-t border-white/30                           (existing seam, keep)
│
├── BREADCRUMB                                     (#16)
│   ← News
│
├── TITLE BLOCK  (centered, container max-w-3xl — narrower than other detail pages
│                  because this is article-shaped content, not gallery-shaped)
│   ┌────────────────────────────────────────────────┐
│   │       INTERVIEW   ← category badge              │
│   │       (font-mono text-xs uppercase             │
│   │        tracking-widest text-white/60           │
│   │        bg-white/5 px-2 py-0.5 rounded-sm)      │
│   │                                                │
│   │   Article Title                                │
│   │   (h1: text-2xl md:text-4xl my-2 md:my-4,      │
│   │    LEFT-ALIGNED on this page — articles read   │
│   │    left-to-right, not centered titles)         │
│   │                                                │
│   │   By Curator Name · Apr 28, 2026 · 6 min read  │
│   │   (subtitle row: text-[12px] md:text-sm        │
│   │    text-white/60, ' · ' separator,             │
│   │    drops missing fields)                       │
│   │                                                │
│   │   [♥ Like 12]  [↗ Share]                       │
│   └────────────────────────────────────────────────┘
│
├── HERO COVER  (container max-w-3xl)
│   ┌──────────────────────────────────────────────────────┐
│   │                                                      │
│   │   <OpenImage> hero cover                             │
│   │   aspect ratio: respects intrinsic image dimensions  │
│   │   (no forced 16:9 — articles use varied imagery)     │
│   │   max-w-full rounded-sm shadow-[brand]               │
│   │                                                      │
│   │   Optional caption below: text-xs text-white/50      │
│   │   italic mt-2 (when News.cover_caption field exists; │
│   │   v1: omit caption field, add later)                 │
│   └──────────────────────────────────────────────────────┘
│
├── BODY  (`.Content` slab, light surface)
│   ┌──────────────────────────────────────────────────────┐
│   │ <article class="max-w-prose mx-auto px-2">           │
│   │   <div v-html="item.body" class="prose-like">        │
│   │   <!-- Body uses standard HTML elements:             │
│   │        <p>, <h2>, <h3>, <a>, <em>, <strong>,         │
│   │        <ul>/<ol>, <blockquote>, <img>, <hr>          │
│   │        styled by .Content rules + a "prose-like"     │
│   │        rules block (added to tailwind.css) -->       │
│   │ </article>                                           │
│   └──────────────────────────────────────────────────────┘
│
├── RELATED CONTENT  (dark, only when ≥1 related_* field resolves)
│   ┌──────────────────────────────────────────────────────┐
│   │ Related                                  [h2]        │
│   │                                                      │
│   │ When item.related_release_slug:                      │
│   │   "Release"                                          │
│   │   <Item category="release" :i="release" />           │
│   │                                                      │
│   │ When item.related_artist_slugs.length:               │
│   │   "Artists"                                          │
│   │   <Item category="artist" :i="a" /> × N              │
│   │                                                      │
│   │ When item.related_event_slug:                        │
│   │   "Event"                                            │
│   │   <Item category="event" :i="event" />               │
│   │                                                      │
│   │ When item.related_track_slug:                        │
│   │   "Track"                                            │
│   │   <RelativeItem category="track" :i="track" />       │
│   │                                                      │
│   │ When item.related_video_slug:                        │
│   │   "Video"                                            │
│   │   <Item category="video" :i="video" />               │
│   │                                                      │
│   │ - sub-headings as <h3 class="text-xs uppercase       │
│   │   tracking-widest text-white/50 mt-4 mb-2">          │
│   └──────────────────────────────────────────────────────┘
│
└── MORE FROM NEWS  (dark, optional, only when there are other News entries)
    ┌──────────────────────────────────────────────────────┐
    │ More from News                            [h2]       │
    │                                                      │
    │ <ol> of recent News rows (≤6, excluding current)     │
    │ Same row design as the timeline on /news (cover +    │
    │ date · category · title + excerpt one-liner)         │
    │                                                      │
    │ <NuxtLink to="/news"> See all news →                 │
    └──────────────────────────────────────────────────────┘
```

## Tokens (overrides + additions)

All from MASTER + Light Surfaces. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Container (page) | `container max-w-3xl` (narrower — article-shape, not gallery) | page wrapper |
| Title alignment | `text-left` (NOT centered like release/artist/event) | h1 + meta block |
| Breadcrumb | `text-xs text-white/50 hover:text-white mt-2` | top |
| Category badge | `font-mono text-xs uppercase tracking-widest text-white/60 bg-white/5 px-2 py-0.5 rounded-sm` | above h1 |
| Subtitle row | `text-[12px] md:text-sm text-white/60` | byline (author · date · reading time) |
| Action row | `flex gap-2 mb-6 flex-wrap` (LEFT-aligned, not centered) | like + share |
| Hero cover wrapper | `max-w-full rounded-sm shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] mb-8` | cover |
| Hero cover image | `w-full h-auto` (intrinsic ratio) | cover img |
| Cover caption | `text-xs text-white/50 italic mt-2` | optional |
| Body article wrapper | `max-w-prose mx-auto px-2` | body container |
| Body prose styling | new `.prose-like` rules in tailwind.css (see Tailwind addition below) | inside `v-html` |
| Related section | `container max-w-3xl mt-12` | between body and footer-like |
| Related h2 | `text-2xl my-6` Montserrat | section heading |
| Related sub-heading h3 | `text-xs uppercase tracking-widest text-white/50 mt-4 mb-2` | "Release" / "Artists" / etc |
| More-from-news section | `container max-w-3xl mt-12` | bottom |
| More-from-news row | reuse `pages/news.md` timeline row token | rows |
| "See all news" link | `text-sm text-white/60 hover:text-white mt-4` | bottom CTA |

### Tailwind addition (`app/assets/css/tailwind.css`) — new prose styling for `.Content` body

The `.Content` slab today only covers root rules. News body needs a richer prose contract because authors will write multi-heading, list-heavy articles. Add inside the existing `.Content` block:

```css
.Content { @apply text-black bg-[#b5ccb5] }
.Content a { @apply text-blue-700 }
.Content h2 { @apply text-xl font-bold mt-8 mb-3 }
.Content h3 { @apply text-base font-bold mt-6 mb-2 }
.Content p  { @apply mb-3 leading-relaxed }
.Content ul { @apply list-disc ps-6 mb-3 }
.Content ol { @apply list-decimal ps-6 mb-3 }
.Content li { @apply mb-1 }
.Content blockquote { @apply border-l-4 border-black/30 pl-4 italic text-black/80 my-4 }
.Content img { @apply rounded-sm my-4 max-w-full }
.Content hr { @apply border-black/20 my-6 }
.Content code { @apply font-mono text-sm bg-black/5 px-1 py-0.5 rounded-sm }
```

These rules are SAFE for existing `.Content` consumers (release/artist/event/playlist info blocks): they just become more legible. **Document this addition in `MASTER.md` §Light Surfaces** when implemented — it expands the contract.

## Components

**Reuse:**
- `<OpenImage>` for hero cover (or plain `<img>` if no lightbox needed for editorial covers)
- `<Item category="...">` for Related content cards
- `<RelativeItem category="track">` for related track row
- `<Icon>` Heroicons
- `<NuxtLink>` everywhere
- `<PageTitle>` once shipped (#13)

**To extract (refactor backlog):**
- `<EntityRelatedSection :related>` — could centralise the Related-content block; defer until release/artist/event detail pages start needing the same shape (today they each render related content differently).
- `<MediaComingSoon>` not relevant (no media player here).

**Do not introduce:**
- ❌ A WYSIWYG / Markdown renderer. HTML through `v-html` matches the project's trusted-content model.
- ❌ A comment system. Out of scope; introduces moderation surface.
- ❌ Tag chips at v1. Use `category` enum first.

## Data

**See `pages/news.md` for the `News` schema.** `/api/news/[slug]` should return the entity with all `related_*` slugs **fully resolved** server-side:

```ts
type NewsDetailResponse = News & {
  related_release?: Pick<Release, 'slug'|'title'|'cover_th'|'date'> | null
  related_artists?: Array<Pick<Artist, 'slug'|'title'|'photo_th'>> | null
  related_event?: Pick<Event, 'slug'|'title'|'flyer_a_xl'|'date'> | null
  related_track?: { slug: string; title: string; artist_name: string; cover_th?: string } | null
  related_video?: Pick<Video, 'slug'|'title'|'cover_th'> | null
}
```

This eliminates client-side cross-collection fetches (consistent with release/artist/event detail patterns).

**Composable:**

```ts
// app/composables/useNewsItem.ts
export const useNewsItem = (slug: string) =>
  useAsyncData<News>(`news:${slug}`, () => $fetch(`/api/news/${slug}`))
```

**Reading time:**

```ts
// server-side, computed at API layer
function computeReadingTimeMinutes(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').trim()
  const words = text.split(/\s+/).filter(Boolean).length
  const wpm = 220
  return Math.max(1, Math.round(words / wpm))
}
```

Stored as `News.reading_time_minutes`. If absent, `<reading-time>` part of subtitle row hides gracefully.

**More-from-news:**

```ts
// fetched separately from /api/news (already cached, low cost)
// excludes current slug, sorts by date desc, slices to 6
const moreNews = computed(() =>
  allNews.value.filter(n => n.slug !== item.value.slug).slice(0, 6)
)
```

## Interactions specific to this page

### Title block

- **Category badge:** non-interactive.
- **Subtitle row:** drops missing fields cleanly. `By {author}` only when author exists; `{N} min read` only when reading_time_minutes present.

### Action row

- **Like, Share:** identical to other detail pages (tooltip "Sign in to like" for unauthenticated; clipboard fallback on share).
- **No "Open external" / "Read on Bandcamp"-style CTA.** News entities live entirely on this page.

### Hero cover

- Click opens lightbox (via `<OpenImage>`) when `cover_xl` exists. For purely decorative editorial covers, use plain `<img>` to avoid the lightbox affordance.

### Body
- Trusted HTML rendering (Firebase/Supabase admin authored). Project's existing content trust model.
- Internal links inside body that match a `/release/[slug]` or `/artist/[slug]` pattern should still work via standard `<a href>` (Nuxt does not auto-upgrade these to `<NuxtLink>` from `v-html`; this is acceptable — full-page reload on internal nav from article body is rare and tolerable).

### Related content
- Each related item is a standard `<Item>` (or `<RelativeItem>` for tracks), navigates as on its native listing page.

### More from news
- Each row is a `<NuxtLink>` to another News entity.
- "See all news" returns to `/news`.

### Keyboard

- All actions tab-reachable. `:focus-visible` rings.
- No page-level shortcuts.

## Accessibility specific to this page

- Heading hierarchy: `<h1>` (article title) → `<h2>` for body sections (authored inside `body` HTML) → `<h2>` for Related → `<h3>` for related sub-types (Release / Artists / etc.) → `<h2>` for More from News.
- The body's internal `<h2>`/`<h3>` are author-controlled but should follow this scheme. Document this in admin tooling: "use h2 for top-level article sections; h3 for subsections".
- Category badge: `<span aria-label="Category: Interview">INTERVIEW</span>`.
- Subtitle row: `<p>` with text separators.
- Hero cover with caption: `<figure>` + `<figcaption>` semantic when caption present.
- Related items already accessible via existing components.
- More-from-news rows: each row a `<NuxtLink>` with `aria-label="{title}, posted {date}, {category}"` for screen readers.
- Breadcrumb: `<nav aria-label="Breadcrumb">`.

## Anti-patterns specific to this page

- ❌ **Do not center-align the title.** Articles read top-down left-to-right; center alignment hurts long titles and the byline that follows.
- ❌ **Do not use `max-w-7xl` for the page.** Article-shape narrows to `max-w-3xl` (~768px) — comfortable line length for reading. Related sections also stay at `max-w-3xl` for consistent rhythm.
- ❌ **Do not parse Markdown.** HTML body is the trusted content model.
- ❌ **Do not auto-link arbitrary words to entities.** Authors explicitly use `<a href>` in body when linking; auto-linking creates surprises and breaks editorial intent.
- ❌ **Do not autoplay any media in the article body.** Authors may embed YouTube via iframe; rely on the iframe's own autoplay-disabled defaults.
- ❌ **Do not introduce a "previous/next article" nav** at the bottom. The "More from news" block + breadcrumb provide enough wayfinding without committing to a strict article order.
- ❌ **Do not show "Related" when nothing resolves.** Section hides entirely.
- ❌ **Do not re-fetch the entire News collection** on detail page just to render More-from-news. Use the already-cached `useNews()` payload.

## Pre-delivery checklist (page-specific, in addition to MASTER)

### Structure & semantics

- [ ] Breadcrumb `← News` above title block
- [ ] Category badge above h1, font-mono uppercase
- [ ] Title left-aligned (NOT centered)
- [ ] Subtitle row: author · date · reading time, drops missing fields
- [ ] Action row left-aligned: Like + Share
- [ ] Hero cover renders intrinsic ratio (no forced 16:9 / square crop)
- [ ] Body rendered through `v-html` inside `.Content` slab
- [ ] `.Content` prose CSS rules added (h2/h3/p/ul/ol/li/blockquote/img/hr/code) and verified across legacy consumers (release/artist/event/playlist) without regressions
- [ ] Related section hidden when no related_* resolves
- [ ] More-from-news rendered from cached News collection (no extra fetch)
- [ ] Heading outline: h1 → h2 (body sections, author-authored) → h2 (Related) → h3 (related sub-types) → h2 (More from News)
- [ ] Page container `max-w-3xl` (narrower than other detail pages)

### Behaviour

- [ ] `useNewsItem(slug)` is `useAsyncData` with explicit key `news:{slug}`
- [ ] 404-throw above `onMounted` registration
- [ ] Reading time computed server-side, displayed when available
- [ ] Share uses navigator.share → clipboard fallback
- [ ] Like tooltip "Sign in to like" only when unauthenticated AND not on touch
- [ ] All `:focus-visible` rings present (#14, #15)
- [ ] All `v-wave` on interactive elements

### Data

- [ ] `News` schema lives in `app/types/index.ts`
- [ ] `/api/news/[slug]` returns entity with related_* fully resolved server-side
- [ ] No client-side full-collection fetches for related entities
- [ ] More-from-news uses the existing `useNews()` cache (no separate endpoint)

### JSON-LD (out of design-system scope, recommended)

```ts
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: item.value.title,
      datePublished: item.value.date,
      author: item.value.author ? { '@type': 'Person', name: item.value.author } : { '@type': 'Organization', name: 'Sentimony Records' },
      publisher: {
        '@type': 'Organization',
        name: 'Sentimony Records',
        logo: { '@type': 'ImageObject', url: 'https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.3.svg' },
      },
      image: item.value.cover_xl || item.value.cover_og,
      description: item.value.excerpt,
      url: absoluteUrl.value,
      articleSection: item.value.category,
    }),
  }],
})
```

### Visual

- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Body prose readable: line-height 1.6+, paragraph spacing comfortable
- [ ] Cover loads with explicit width/height or aspect-ratio (no CLS on hydration)
- [ ] Light Surfaces contract respected throughout the body slab
- [ ] All embedded `<a>` in body have `text-blue-700` per `.Content` rules

## Out of scope (deferred / open questions)

- **Comment / discussion system** — moderation surface, GDPR, scope creep.
- **Newsletter signup CTA** at article end — depends on email-marketing integration.
- **Author profile pages** (`/author/[slug]`) — only meaningful if the label has multiple regular contributors.
- **Tag/topic taxonomy** — start with `category` enum; tags are open-ended and harder to govern.
- **"Save for later" bookmarks** distinct from likes — likes already cover the bookmark intent.
- **Share-image generation** (custom OG images per article) — defer until brand needs it; default `cover_og` is sufficient.
- **Reading progress indicator** — adds layout/scroll work; not needed at typical article lengths.
- **Print stylesheet** — niche; defer unless requested.

## Cross-references

- `pages/news.md`: the listing this detail page belongs to. Schema and migration plan documented there.
- `pages/release-detail.md`, `pages/artist-detail.md`, `pages/event-detail.md`, `pages/track-detail.md`, `pages/video-detail.md`, `pages/playlist-detail.md`: each can be referenced via `News.related_*` fields and rendered as cards in the Related section.
- Refactor backlog #3-style: server-side resolution of `related_*` slugs.
- Refactor backlog #9: 404-throw ordering.
- Refactor backlog #13: `<PageTitle>`. Use here once shipped.
- Refactor backlog #14, #15: `:focus-visible` parity.
- Refactor backlog #16: breadcrumb. Implemented.
- Refactor backlog #17: section labels semantic upgrade. Article body internal h2/h3 follow this rule.
- MASTER §Light Surfaces: this page **extends** the `.Content` slab contract with prose-rich CSS rules (h2/h3/p/ul/ol/li/blockquote/img/hr/code). Update MASTER when these rules ship.
