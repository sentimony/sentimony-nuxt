# Page Override: Video Detail (`/video/[id]`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Video detail page.
> Source: derived from an audit of `app/pages/video/[id].vue` (138 lines today). Currently the **most stripped-down detail page** — only `formattedDate` in meta, single YouTube tab, no related artist/track/release links. The page is sized like an artist-detail (cover left + meta) but the *content* is the video itself, which deserves to be the hero.

## Pattern

- **Page role:** Single-video deep page. The video player IS the hero. Everything else (cover, metadata, links, related) is supporting context.
- **Composition:** `Breadcrumb` → `Title block (type badge + title + subtitle + actions)` → `Hero player (16:9 click-to-play, full container width)` → `Meta block (small thumbnail + structured fields + Open on YouTube)` → `Related content (track / artist / release when resolved)` → `.Content slab (info + credits)`.
- **Why invert the standard release/artist layout:** videos are *watched*, not *browsed*. The player needs to be the largest element on the page; the cover thumbnail is supporting at this stage (already shown on the listing). This is the only detail page where the embedded media takes priority over the static cover.

## Layout (top → bottom)

```
border-t border-white/30                           (existing seam, keep)
│
├── BREADCRUMB                                     ← NEW (#16)
│   ← Videos
│
├── TITLE BLOCK  (centered, container max-w-7xl)
│   ┌────────────────────────────────────────────────┐
│   │       MUSIC VIDEO   ← type badge (computed     │
│   │       (font-mono text-xs uppercase             │
│   │        tracking-widest text-white/60           │
│   │        bg-white/5 px-2 py-0.5 rounded-sm)      │
│   │                                                │
│   │     Video Title                                │
│   │     (h1: text-2xl md:text-4xl my-2 md:my-4)    │
│   │                                                │
│   │     Apr 28, 2026 · Artist Name                 │
│   │     (subtitle row: text-[11px] md:text-[13px]  │
│   │      text-white/50, ' · ' separator,           │
│   │      artist linked when resolved)              │
│   │                                                │
│   │     [♥ Like 12]  [↗ Share]  [↳ Open on YT]    │
│   └────────────────────────────────────────────────┘
│
├── HERO PLAYER  (full container width, max-w-4xl mx-auto)
│   ┌──────────────────────────────────────────────────────┐
│   │                                                      │
│   │   16:9 player area (aspect-video w-full)             │
│   │                                                      │
│   │   - DEFAULT (no click yet):                          │
│   │     Poster (cover_xl) + large play overlay           │
│   │     (same overlay style as /videos featured)         │
│   │                                                      │
│   │   - AFTER CLICK:                                     │
│   │     YouTube iframe is mounted with autoplay=1        │
│   │     (only after explicit user gesture, GDPR-safe)    │
│   │                                                      │
│   └──────────────────────────────────────────────────────┘
│   - rounded-md overflow-hidden bg-black/50
│   - shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]
│   - max-w-4xl (≈896px) — significantly larger than the
│     current 540px right-column player
│
├── META BLOCK  (compact row below player, container max-w-7xl)
│   ┌──────────────────────────────────────────────────────┐
│   │ ┌──────┐  Release Date · Apr 28, 2026                │
│   │ │ 80×  │  Type · Music Video                         │
│   │ │ 80   │  Duration · 4:32  (when YT API provides)    │
│   │ │cover │                                             │
│   │ └──────┘                                             │
│   │                                                      │
│   │ - small cover_th (80×80) on left for visual id       │
│   │ - <dl> on right replaces float-based <p>             │
│   └──────────────────────────────────────────────────────┘
│
├── RELATED CONTENT  (dark, between meta and .Content)
│   ┌──────────────────────────────────────────────────────┐
│   │ Related                                    [h2]      │
│   │                                                      │
│   │ When video.track_slug:                               │
│   │   "From the track"                                   │
│   │   <RelativeItem category="track" :i="track" />       │
│   │                                                      │
│   │ When video.release_slug:                             │
│   │   "From the release"                                 │
│   │   <Item category="release" :i="release" />           │
│   │                                                      │
│   │ When video.artist_slugs.length:                      │
│   │   "Artists"                                          │
│   │   <Item category="artist" :i="a" /> × N              │
│   │   flex flex-wrap                                     │
│   └──────────────────────────────────────────────────────┘
│   - section completely hidden when none of the relations exist
│   - sub-headings as <h3 class="text-xs uppercase tracking-widest
│     text-white/50 mt-4 mb-2">
│
└── .Content SLAB  (light surface)
    ├── <h2>Info</h2>
    ├── information HTML (v-html, trusted)
    ├── <h2>Credits</h2>
    └── credits HTML (v-html, trusted)
```

