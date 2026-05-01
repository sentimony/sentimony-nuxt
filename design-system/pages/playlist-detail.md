# Page Override: Playlist Detail (`/playlist/[id]`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Playlist detail page.
> Source: derived from an audit of `app/pages/playlist/[id].vue` (237 lines today). Shares broad structure with release/artist-detail, but has distinct primary intent: **streaming follow** (Spotify / Apple Music) is the success metric, not download or RSVP.

## Pattern

- **Page role:** Single curated playlist with metadata, streaming CTAs, and the actual track sequence inside it.
- **Composition:** `Breadcrumb` → `Title block (style badge + title + subtitle + actions including Spotify-first follow)` → `Hero block (cover + structured meta + grouped streaming CTAs + Tabs player)` → `Tracklist section (real list of tracks, NOT release-grouped)` → `.Content slab (info)`.
- **Why diverge from release-detail:** for releases, Bandcamp/download is primary; for playlists, **streaming subscription is primary**. Spotify follow is the action that creates value (user gets the playlist in their app permanently). The CTA hierarchy must reflect this.

## Layout (top → bottom)

```
border-t border-white/30                           (existing seam, keep)
│
├── BREADCRUMB                                     ← NEW (#16)
│   ← Playlists
│
├── TITLE BLOCK  (centered, container max-w-7xl)
│   ┌────────────────────────────────────────────────┐
│   │       DARK PROGRESSIVE MIX  ← style badge       │
│   │       (font-mono text-xs uppercase             │
│   │        tracking-widest text-white/60           │
│   │        bg-white/5 px-2 py-0.5 rounded-sm)      │
│   │                                                │
│   │     Playlist Title                             │
│   │     (h1)                                       │
│   │                                                │
│   │     Curator · Apr 2026 · 24 tracks · 2h 15m    │
│   │     (subtitle row, ' · ' separator,            │
│   │      drops missing fields gracefully)          │
│   │                                                │
│   │     [♥ Like 12]  [↗ Share]  [↳ Follow Spotify] │
│   │     - Follow CTA: Spotify first, fallback to   │
│   │       Apple Music → YT Music → first available │
│   │     - Always rendered when ≥1 streaming link   │
│   │       exists (vs release where Bandcamp is     │
│   │       optional)                                │
│   └────────────────────────────────────────────────┘
│
├── HERO BLOCK  (flex flex-col lg:flex-row gap-6)
│   ├── <SvgTriangle/> decorative
│   │
│   ├── LEFT (cover + structured meta + CTA groups)
│   │   ├── OpenImage size-[140px] sm:size-[280px] md:size-[320px]
│   │   │
│   │   ├── <dl> structured metadata
│   │   │   <dt>Style</dt><dd>{{ style }}</dd>
│   │   │   <dt>Curator</dt><dd>{{ curator }}</dd>             ← when present
│   │   │   <dt>Updated</dt><dd>{{ formattedDate }}</dd>
│   │   │   <dt>Tracks</dt><dd class="tabular-nums">{{ track_count }}</dd>
│   │   │   <dt>Duration</dt><dd class="tabular-nums">{{ duration_human }}</dd>
│   │   │
│   │   └── CTA GROUP — Listen
│   │       <h3 class="text-xs uppercase tracking-widest text-white/50 mt-6 mb-2">Listen</h3>
│   │       <div class="flex flex-wrap gap-2">
│   │         <BtnPrimary> Spotify · Apple Music · YT Music · Deezer · YouTube · SoundCloud
│   │       </div>
│   │       (NOTE: no separate "Connect" group — playlists don't
│   │        have a social-platform dimension. The platforms ARE
│   │        the only relevant identity.)
│   │
│   └── RIGHT (max-w-[540px] mx-auto)
│       <Tabs>  ← becomes <MediaPlayers/> per #4
│       Spotify (NEW — see Embed strategy below)
│        / YouTube playlist
│        / SoundCloud playlist
│        / YT Music playlist
│       Lazy-mount only the active tab.
│
├── TRACKLIST SECTION  (dark, between hero and .Content)
│   ┌──────────────────────────────────────────────────────┐
│   │ Tracklist  ·  24                          [h2]       │
│   │                                                      │
│   │ <ol> of tracks (resolved server-side from at_playlists)│
│   │   <li class="flex items-center gap-3 py-2 hover:bg-white/5 rounded-sm">
│   │     <span class="text-white/40 tabular-nums w-8">01</span>
│   │     <img src="cover_th" class="size-10 rounded-sm" />
│   │     <div class="flex-1 min-w-0">
│   │       <NuxtLink to="/track/[slug]" class="font-medium hover:underline">
│   │         {{ title }}
│   │       </NuxtLink>
│   │       <div class="text-xs text-white/60">
│   │         <NuxtLink to="/artist/[slug]" class="hover:underline">{{ artist_name }}</NuxtLink>
│   │         <span> · </span>
│   │         <NuxtLink to="/release/[slug]" class="hover:underline">{{ release_title }}</NuxtLink>
│   │       </div>
│   │     </div>
│   │     <span class="text-xs text-white/50 tabular-nums">{{ bpm }}bpm</span>  ← when present
│   │     <span class="text-xs text-white/50 tabular-nums">{{ duration }}</span>← when present
│   │   </li>
│   │ </ol>
│   │                                                      │
│   │ - flat sequence (NOT grouped by source release)      │
│   │   — playlists are a curated *flow*, not an album     │
│   │   collection. Grouping by release destroys the       │
│   │   curatorial intent.                                 │
│   └──────────────────────────────────────────────────────┘
│
└── .Content SLAB  (light surface, info only)
    ├── <h2>About this playlist</h2>
    └── info HTML (v-html, trusted)
    (the current "Releases / Tracks" block here is REMOVED
     and replaced by the dedicated Tracklist section above)
```

