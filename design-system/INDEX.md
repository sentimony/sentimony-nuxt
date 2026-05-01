# Design System: Index

> **Sentimony Records** — Nuxt 4 / Tailwind / Vue 3 / `@nuxt/icon` / `v-wave`. Dark-only, photo-bg, opacity-scale brand surface.
> This index links every page-override and documents the cross-cutting patterns shared between them. Read alongside `MASTER.md` (the globally-scoped contract) and `pages/<page>.md` (per-route specifications).

## Documents

| File | Purpose |
|------|---------|
| `MASTER.md` | Global rules: pattern, colors, typography, spacing, light surfaces, anti-patterns. Source of truth for shared tokens. |
| `INDEX.md` (this) | Page list + cross-cutting patterns + schema additions + refactor backlog cross-reference. |
| `pages/README.md` | Page-override template + route-to-file map. |
| `pages/*.md` | One file per route — deviations and additions over MASTER. |

## Pages (22 routes covered)

### Listings (catalog index pages)

| Route | File | Key concept |
|-------|------|-------------|
| `/` | `pages/home.md` | Hero + content strips + dual news/events block + about slab in `.Content`. Fixes `text-green-500` link conflict by routing about-copy through `.Content`. |
| `/news` | `pages/news.md` | **Two-tier transitional** — Tier 2 aggregated feed (current) → Tier 1 first-class News entities (target). 5-phase migration plan. |
| `/releases` | `pages/releases.md` | Coming Soon strip (curatorial, sort ASC) + sticky toolbar (style chips + sort) + year-grouped released grid. |
| `/tracks` | `pages/tracks.md` | Catalog index with sticky toolbar, search + sort + view toggle (List / By release), BPM chips. New `/api/tracks` endpoint. |
| `/artists` | `pages/artists.md` | 4 category sections (Musicians / DJs / Mastering / Designers) + Spotlight + search + sort. Restores commented-out h2. |
| `/events` | `pages/events.md` | Upcoming/Past split (unique time axis). Upcoming sort ASC, Past year-grouped sort DESC. |
| `/videos` | `pages/videos.md` | Featured **click-to-play** poster (no inline iframe — saves ~600KB on listing). Year-grouped grid. |
| `/playlists` | `pages/playlists.md` | Spotlight + style chips (mood-led discovery, primary axis for playlists). Fixes `.reverse()` sort bug. |
| `/friends` | `pages/friends.md` | 4 type sections (Labels / Promoters / Media / Partners). New `<FriendCard>` (logo `object-contain`, light skim) — not `<Item>` (covers crop logos). |
| `/contacts` | `pages/contacts.md` | 4 inquiry cards (Demos / Bookings / Press / General) with pre-filled mailto subjects. Footer-style social row. |

### Detail pages

| Route | File | Key concept |
|-------|------|-------------|
| `/release/[slug]` | `pages/release-detail.md` | Cat# brand badge, structured `<dl>` meta, grouped CTAs (Buy / Download / Stream), JSON-LD `MusicAlbum`. Fixes float-based layout, 14× `<BtnPrimary>` clutter. |
| `/track/[slug]` | `pages/track-detail.md` | Track-position bar (prev / N of M / next), up-next peek, semantic `<h2>` section labels. Polish over redesign — current page already strong. |
| `/artist/[slug]` | `pages/artist-detail.md` | Reveals hidden `category`, conditional CTA labels (Listen vs Portfolio for mastering/designer), Follow-on-Bandcamp in action row, dark Discography section. |
| `/event/[slug]` | `pages/event-detail.md` | **Status badge** (UPCOMING / TONIGHT / TOMORROW / PAST), `.ics` calendar export, map external link, server-resolved lineup, JSON-LD `Event`. |
| `/video/[slug]` | `pages/video-detail.md` | **Inverts standard layout** — player IS the hero (16:9 click-to-play, max-w-4xl). Schema additions (category, artist_slugs, track_slug, release_slug, duration), JSON-LD `VideoObject`. |
| `/playlist/[slug]` | `pages/playlist-detail.md` | **Spotify-first** Follow CTA (vs release where Bandcamp is primary). Curated tracklist with `position_in_playlist` — flat sequence, NOT release-grouped, no per-row likes. |
| `/news/[slug]` | `pages/news-detail.md` | Editorial article page. **Article-shape** `max-w-3xl`, title left-aligned, hero cover with intrinsic ratio, body in `.Content` slab with extended prose CSS (h2/h3/ul/ol/blockquote). JSON-LD `NewsArticle`. |
| `/friend/[slug]` | `pages/friend-detail.md` | "Visit website" as primary CTA (no Like, no embedded player, no streaming). Logo (not photo) hero with `bg-white/10` skim. Reciprocal `↔` indicator. JSON-LD `Organization`. |