## Tokens (overrides + additions)

All from MASTER + Light Surfaces. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Breadcrumb | `text-xs text-white/50 hover:text-white mt-2` | top of page |
| Type badge | `font-mono text-xs uppercase tracking-widest text-white/60 bg-white/5 px-2 py-0.5 rounded-sm` | above h1 |
| Subtitle row | `text-[11px] md:text-[13px] text-white/50` | under h1 |
| Action row | `flex justify-center gap-2 mb-4 flex-wrap` | actions |
| Action button | reuse `pages/release-detail.md` action-button token | like/share |
| Open on YouTube | reuse `<BtnPrimary>` (visual continuity) | external CTA |
| Hero player wrapper | `max-w-4xl mx-auto aspect-video w-full rounded-md overflow-hidden bg-black/50 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]` | player container |
| Player poster | `w-full h-full object-cover` (img inside the wrapper) | poster image |
| Player play overlay | reuse `pages/videos.md` featured-overlay token | play button |
| Meta row container | `flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto mt-6` | meta below player |
| Meta cover (small) | `size-[80px] rounded-sm shrink-0 ring-1 ring-white/10` | identification cover |
| Meta `<dl>` | `grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm` | structured fields |
| Meta `<dt>` | `text-white/50` | label column |
| Related section | `container max-w-7xl mt-12` | between meta and .Content |
| Related h2 | `text-2xl my-6` Montserrat | section heading |
| Related sub-heading h3 | `text-xs uppercase tracking-widest text-white/50 mt-4 mb-2` | "From the track" etc |
| Section labels in `.Content` | `text-sm font-bold m-0` (as `<h2>`) | per #17 |

**Type badge label mapping** (computed from `video.category`):

| `category` | Badge text |
|------------|-----------|
| `music-video` | `MUSIC VIDEO` |
| `live` | `LIVE` |
| `visualizer` | `VISUALIZER` |
| `mix` | `DJ MIX` |
| `documentary` | `DOCUMENTARY` |
| `interview` | `INTERVIEW` |
| undefined | `VIDEO` (generic fallback) |

## Components

**Reuse:**
- `<BtnPrimary>` for "Open on YouTube" + share fallback
- `<Item category="release" / "artist">` for related content
- `<RelativeItem category="track">` for related track (no Item-track variant exists yet)
- `<Icon>` Heroicons
- `<SvgTriangle>`