## Tokens (overrides + additions)

All from MASTER + Light Surfaces. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Breadcrumb | `text-xs text-white/50 hover:text-white mt-2` | top of page |
| Style badge | `font-mono text-xs uppercase tracking-widest text-white/60 bg-white/5 px-2 py-0.5 rounded-sm` | above h1 |
| Subtitle row | `text-[11px] md:text-[13px] text-white/50` | under h1 |
| Action row | `flex justify-center gap-2 mb-4 flex-wrap` | actions |
| Action button | reuse `pages/release-detail.md` action-button token | like/share |
| Follow CTA | reuse `<BtnPrimary>` | hero action |
| Cover (hero) | `size-[140px] sm:size-[280px] md:size-[320px]` | cover |
| Meta `<dl>` | `grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm` | replaces float `<p>` |
| Meta `<dt>` | `text-white/50` | label column |
| Meta `<dd>` (count/duration) | `tabular-nums` | numeric values |
| CTA group heading | `text-xs uppercase tracking-widest text-white/50 mt-6 mb-2` | "Listen" label |
| CTA group container | `flex flex-wrap gap-2` | buttons row |
| Tracklist section | `container max-w-3xl mx-auto mt-12` | between hero and .Content |
| Tracklist heading | `text-2xl my-6` Montserrat + count `text-white/40 ml-2 tabular-nums` | h2 |
| Tracklist row | `flex items-center gap-3 py-2 hover:bg-white/5 rounded-sm transition-colors duration-200` | each `<li>` |
| Tracklist row position | `text-white/40 tabular-nums w-8 text-right` | track number |
| Tracklist row cover | `size-10 rounded-sm shrink-0 ring-1 ring-white/10` | small cover |
| Tracklist row meta | `text-xs text-white/60` | artist · release line |
| Tracklist BPM/duration | `text-xs text-white/50 tabular-nums shrink-0` | trailing meta |
| Section labels in `.Content` | `text-sm font-bold m-0` (as `<h2>`) | per #17 |

## Components