### Auth + account

| Route | File | Key concept |
|-------|------|-------------|
| `/login` | `pages/login.md` | **Recommended split** from current mode-toggle — signin only. Drops `font-['Julius_Sans_One']` (utility, not brand). Form skim pattern documented for future auth pages. |
| `/signup` | `pages/signup.md` | Separate route from `/login`. Confirmation-hint card after success (no auto-navigate). Optional terms checkbox when `/terms` + `/privacy` ship. |
| `/profile` | `pages/profile.md` | Auth-protected. **Critical fix:** drop `font-['Julius_Sans_One']` from 7 utility headings. Liked Tracks: route to `/track/[slug]` (not `/release/`), upgrade to structured row pattern with cover. |

### Routes documented at infrastructure level (no override needed)

| Route | Status |
|-------|--------|
| `/confirm` | Email-confirmation redirect handler. Pure logic, no UI design surface. |

## Cross-cutting patterns

These appear in 3+ page-overrides; they're the consistency contract between pages. Each pattern has its canonical home (where it's defined first); subsequent pages cross-reference rather than redefine.

### Layout primitives

| Pattern | Canonical home | Reused in |
|---------|----------------|-----------|
| **Breadcrumb** (`← {Listing}`) | `release-detail.md` | All detail pages: track / artist / event / video / playlist / news / friend / news-detail. Token: `text-xs text-white/50 hover:text-white mt-2`. Implements refactor backlog #16. |
| **Brand badge** (`font-mono text-xs uppercase tracking-widest text-white/60 bg-white/5 px-2 py-0.5 rounded-sm`) | `release-detail.md` (cat#) | Status/category/type/style markers on every detail page. release `cat_no`, artist `category`, event `status`, video `category`, news `category`, playlist primary style, friend `type`. |
| **Subtitle row** (` · ` separator, drops missing fields) | `release-detail.md` | All detail pages. Token: `text-[11px] md:text-[13px] text-white/50`. |
| **Action row** (`flex justify-center gap-2 mb-4 flex-wrap`) | `release-detail.md` | Like + Share + (entity-specific primary). News-detail uses `flex gap-2` left-aligned (article shape). |
| **`<dl>` structured meta** (`grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm`) | `release-detail.md` | Replaces float-based `<p>` lines on all detail pages. `<dt class="text-white/50">` + `<dd>` (with `tabular-nums` for numerics). |
| **Hero cover sizing** (`size-[140px] sm:size-[280px] md:size-[320px]`) | `release-detail.md` | Reused on artist, playlist detail pages. Larger flyer (`size-[280px] sm:size-[400px]`) for events; player-as-hero on video-detail; logo skim on friend-detail. |
| **`.Content` slab** | `MASTER.md` §Light Surfaces | Long-form prose on every detail page. Extended prose CSS (h2/h3/ul/ol/li/blockquote/img/hr/code) defined in `pages/news-detail.md` — promote to MASTER when shipped. |

### Browse / discovery

| Pattern | Canonical home | Reused in |
|---------|----------------|-----------|
| **Sticky toolbar** (`top-[75px] z-10 bg-green-950/80 backdrop-blur-sm border-b border-white/10 py-2 -mx-2 px-2`) | `pages/tracks.md` | releases / artists / events / videos / playlists toolbars. Hosts search, filter chips, sort. |
| **Filter chips** (`rounded-md border border-white/20 px-4 py-2 text-sm`, active `bg-white/20 border-white/40`, hover `bg-white/30`) | `pages/news.md` | All listings with categorical filter: news category, releases style, events year, videos type, tracks BPM, playlists style. `role="tablist"` always. |
| **Native `<select>` sort** (`rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm` + `<label class="sr-only">`) | `pages/tracks.md` | All listings with sort. A11y > custom dropdown. |
| **Search input** (`rounded-md bg-white/5 border border-white/20 px-3 py-2` + leading icon `heroicons:magnifying-glass`) | `pages/tracks.md` | tracks / artists. Debounce 200ms client-side filter. |
| **Year-anchor header** (`text-3xl font-julius opacity-30 my-8`) | `pages/news.md` | Decorative chronology marker on news / releases / events / videos / news-detail. The ONLY allowed `font-julius` outside `<Hero>` per MASTER §Typography. Real `<h2>` semantically. |
| **Spotlight zone** (curatorial, always shown when populated, ignores filter state) | `pages/artists.md` | artists / playlists. Container `bg-white/5 border border-white/10 rounded-md p-6 mb-8`. Requires `featured: boolean` schema field. |
| **Featured strip / featured detail block** (latest entity gets prominence) | `pages/news.md` (featured news) | releases (Coming Soon strip ASC), videos (click-to-play poster), home (Latest Releases / Featured Artists strips via `<Swiper>`). |
| **Empty state** (`text-center py-24` + Heroicon size 48 `text-white/30` + caption + "Show all" reset) | `pages/releases.md` | All listings with filters. `role="status"`. |

### Detail-page actions

| Pattern | Canonical home | Reused in |
|---------|----------------|-----------|
| **Like button** (existing pattern) | `app/components/Item.vue` (artists) + per-detail page | All detail pages. **Tooltip "Sign in to like"** for unauthenticated users (canonical: `release-detail.md`), reuses footer-social tooltip styling. Hidden on touch. |
| **Share button** (`navigator.share` → `clipboard.writeText` → fallback) | `release-detail.md` | All detail pages. Toast "Link copied" via `aria-live="polite"`. |
| **Primary entity CTA** (varies by entity) | per page | Releases: download CTAs (Bandcamp); Tracks: included in release CTAs; Artists: Follow on Bandcamp / SoundCloud; Events: Get tickets / Add to calendar; Videos: Open on YouTube; Playlists: Follow on Spotify; Friends: Visit website; News: no external CTA. |
| **Grouped CTA labels** (`<h3 class="text-xs uppercase tracking-widest text-white/50 mt-6 mb-2">`) | `release-detail.md` | release / artist / video. Grouped flex-wrap clusters of `<BtnPrimary>` instead of vertical accumulator. Categories: Buy / Download / Stream / Listen / Connect / Portfolio / Contact. |

### Media

| Pattern | Canonical home | Reused in |
|---------|----------------|-----------|
| **Lazy iframe (active tab only)** | `release-detail.md` | All Tabs media players: release / track / artist / playlist. Implements refactor backlog #18. |
| **Click-to-play poster** (poster + brand-neutral play overlay → mount iframe on click) | `pages/videos.md` (featured) | Listing-page featured video; **fully implemented for** the entire `/video/[slug]` page (player IS the hero). |
| **Brand-neutral play overlay** (`size-20 rounded-full bg-white/20 backdrop-blur-sm border border-white/30`) | `pages/videos.md` | Never use platform red. Heroicon `play-solid` 32px white. |
| **`youtube-nocookie.com`** | existing pattern across release / track / artist | All YouTube embeds. GDPR-friendly. |
| **`<MediaPlayers>` extraction** (refactor #4) | TBD post-extraction | Will consume across release / track / artist / playlist. Spotify oEmbed support documented in `playlist-detail.md`. |
| **`<EntityLinks>` extraction** (refactor #5) | TBD post-extraction | Will replace `<BtnPrimary v-if>` clusters. Group keys: `download | stream | buy | listen | connect | portfolio | contact | event | streaming | video`. |

### Server-resolved relations (refactor backlog #3 family)

Every detail page that previously fetched a full sibling collection now expects server-side resolution. This is implemented per-API-endpoint, but the design contract is shared:

| Detail page | Resolved relation | Replaces |
|-------------|-------------------|----------|
| `/release/[slug]` | `relative_releases_full`, `relative_artists_full`, `tracks` | `useReleases()` + `useArtists()` + separate `/api/tracks/[slug]` calls |
| `/artist/[slug]` | `releases_full` | `useReleases()` filter loop |
| `/event/[slug]` | `lineup_resolved` (artists matched against catalog) | `useArtists()` filter loop |
| `/video/[slug]` | `related_track`, `related_release`, `related_artists` | All three full-collection fetches |
| `/playlist/[slug]` | `tracks_resolved` (with `position_in_playlist`) | `useReleases()` + `at_playlists.includes` filter |
| `/news/[slug]` | `related_release`, `related_artists`, `related_event`, `related_track`, `related_video` | n/a (new entity) |
| `/friend/[slug]` | `shared_releases`, `shared_artists`, `shared_events` | n/a (new feature, depends on `friend_slugs` association) |

### SEO (JSON-LD schemas)

Each detail page documents the recommended `application/ld+json` block. Out of design-system scope formally, but flagged in every override:

| Schema type | Pages |
|-------------|-------|
| `MusicAlbum` | `release-detail.md` |
| `MusicGroup` | `artist-detail.md` (musician/dj only) |
| `Person` (with `jobTitle`) | `artist-detail.md` (mastering/designer) |
| `Event` | `event-detail.md` |
| `VideoObject` | `video-detail.md` |
| `MusicPlaylist` | `playlist-detail.md` |
| `NewsArticle` | `news-detail.md` |
| `Organization` | `friend-detail.md`, `contacts.md` (Sentimony's own org with `contactPoint[]`) |

Listings do not require structured data beyond defaults.

## Schema additions across the project

Aggregate of new fields proposed by page-overrides. **None of these are implemented yet** — they're contracts to be added during implementation.

| Entity | New field | Consumers |
|--------|-----------|-----------|
| **Artist** | `featured?: boolean` | `pages/artists.md` Spotlight |
| Artist | `like_count?: number` | `pages/artists.md` "Most liked" sort |
| **Playlist** | `featured?: boolean` | `pages/playlists.md` Spotlight |
| Playlist | `curator?: string` | `pages/playlist-detail.md` subtitle row |
| Playlist | `track_count?: number` | `pages/playlist-detail.md` meta + listing badge |
| Playlist | `duration_minutes?: number` | `pages/playlist-detail.md` meta + listing badge |
| Playlist | `like_count?: number` | `pages/playlists.md` "Most liked" sort |
| **Friend** | `type?: 'label' \| 'promoter' \| 'media' \| 'partner' \| 'other'` | `pages/friends.md` 4-section grouping |
| Friend | `short_description?: string` | `pages/friend-detail.md` subtitle row |
| Friend | `reciprocal?: boolean` | `pages/friend-detail.md` ↔ indicator |
| Friend | `established_year?: number` | `pages/friend-detail.md` subtitle row |
| **Event** | `lineup_resolved` (server-only response shape) | `pages/event-detail.md` |
| **Video** | `category?: 'music-video' \| 'live' \| 'visualizer' \| 'mix' \| 'documentary' \| 'interview'` | `pages/videos.md` type chips, `pages/video-detail.md` badge |
| Video | `artist_slugs?: string[]` | `pages/videos.md` featured artist link, `pages/video-detail.md` Related |
| Video | `track_slug?: string` | `pages/video-detail.md` Related |
| Video | `release_slug?: string` | `pages/video-detail.md` Related |
| Video | `duration?: string` ('mm:ss') | `pages/video-detail.md` meta |
| Video | `like_count?: number` | `pages/videos.md` "Most liked" sort |
| **Track** | `artist_slug?: string` | `pages/tracks.md` index + Liked Tracks rows |
| Track | `like_count?: number` | already used; document at type level |
| **Release** | `friend_slugs?: string[]` | `pages/friend-detail.md` cross-pollination |
| **Artist** | `friend_slugs?: string[]` | `pages/friend-detail.md` cross-pollination |
| **Event** | `friend_slugs?: string[]` | `pages/friend-detail.md` cross-pollination |
| **News** (new entity) | full schema — see `pages/news.md` | `pages/news.md`, `pages/news-detail.md`, `pages/home.md` Latest News |
| **LikedTrack** (response shape) | `cover_th`, `release_title`, `artist_slug?` | `pages/profile.md` Liked Tracks row |

## Refactor backlog cross-reference

The 21 items in `CLAUDE.md` "Refactoring backlog" appear across multiple page-overrides. This table shows which page-overrides specifically depend on each item.

| # | Backlog item | Page overrides that block / require it |
|---|--------------|------------------------------------------|
| #1 | Likes-composables factory | profile (consumed indirectly via `usePaginatedLikes`) |
| #2 | List-page boilerplate (`useDefaultSeo`, `useSortedByDate`, `<EntityList>`) | All listings (low-priority but ubiquitous) |
| #3 | Server-resolve relations | release-detail / artist-detail / event-detail / video-detail / playlist-detail / news-detail / friend-detail. **Largest cross-cutting refactor.** |
| #4 | `<MediaPlayers>` | release-detail / track-detail / artist-detail / playlist-detail. video-detail consumes a simpler variant. |
| #5 | `<EntityLinks>` | release-detail / track-detail / artist-detail / event-detail / playlist-detail. friend-detail explicitly does NOT use it (single-CTA design). |
| #6 | Kill `tracks-N` CSS | release-detail / track-detail / playlist-detail (any iframe-host page). |
| #7 | `useFetch` → `useAsyncData` w/ key | release-detail (track fetch). |
| #8 | Tracklist invalid markup | release-detail (mandatory fix). track-detail uses similar row pattern. playlist-detail enforces the new structure. |
| #9 | 404-throw ordering | All detail pages. |
| #10 | `<MediaComingSoon>` | release-detail / track-detail / playlist-detail / video-detail. |
| #11 | Home: about copy + dead logos + green-link | home (resolved by routing copy through `.Content`). |
| #12 | `max-w-[112rem]` → `max-w-7xl` | releases / artists / events / videos / playlists / friends — **all listings** |
| #13 | `<PageTitle>` component | All pages with a top heading. |
| #14, #15 | `:focus-visible` parity | All pages. |
| #16 | Breadcrumb | All detail pages. |
| #17 | Section labels semantic upgrade (`<h2>` instead of `<small><b>`) | release-detail / track-detail / artist-detail / event-detail / video-detail / playlist-detail / news-detail / profile / friend-detail. |
| #18 | Lazy iframe + reduced-motion | All pages with embedded media. |
| #19 | OpenImage emoji `aria-hidden` | All pages using `<OpenImage>`. video-detail recommends replacing with plain `<img>` for the small meta-row cover. |
| #20, #21 | API consolidation (`/api/tracks/[release_slug]` → `/api/release/[slug]/tracks` or rolled into release payload) | release-detail / track-detail. |

## Global anti-patterns (repeated across overrides)

These anti-patterns appear in 5+ overrides — they're effectively MASTER-level rules with multi-page enforcement:

| Anti-pattern | Why | Where enforced |
|--------------|-----|----------------|
| ❌ New HEX outside the documented palette | Brand drift | All overrides |
| ❌ `font-julius` outside Hero + year-anchor decoration | Brand vs utility distinction | login / signup / profile / news-detail (call out specifically); MASTER §Typography (canonical) |
| ❌ Emoji as structural icons (use Heroicons / Iconify SVG) | Icon system consistency, dark/light theme support | MASTER §Iconography |
| ❌ Autoplay any embedded media on initial render | UX, perf, GDPR | events / videos / video-detail / playlist-detail |
| ❌ Platform colour leakage (Spotify green, YouTube red, etc.) on UI controls | Brand-neutrality | videos / video-detail (play overlay specifically) |
| ❌ Pagination on bounded catalogs | Catalog scale doesn't warrant it | All listings |
| ❌ Global page-level keyboard shortcuts | Audio-iframe focus conflicts | release-detail / track-detail / artist-detail / playlist-detail / video-detail / event-detail |
| ❌ `<button>` nested inside `<a>` / `<NuxtLink>` | Invalid HTML, breaks screen readers | release-detail (refactor backlog #8) |
| ❌ Block-level interactive content inside `<p>` | Same | release-detail (refactor backlog #8) |
| ❌ `float-left` + `clear-left` for cover/meta layout | Fragile, replaced by flex/grid + `<dl>` | release-detail / artist-detail / event-detail / video-detail / playlist-detail / friend-detail |
| ❌ Light cards in dark grid (e.g. release card with `bg-white text-black`) | Brand surface invariant | MASTER §Light Surfaces |
| ❌ Light header / footer / sticky bars | Same | MASTER §Light Surfaces |
| ❌ Map iframe embeds | Privacy, perf, brand-bg conflict | events / event-detail / contacts |
| ❌ Spotify-style ambient cover blur as page background | Conflicts with global photo bg | release-detail / artist-detail (permanent) |
| ❌ Auto-rotating featured/spotlight zones | Curatorial = stable | home / releases / artists / playlists |
| ❌ Live countdown timers / live-now banners | ISR cache conflicts | events / event-detail / home |
| ❌ Sticky mini-player on scroll | Out of scope; would require MASTER amendment | release-detail / track-detail / artist-detail / video-detail / playlist-detail |

## Per-page line counts

Total: ~5860 lines across 22 page-overrides + MASTER + INDEX.

```
artists.md        223
artist-detail.md  352
contacts.md       ~250
events.md         197
event-detail.md   385
friends.md        239
friend-detail.md  333
home.md           ~280
login.md          ~290
news.md           289
news-detail.md    362
playlists.md      ~190
playlist-detail.md ~310
profile.md        ~370
releases.md       201
release-detail.md 313
signup.md         ~310
tracks.md         226
track-detail.md   165
videos.md         203
video-detail.md   343
README.md          63
INDEX.md          (this file)
```

## How to use this index

**Building a new page:**
1. Read `MASTER.md` (global contract).
2. Read `pages/<page>.md` for the override.
3. Use this INDEX to find shared patterns by searching the canonical home column → cross-reference the canonical doc instead of re-deriving.
4. If the page introduces a new schema field, add it to the **Schema additions** table here when implementing.

**Reviewing an existing page:**
1. Open the override at `pages/<page>.md`.
2. Verify the page-specific checklist.
3. Cross-check against `MASTER.md` and the **Global anti-patterns** table above.

**Refactoring or extracting components:**
1. Look up the relevant entry in **Refactor backlog cross-reference** to see which page-overrides are blocked / waiting.
2. Update each affected page-override to point to the new canonical home once the refactor lands.
3. If the new pattern becomes truly cross-cutting (3+ pages), promote its documentation from the page-override to this INDEX or to MASTER.

**Adding a new route:**
1. Pick the closest existing override as a template (catalog page → `releases.md`; detail page → `release-detail.md`; auth page → `login.md`; editorial → `news-detail.md`; org acknowledgement → `friend-detail.md`).
2. Create `pages/<new-route>.md` documenting **only** deviations and additions.
3. Add the route to the index above and to `pages/README.md` route map.