**To extract (refactor backlog):**
- `<MediaPlayers :links>` (#4) covers this if extended to single-video mode. Realistically, video page just needs **one** lazy-mount iframe; the existing `<Tabs>` wrapper around a single tab is overkill. After extraction, video page should pass a simpler API: `<MediaPlayers :video-link="..." />` or use a new `<VideoPlayer/>` if the patterns fully diverge.
- `<EntityLinks group="video">` (#5) — currently only YouTube; trivial today, future-proof when Vimeo/SoundCloud/TikTok land
- `<PageTitle>` (#13)
- `<MediaComingSoon>` (#10) — for "Player coming soon" state

**To introduce on this page (new):**
- **Click-to-play poster pattern** — small inline component or template-only:
  ```ts
  const isPlaying = ref(false)
  // <img v-if="!isPlaying"> + <iframe v-else>
  ```
  Defer extraction to a `<YouTubeEmbed>` component once a second use case appears (e.g. release detail rendering individual track videos).

## Data

**Schema additions required:**

```ts
// app/types/index.ts — Video
export interface Video extends BaseEntity {
  // ... existing fields
  category?: 'music-video' | 'live' | 'visualizer' | 'mix' | 'documentary' | 'interview'
  duration?: string         // 'mm:ss', from YT API or manual entry
  artist_slugs?: string[]   // for related Artists section
  track_slug?: string       // when this video is a track's official MV
  release_slug?: string     // when this video belongs to a release
  like_count?: number
}
```

**API change required (`/api/video/[slug]` payload extension):**

```ts
type VideoDetailResponse = Video & {
  related_track?: Track | null
  related_release?: Pick<Release, 'slug'|'title'|'cover_th'|'date'> | null
  related_artists?: Array<Pick<Artist, 'slug'|'title'|'photo_th'>> | null
}
```

Server-side resolution (parallel pattern with release/artist/event-detail).

**Composable:** existing `useVideo(id)` extends to return relations in one payload.

## Interactions specific to this page

### Title block

- **Type badge:** non-interactive, computed.
- **Subtitle row:** drops missing fields cleanly.

### Action row

- **Like, Share:** identical to release/artist/event-detail patterns (tooltip "Sign in to like" for unauthenticated; clipboard fallback on share).
- **Open on YouTube:** `<BtnPrimary>` linking to `item.links.youtube`. Always shown when YT link exists.

### Hero player

- **Default state:** poster image (`cover_xl` or YT auto-thumbnail) + brand-neutral play overlay (same as `/videos` featured).
- **On click:** mount the YouTube iframe with `autoplay=1` (allowed under explicit user gesture). The poster is replaced; iframe stays mounted for the rest of the page session.
- **Performance:** this saves ~600KB initial JS + tracking on every page load. Critical for SSR/ISR pages where most visitors won't actually play.
- **Loading:** consider a transient skeleton during iframe load (≤300ms typical), but iframe itself shows a YT spinner — generally not needed.
- **Privacy:** uses `youtube-nocookie.com` (existing pattern in release/track/artist pages) for GDPR-friendliness.

### Meta block

- **Small cover thumbnail:** non-interactive (the player is the watch surface). Used purely as visual ID when scrolling past the played-out video.
- **Duration:** ideally fetched server-side from YouTube API at build/cache time and stored as `duration` field. Client-side fetch on every detail load is a poor pattern.

### Related content

- **Track relation:** if `track_slug` resolves, link to `/track/[slug]`. Strongest relation: video IS for that track.
- **Release relation:** if `release_slug` resolves, link to `/release/[slug]`. Weaker than track.
- **Artist relation:** array of artists; each as a square `<Item category="artist">` card. Visual consistency with other detail pages.
- **Section hidden** entirely when no relations exist.

### `.Content` slab

- **Info + credits** as separate `<h2>`-led sections. Currently info is unlabelled and credits is `<small><b>` — both should become real headings.

### Keyboard

- All actions tab-reachable. `:focus-visible` rings.
- Esc on poster doesn't do anything (poster isn't a dialog); Esc inside iframe is owned by YouTube player.
- No page-level shortcuts (consistent with all detail pages).

## Accessibility specific to this page

- Heading hierarchy: `<h1>Title</h1>` → `<h2>Related</h2>` → `<h3>From the track / From the release / Artists</h3>` → `<h2>Info</h2>` → `<h2>Credits</h2>`. Linear; the h3 inside Related is sub-section detail.
- Type badge: `<span aria-label="Type: Music Video">VIDEO</span>` — uppercase styling alone may be ambiguous to screen readers.
- Subtitle row: `<p>` with separators in text.
- Poster: `<button aria-label="Play {video title}">` wrapping the img + overlay. After click, focus moves into the iframe (YT handles internal focus).
- Iframe: explicit `title="{video title} YouTube player"` (existing).
- Action row: each action with explicit `aria-label`.
- Related items already accessible via existing components.
- Breadcrumb: `<nav aria-label="Breadcrumb">`.

## Anti-patterns specific to this page

- ❌ **Do not autoload the YouTube iframe on page mount.** Click-to-play pattern is mandatory; ~600KB savings per page view.
- ❌ **Do not autoplay on initial render.** Autoplay only triggers after explicit user click on the poster.
- ❌ **Do not use platform red colour for the play overlay.** Brand-neutral translucent white only.
- ❌ **Do not keep the cover-left / player-right layout.** The video IS the hero; relegating it to a 540px right column was a mis-application of the release-page template.
- ❌ **Do not show "Player coming soon" without context.** If no YouTube link exists, hide the player entirely and surface a clear empty state, not a placeholder iframe.
- ❌ **Do not float-left the cover.** Same `clear-left` hack as other detail pages — replaced by flex meta-row.
- ❌ **Do not link the small meta-row cover to the lightbox.** Lightbox is for static images (release covers, artist photos, event flyers). Video posters are watched, not previewed.
- ❌ **Do not preload YouTube `videoseries` or related-videos in the iframe.** Use a clean single-video embed: `https://www.youtube-nocookie.com/embed/{id}?autoplay=1&rel=0`.

## Pre-delivery checklist (page-specific, in addition to MASTER)

### Structure & semantics

- [ ] Breadcrumb `← Videos` above title block
- [ ] Type badge above h1, computed from `video.category` with fallback `VIDEO`
- [ ] Subtitle row drops missing fields cleanly
- [ ] Action row: Like + Share + Open on YouTube
- [ ] Hero player full container width up to `max-w-4xl`, 16:9 aspect
- [ ] Click-to-play poster: iframe mounted only after user click
- [ ] Brand-neutral play overlay (no platform red)
- [ ] Meta block uses `<dl>` with `<dt>` / `<dd>`; cover-left layout removed
- [ ] Related section shown only when ≥1 relation resolves
- [ ] Related sub-headings as `<h3>`; main as `<h2>`
- [ ] `.Content` slab: Info + Credits as separate `<h2>` blocks (not `<small><b>`)
- [ ] No `float-left` / `clear-left` survivors

### Behaviour

- [ ] Iframe uses `youtube-nocookie.com`
- [ ] After click, iframe receives `?autoplay=1&rel=0`
- [ ] Share uses navigator.share → clipboard fallback
- [ ] Like tooltip "Sign in to like" only when unauthenticated AND not on touch
- [ ] OpenImage `⛄` placeholder wrapped in `aria-hidden` (#19) — applies to the meta-row small cover thumbnail (no lightbox needed; consider using a plain `<img>` instead of `<OpenImage>` for the meta cover to avoid emoji entirely)
- [ ] No global keyboard shortcuts
- [ ] All `:focus-visible` rings present (#14, #15)

### Data

- [ ] `related_track`, `related_release`, `related_artists` resolved server-side
- [ ] No `useArtists()` / `useReleases()` import on video detail page
- [ ] `useVideo()` is `useAsyncData` with explicit key (already correct)
- [ ] 404-throw moved above any `onMounted` references (#9)
- [ ] `duration` field, when present, displayed as "4:32" tabular-nums

### JSON-LD (out of design-system scope, recommended)

- [ ] `VideoObject` schema with `name`, `description`, `thumbnailUrl`, `uploadDate`, `embedUrl`, `duration` (ISO 8601 if available), `contentUrl` (YT URL)

### Visual

- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Player remains 16:9 across all breakpoints (no stretch)
- [ ] Poster object-cover keeps subject centered
- [ ] All `v-wave` on interactive elements
- [ ] Light Surfaces contract respected for `.Content` slab

## SEO upgrade (out of design-system scope, recommended)

```ts
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: item.value.title,
      description: stripHtml(item.value.information ?? ''),
      thumbnailUrl: item.value.cover_xl || item.value.cover_og,
      uploadDate: item.value.date,
      duration: item.value.duration ? `PT${item.value.duration.replace(':', 'M')}S` : undefined,
      contentUrl: item.value.links?.youtube,
      embedUrl: embed.value,  // youtube-nocookie embed URL
    }),
  }],
})
```

Unlocks Google video rich card.

## Out of scope (deferred / open questions)

- **Vimeo / SoundCloud / TikTok / Instagram embed support** — extend `Video.links` schema and player-mounting logic when label uses any of these as primary.
- **Auto-generated thumbnail from YouTube API** — possible at build time; today rely on `cover_th` / `cover_xl` manual entries.
- **Closed captions / transcripts** — accessibility upgrade; depends on YT-side data and label workflow.
- **"Up next" suggestion in player** — explicitly disabled (`rel=0`); curated related section is the brand approach instead.
- **Sticky mini-player on scroll** — same out-of-scope policy as release/artist/track-detail.

## Cross-references

- Refactor backlog #3-style: server-resolved `related_*`. Required.
- Refactor backlog #4: `<MediaPlayers>` extraction; consider a separate `<YouTubeEmbed>` if patterns diverge.
- Refactor backlog #5: `<EntityLinks group="video">`.
- Refactor backlog #9: 404-throw ordering.
- Refactor backlog #13: `<PageTitle>`.
- Refactor backlog #14, #15: `:focus-visible`.
- Refactor backlog #16: breadcrumb.
- Refactor backlog #17: section labels.
- Refactor backlog #18: lazy iframe — fully implemented here as click-to-play.
- Refactor backlog #19: emoji aria-hidden in OpenImage. Replace meta-row cover usage with plain `<img>` to side-step the placeholder issue entirely.
- `pages/videos.md`: featured poster + play-overlay tokens shared (consistent visual system across listing and detail).
- `pages/release-detail.md`, `pages/artist-detail.md`, `pages/event-detail.md`: Breadcrumb + action row + share + tooltip-on-guest patterns. Implementation should reuse the same components/utilities.
- MASTER §Light Surfaces: `.Content` slab now hosts info + credits as proper headed sections.
