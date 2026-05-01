# Page Override: Track Detail (`/track/[id]`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Track detail page.
> Source: the page already mirrors `release/[id].vue` correctly (cover + meta + Tabs player + `.Content` slab). This override is a **polish pass**, not a redesign.

## Pattern

- **Page role:** Single-track context: who made it, where it lives (release), how to listen.
- **Composition:** Inherited from release-detail. Only the **track-position bar** and **up-next peek** are new.

## Additions

### 1. Track-position bar (new)

Replaces the inline `<p>Track No: X</p>` line in the meta column. Place **between** the `<h1>` title and the like-button row, centered.

```
   ◀  03 / 08  ▶
```

- Wrapping element: `<nav aria-label="Track position in release">`
- Layout: `flex items-center justify-center gap-4 my-3 text-sm text-white/50`
- Prev / next: `<NuxtLink>` wrapping `heroicons:chevron-left` / `heroicons:chevron-right`, `size="20"`
- Disabled state at boundaries: `pointer-events-none opacity-30`
- Counter: `tabular-nums` (`03 / 08`), Montserrat
- Touch zone ≥ 44pt → wrap chevrons in `inline-flex h-11 w-11 items-center justify-center`
- `v-wave` on enabled links
- Computed source: `releaseTracks` already loaded in the page (sorted by `track_number`)

### 2. Up-next peek (new)

Small block under the `<Tabs>` player area, inside the right column.

```
Up next   →   04. Artist — Title (138 bpm)
```

- Container: `mt-3 text-xs text-white/50`
- Label `Up next` in `text-white/40 uppercase tracking-widest text-[10px] mr-2`
- Track link: `hover:text-white transition-colors duration-200`
- Hidden when current track is the last in the release
- No autoplay implied — this is a navigation hint, not a queue

### 3. Like tooltip with count phrasing

Existing button: `[♥ Liked 12]`. Add a hover/focus tooltip that reads "X people liked this track" — reuses the footer-social tooltip pattern (`bg-[#8a0202]`, letter-spacing animation). Keep the count visible inline regardless; tooltip is just a clarification.

- Reuse the same tooltip implementation that already lives in `Header.vue` social area
- Hide tooltip on touch devices (no hover) — the inline count already conveys it
- Defer if extracting tooltip into a shared component is too costly; this is the lowest-priority addition

### 4. Section labels semantic upgrade (cross-page, but applies here)

Inside `.Content` slab, the labels `Artists:`, `From release:`, `More from this release:`, `Similar tracks:`, `Follow X:` are currently `<small><b>...</b></small>`. Promote to `<h2 class="text-sm font-bold m-0">` (visual identical, semantic correct). Tracks page-detail follows refactor backlog #17 — apply here when implementing other changes.

### 5. Breadcrumb / back-link (cross-page)

Per refactor backlog #16: add `<NuxtLink to="/releases">← Releases</NuxtLink>` (or the corresponding listing) above the `<h1>` title. For track detail this means `← Tracks` link. Keep on a single line with `text-xs text-white/50 hover:text-white`, `mt-2 mb-0` on top.

## Tokens (overrides + additions)

All from Master. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Position bar — wrapper | `flex items-center justify-center gap-4 my-3` | between h1 and like-button |
| Position bar — text | `text-sm text-white/50 tabular-nums` | counter |
| Position bar — chevron | `heroicons:chevron-left/right` size 20, in `h-11 w-11 inline-flex` | nav arrows |
| Position bar — disabled | `pointer-events-none opacity-30` | boundary states |
| Up-next — wrapper | `mt-3 text-xs text-white/50` | under player Tabs |
| Up-next — label | `text-white/40 uppercase tracking-widest text-[10px] mr-2` | "Up next" prefix |
| Up-next — link hover | `hover:text-white transition-colors duration-200` | track link |
| Back-link | `text-xs text-white/50 hover:text-white mt-2` | above h1 |
| Section labels in `.Content` | `text-sm font-bold m-0` (as `<h2>`) | sub-section headers |

## Components

**Reuse:**
- `<Icon>` Heroicons (chevrons)
- `<NuxtLink>` (prev/next/up-next/back)
- Existing `<Tabs>`/`<Tab>` for player area — no change

**To extract later (refactor backlog):**
- `<MediaPlayers :links :tracks-number :track-number>` per backlog #4. When extracted, this page passes `:track-number="track.track_number"` so Bandcamp deep-links to the correct track.
- `<EntityLinks :links group="stream|download">` per backlog #5. Replaces the ~14 `<BtnPrimary v-if>` in the meta column.

Until those land, the current inline approach stays.

## Data

No API changes for v1.

For position bar and up-next: `releaseTracks` (already loaded via `useTrack(id)` → `data.value!.releaseTracks`) is the source. Compute:

```ts
const sortedReleaseTracks = computed(() =>
  [...releaseTracks.value].sort((a, b) => a.track_number - b.track_number)
)
const currentIndex = computed(() =>
  sortedReleaseTracks.value.findIndex(t => t.slug === track.value.slug)
)
const prevTrack = computed(() => sortedReleaseTracks.value[currentIndex.value - 1] ?? null)
const nextTrack = computed(() => sortedReleaseTracks.value[currentIndex.value + 1] ?? null)
const totalInRelease = computed(() => sortedReleaseTracks.value.length)
```