**Reuse:**
- `<OpenImage>` — keep, enlarge
- `<BtnPrimary>` for Follow CTA + each platform link
- `<Tabs>`/`<Tab>` until extracted (#4)
- `<NuxtLink>` for tracklist row title/artist/release (each independently navigable)
- `<Icon>` Heroicons

**To extract (refactor backlog):**
- `<MediaPlayers :links>` (#4) — extend to consume Spotify embed link in addition to YouTube/SoundCloud
- `<EntityLinks :links group="streaming">` (#5) — playlist uses just the streaming group
- `<MediaComingSoon>` (#10)
- `<PageTitle>` (#13)

**To introduce (new):**
- **Tracklist row pattern** — single-page use today; defer extraction to a `<TrackListItem>` component until releases / artists / tracks pages all need an identical row. Currently each context wants a different shape (release-page row needs a like button; playlist-page row doesn't — it's a curatorial sequence, not user-curated).

## Data

**Schema additions (also referenced in `playlists.md`):**

```ts
export interface Playlist extends BaseEntity {
  // ... existing
  featured?: boolean
  curator?: string
  track_count?: number      // server-side aggregate
  duration_minutes?: number // server-side aggregate
  like_count?: number
}
```

**API change required (`/api/playlist/[slug]` payload extension):**

```ts
type PlaylistDetailResponse = Playlist & {
  tracks_resolved: Array<{
    slug: string
    title: string
    artist_name: string
    artist_slug?: string         // when matches a known artist
    release_slug: string
    release_title: string
    cover_th: string
    track_number: number
    bpm: number | null
    position_in_playlist: number  // curatorial order, NOT release track_number
  }>
}
```

The server resolves `release.at_playlists.includes(slug)` once and walks each release's tracklist to assemble `tracks_resolved`, with a curatorial position.

**Curatorial position field is critical:** the current rendering preserves release-grouping (which destroys the playlist's intended sequence). Playlists are a *flow* — they need an explicit `position_in_playlist` field that the curator (label admin) sets.

If `position_in_playlist` is unavailable in the DB today, fall back to: order tracks by their parent release's date desc, then by `track_number` asc within each release. This is a reasonable default for v1 but should not be the long-term truth — playlists deserve curated order.

**Computed for follow CTA:**

```ts
const followLink = computed(() => {
  const links = item.value?.links
  if (!links) return null
  if (links.spotify)       return { url: links.spotify,       label: 'Follow on Spotify',     icon: 'fa-brands:spotify' }
  if (links.apple_music)   return { url: links.apple_music,   label: 'Add on Apple Music',    icon: 'fa-brands:apple' }
  if (links.youtube_music) return { url: links.youtube_music, label: 'Save on YT Music',      icon: 'simple-icons:youtubemusic' }
  if (links.deezer)        return { url: links.deezer,        label: 'Follow on Deezer',      icon: 'fa-brands:deezer' }
  if (links.youtube)       return { url: links.youtube,       label: 'Watch on YouTube',      icon: 'fa:youtube' }
  return null
})
```

**Computed for duration humanisation:**

```ts
const durationHuman = computed(() => {
  const min = item.value?.duration_minutes
  if (!min) return null
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
})
```

## Interactions specific to this page

### Title block

- **Style badge:** non-interactive, displays `Playlist.style`. When style is comma-separated (`Dark Progressive, Trance`), show only the first segment (primary mood). Full style appears in meta `<dl>`.
- **Subtitle row:** drops missing fields cleanly; field order (curator → date → tracks → duration) reflects browse priority.

### Action row

- **Like, Share:** identical to other detail pages.
- **Follow CTA:** Spotify-priority fallback chain (see `followLink` computed). Always shown when at least one streaming link exists. Hidden entirely otherwise (rare).

### Hero block

- **Cover:** `<OpenImage>` lightbox.
- **Meta `<dl>`:** drops missing rows; `<dt>` / `<dd>` semantic.
- **CTA group "Listen":** all platforms in one flex-wrap. NO separate "Connect" group (playlists have no social dimension).

### Tabs player

- **Spotify embed (NEW, recommended):** add a Spotify tab using oEmbed iframe `https://open.spotify.com/embed/playlist/{playlistId}`. Requires extracting Spotify playlist ID from `links.spotify`. Lazy-mount.
- **YouTube / SoundCloud / YT Music tabs:** existing behaviour. Lazy-mount only active.
- **Click-to-play recommended for Spotify** (parallel with `pages/video-detail.md`): Spotify oEmbed is also ~300KB. Defer until measured impact justifies the complexity; v1 lazy-mount is fine.

### Tracklist section

- **Each row is multi-link:** title → `/track/[slug]`, artist → `/artist/[slug]` (when `artist_slug` resolved), release → `/release/[slug]`. Three independent click targets; no nested `<a>`s.
- **Row hover:** `bg-white/5` for subtle highlighting; row itself is NOT a single link target (because it has multiple semantic targets).
- **Position number:** display order from `position_in_playlist`, padded `01..99` (`tabular-nums`).
- **Cover thumbnail:** non-interactive identification; click on title navigates to track.
- **No like button on row:** unlike release tracklist (which lets users like individual tracks), playlist tracklist is **curatorial** — likes belong on the playlist as a whole, on individual tracks at `/track/[slug]`, on releases at `/release/[slug]`. Adding row-level likes here muddles the surface.

### `.Content` slab

- **Info only.** The current embedded "Releases / Tracks" block is removed; replaced by the dedicated Tracklist section above.
- **Section labels** as `<h2>` per #17.

### Keyboard

- All actions tab-reachable. `:focus-visible` ring on every link/button.
- No page-level shortcuts.

## Accessibility specific to this page

- Heading hierarchy: `<h1>Playlist Title</h1>` → `<h3>Listen</h3>` (CTA group) → `<h2>Tracklist</h2>` → `<h2>About this playlist</h2>`. Mixed h2/h3 levels are acceptable here because the CTA group is part of the hero block, not a top-level section.
- Style badge: `<span aria-label="Style: Dark Progressive Mix">`.
- Subtitle row: `<p>` with text separators.
- `<dl>` semantic for meta fields.
- Tracklist `<ol>` with `<li>` per track. Three discrete `<NuxtLink>`s per row (title, artist, release).
- Each tracklist row has a unique accessible name via the title link; cover img has `alt={track.title}` (or empty `alt=""` if cover is purely decorative — pick one consistently).
- Action row buttons each have explicit `aria-label`.
- Iframe in Tabs: explicit `title` (already done; extend to Spotify when added).
- Breadcrumb: `<nav aria-label="Breadcrumb">`.

## Anti-patterns specific to this page

- ❌ **Do not group tracklist by source release.** Destroys curatorial sequence. Flat ordered list only.
- ❌ **Do not render `tracklistCompact` via `v-html`** in this page. Use the structured `tracks_resolved` from the API.
- ❌ **Do not add a like button per tracklist row.** Likes belong on the track detail page; playlist row is a curatorial pointer, not a social interaction surface.
- ❌ **Do not promote download / Bandcamp CTAs** — playlists don't sell ownership, they offer subscription-based listening. Spotify-first follow is the only meaningful primary action.
- ❌ **Do not autoplay Spotify embed** when added; lazy-mount is mandatory.
- ❌ **Do not show "Connect" CTA group.** Playlists have no social-platform identity; the platforms ARE the listening identity.
- ❌ **Do not float-left the cover.** Same `clear-left` issue as everywhere else.
- ❌ **Do not show duplicate tracks in the resolved tracklist.** If two releases include the same track, dedupe by `track.slug` and keep the first occurrence (curatorial position wins).

## Pre-delivery checklist (page-specific, in addition to MASTER)

### Structure & semantics

- [ ] Breadcrumb `← Playlists` above title block
- [ ] Style badge above h1, displays first segment when style is comma-separated
- [ ] Subtitle row drops missing fields cleanly
- [ ] Action row: Like + Share + Follow (with Spotify-first fallback chain)
- [ ] Cover sized `size-[140px] sm:size-[280px] md:size-[320px]`
- [ ] Meta uses `<dl>` with `<dt>` / `<dd>`; track count + duration `tabular-nums`
- [ ] CTA group "Listen" only — no "Connect" / "Buy"
- [ ] Tabs player lazy-mounts only the active tab
- [ ] Tracklist section is its own dark block between hero and `.Content`
- [ ] Tracklist `<ol>` with structured `<li>` rows; title / artist / release as discrete `<NuxtLink>`s
- [ ] Tracklist position rendered with `tabular-nums` and padding (`01..99`)
- [ ] No like button in tracklist rows
- [ ] `.Content` slab contains ONLY info HTML
- [ ] Section labels in `.Content` as `<h2>`
- [ ] No `float-left` / `clear-left` survivors

### Behaviour

- [ ] Follow CTA chain: Spotify → Apple → YT Music → Deezer → YouTube
- [ ] Spotify embed tab added when `links.spotify` exists (recommended; defer if scope-bound)
- [ ] All embeds lazy-mount only on tab activation
- [ ] Share uses navigator.share → clipboard fallback
- [ ] Like tooltip "Sign in to like" only when unauthenticated AND not on touch
- [ ] OpenImage emoji `aria-hidden` (#19)
- [ ] All `:focus-visible` rings present (#14, #15)
- [ ] Tracklist rows: hover highlight via `bg-white/5`; rows are NOT single-link targets

### Data

- [ ] `tracks_resolved` resolved server-side with `position_in_playlist`
- [ ] No `useReleases()` import on playlist detail page
- [ ] Tracks deduped by slug if same track appears in multiple source releases
- [ ] Fallback ordering when `position_in_playlist` missing: release date desc, then `track_number` asc
- [ ] `usePlaylist()` is `useAsyncData` with explicit key (already correct)
- [ ] 404-throw moved above any `onMounted` references (#9)
- [ ] `track_count`, `duration_minutes` aggregated server-side

### JSON-LD (out of design-system scope, recommended)

- [ ] `MusicPlaylist` schema with `name`, `description`, `numTracks`, `track` (array of `MusicRecording` references)

### Visual

- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Cover scales smoothly across breakpoints
- [ ] Tracklist rows wrap cleanly on mobile (cover + title/artist line stacked, BPM/duration drop to second line if needed)
- [ ] All `v-wave` on interactive elements
- [ ] Light Surfaces contract respected for `.Content` slab

## SEO upgrade (out of design-system scope, recommended)

```ts
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'MusicPlaylist',
      name: item.value.title,
      description: stripHtml(item.value.info ?? ''),
      numTracks: item.value.track_count,
      genre: item.value.style,
      url: absoluteUrl.value,
      image: item.value.cover_xl,
      track: tracksResolved.value.slice(0, 50).map(t => ({  // cap at 50 to keep payload reasonable
        '@type': 'MusicRecording',
        name: t.title,
        byArtist: { '@type': 'MusicGroup', name: t.artist_name },
        url: `https://sentimony.com/track/${t.slug}`,
      })),
    }),
  }],
})
```

## Out of scope (deferred / open questions)

- **In-page audio playback queue** (clicking play next to a tracklist row plays the track inline). Requires a global persistent player surface — out of scope; same family as the sticky play-bar deferred from release/artist/track-detail pages.
- **Per-row like buttons** — explicitly out of scope (anti-pattern above).
- **Spotify oEmbed click-to-play** — performance optimisation; defer until measured impact warrants.
- **"Save all tracks" bulk action** — would require auth + multi-track action UI. Out of scope.
- **Playlist version history** ("This playlist was updated on ...") — depends on edit-tracking schema field; v2.

## Cross-references

- Refactor backlog #3-style: server-resolved `tracks_resolved`. Required.
- Refactor backlog #4: `<MediaPlayers>` extraction; should support Spotify embed.
- Refactor backlog #5: `<EntityLinks group="streaming">`.
- Refactor backlog #8: tracklist invalid markup. Resolved here by fresh `<ol>`/`<li>` structure.
- Refactor backlog #9: 404-throw ordering.
- Refactor backlog #10: `<MediaComingSoon>` extraction.
- Refactor backlog #13: `<PageTitle>`.
- Refactor backlog #14, #15: `:focus-visible` parity.
- Refactor backlog #16: breadcrumb. Implemented.
- Refactor backlog #17: section labels semantic upgrade.
- Refactor backlog #18: lazy iframe.
- Refactor backlog #19: emoji aria-hidden in OpenImage.
- `pages/playlists.md`: shared `featured`, `curator`, `track_count`, `duration_minutes`, `like_count` schema additions.
- `pages/release-detail.md`: shared Breadcrumb, action row, `<dl>`, share, tooltip-on-guest patterns. Tracklist row design here is INTENTIONALLY different (no per-row like).
- `pages/track-detail.md`: tracklist row clicks navigate there; consistent ownership of "what is one track".
- MASTER §Light Surfaces: `.Content` slab contains only the info prose; tracklist lives on dark surface.