## Interactions specific to this page

- **Prev/next chevron click:** `<NuxtLink>` to neighboring track. Browser back button returns to the source listing.
- **Keyboard:** `←` / `→` arrow keys when focus is in the position bar navigate to prev/next. **Do NOT enable global page-level arrow shortcuts** — they would conflict with audio scrubbing inside Bandcamp iframes.
- **Up-next:** plain link. No autoplay logic, no preloading.
- **Like tooltip:** dismissed on `Esc`. On touch devices, tooltip is hidden (rely on inline count).
- **Back-link:** simple `<NuxtLink>` to `/tracks`. Browser back is preferred when available, but the link guarantees nav for users landing from search.

## Accessibility specific to this page

- Position bar: `<nav aria-label="Track position in release">` wrapping prev / counter / next.
- Counter announces as text, not as graphic: `03 / 08` is read literally by screen readers. Add `<span class="sr-only">Track</span>` before the counter for clarity → "Track 3 of 8".
- Disabled chevron uses `aria-disabled="true"` and `tabindex="-1"` (in addition to the visual `pointer-events-none opacity-30`).
- Up-next: `aria-label="Up next: Track 04, Artist Title"` on the link.
- Like tooltip: when shown, `role="tooltip"` linked via `aria-describedby` on the button. On touch, omit entirely.
- Section labels: real `<h2>` so screen-reader users can skim the page outline (h1 page title → h2 sections).
- Focus order: back-link → position-bar prev → counter → next → like → meta links → tabs → tracklist links → footer.

## Anti-patterns specific to this page

- ❌ **Do not autoplay the next track.** The Bandcamp/SoundCloud/YouTube iframes are isolated; we cannot programmatically chain them, and faking it would mislead.
- ❌ **Do not add a global keyboard shortcut for prev/next.** It would steal focus from audio iframes mid-playback.
- ❌ **Do not extract a "TrackPositionBar" component yet.** Single-page use; keep inline until a second consumer appears.
- ❌ **Do not promote the position bar to a sticky header.** That collides with the 75px sticky main header — different feature, see "Out of scope" below.
- ❌ **Do not change the like-button visual** beyond adding the tooltip. The current state is the brand pattern.

## Pre-delivery checklist (page-specific, in addition to Master)

- [ ] Position bar renders with correct prev/next based on `track_number` order
- [ ] Boundary states (first/last track) disable the corresponding chevron with proper aria + visual
- [ ] Counter shows `NN / NN` with leading zeros for single-digit numbers, tabular-nums
- [ ] Up-next hidden on the last track, visible elsewhere
- [ ] Up-next link goes to the correct next slug, has descriptive aria-label
- [ ] Back-link (`← Tracks`) renders above title, focuses correctly in tab order
- [ ] Section labels promoted to `<h2>` in `.Content`, visual unchanged
- [ ] Like tooltip (if shipped this round) reuses footer-social tooltip pattern, hidden on touch
- [ ] Keyboard ← / → inside position bar navigates prev/next; no global arrow shortcuts
- [ ] Bandcamp deep-link still respects `track_number` (existing behaviour, do not regress)
- [ ] All `v-wave` on prev / next / back links
- [ ] Heading outline: h1 title → h2 section labels (no skips)

## Out of scope (deferred / open questions)

The following were considered but **not included** in this override. Track them separately if/when they come up:

- **Sticky mini-info bar** under the main header (`Track N/M — Title — Artist + mini-like`) on long-scroll. Introduces a second-tier sticky region (header 75px + mini-bar ~32px = 107px total). New pattern → must be added to `MASTER.md` (z-index, height, dark-mode contrast on photo bg) before any page uses it. Decision deferred until at least one other page (release-detail?) wants the same treatment.
- **Waveform / audio preview** thumbnail on the cover. Requires generating waveform data (server-side) and a custom `<canvas>` component. Heavy; outside brand-required v1.
- **Auto-advance to next track.** Not feasible with third-party iframes; would mislead users. Permanently out of scope.

## Cross-references

- Refactor backlog #4: `<MediaPlayers>` extraction. When done, this page passes `:track-number="track.track_number"`.
- Refactor backlog #5: `<EntityLinks>`. Replaces the meta-column `<BtnPrimary>` cluster.
- Refactor backlog #6: kill `tracks-N` CSS in favour of computed iframe height. Applies to this page's player too.
- Refactor backlog #7: `useFetch` → `useAsyncData` for `/api/tracks/[releaseId]` (used here transitively via `useTrack`).
- Refactor backlog #8: tracklist invalid markup (`<p><a><button>`). Applies to the `releaseTracks` block in the `.Content` slab — fix during this pass.
- Refactor backlog #14, #15: `:focus-visible` parity for like-button and tracklist links.
- Refactor backlog #16: breadcrumb / back-link — implemented as section "5" above for this page.
- Refactor backlog #17: section labels semantic upgrade — implemented as section "4" above.
