# Page Override: Event Detail (`/event/[id]`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Event detail page.
> Source: derived from an audit of `app/pages/event/[id].vue` (119 lines today). Shares structure patterns with release/artist-detail (breadcrumb, `<dl>`, action row, `.Content` slab) but **never has a media player** and has unique features: time-based status, two flyers (a/b), structured lineup, calendar export.

## Pattern

- **Page role:** Single-event deep page. Answers: when, where, who plays, how do I get in / find out more, plus context (description, second flyer).
- **Composition:** `Breadcrumb` → `Title block (status badge + title + subtitle + actions)` → `Hero block (flyer A + structured meta)` → `Lineup section` → `Event links section` → `.Content slab (info + flyer B)`.
- **Why diverge from release/artist-detail:** no Tabs/iframe (events have no embedded media player); status (upcoming/past) drives copy and CTAs; lineup is the central content (analog of tracklist on releases) but resolves to artists; "links" are external navigation (tickets, FB event), not platform links.

## Layout (top → bottom)

```
border-t border-white/30                           (existing seam, keep)
│
├── BREADCRUMB                                     ← NEW (#16)
│   ← Events
│
├── TITLE BLOCK  (centered, container max-w-7xl)
│   ┌────────────────────────────────────────────────┐
│   │       UPCOMING / TONIGHT / PAST  ← status badge │
│   │       (font-mono text-xs uppercase             │
│   │        tracking-widest                         │
│   │        bg-green-600 text-white  for upcoming   │
│   │        bg-red-600 text-white    for tonight    │
│   │        bg-white/10 text-white/60 for past      │
│   │        px-2 py-0.5 rounded-sm)                 │
│   │                                                │
│   │     Event Title                                │
│   │     (h1: text-2xl md:text-4xl my-2 md:my-4)    │
│   │                                                │
│   │     Sat, May 17 · 22:00 · Tel Aviv             │
│   │     (subtitle row: text-[11px] md:text-[13px]  │
│   │      text-white/50, ' · ' separator,           │
│   │      drops missing fields gracefully)          │
│   │                                                │
│   │     [♥ Like 12]  [↗ Share]  [📅 Add to cal.]  [🎫 Get tickets] │
│   │     - Add to calendar: only when status != past
│   │     - Get tickets: only when item.links contains
│   │       a recognised ticket vendor
│   │     - Like and Share always shown
│   └────────────────────────────────────────────────┘
│
├── HERO BLOCK  (flex flex-col lg:flex-row gap-6)
│   ├── <SvgTriangle/> decorative
│   │
│   ├── LEFT (flyer A)
│   │   OpenImage flyer_a_xl, size-[280px] sm:size-[400px]
│   │   (larger than current; flyer is the visual identity of the event)
│   │
│   └── RIGHT (structured meta + map link)
│       <dl class="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
│         <dt>Date</dt>      <dd>Saturday, May 17, 2026</dd>
│         <dt>Time</dt>      <dd class="tabular-nums">22:00</dd>
│         <dt>Location</dt>  <dd>{{ location }}
│                              <a target="_blank" rel="noopener"
│                                 class="text-white/60 hover:text-white ml-2 text-xs"
│                                 :href="`https://maps.google.com/?q=${encodeURIComponent(location)}`">
│                                Open in Maps ↗
│                              </a></dd>
│       </dl>
│
├── LINEUP SECTION  (dark, between hero and event-links)
│   ┌────────────────────────────────────────────────┐
│   │ Lineup  ·  6                          [h2]     │
│   │ - For each lineup[].musician:                  │
│   │   - If matches a known artist slug:            │
│   │     <Item category="artist" :i="artist">       │
│   │   - Else: plain text card (same Item shape but │
│   │     no link, opacity-60)                       │
│   │ - flex flex-wrap justify-center                │
│   └────────────────────────────────────────────────┘
│   - Resolves musician string against the artists collection on the
│     server (see Data section), so unknown vs known musicians
│     are determined once, not per-render.
│
├── EVENT LINKS SECTION  (dark, between lineup and .Content)
│   ┌────────────────────────────────────────────────┐
│   │ Find out more  /  Get tickets       [h3]       │
│   │ <BtnPrimary> for each item.links entry         │
│   │ icon resolved by id (facebook → fa-brands:fb,  │
│   │ resident-advisor → simple-icons:residentadvisor│
│   │ etc.); fallback heroicons:link                 │
│   └────────────────────────────────────────────────┘
│   - replaces the current bare <a v-for> list — visual upgrade
│   - hidden entirely when item.links is empty
│
└── .Content SLAB  (light surface, info + flyer B)
    ├── <h2 class="text-sm font-bold m-0">Info</h2>   ← was <small><b>
    ├── info HTML (v-html, Firebase content trusted)
    └── flyer_b_xl as a centered <OpenImage/>
        - block, NOT float-right (current uses float-right which collides
          with prose flow)
        - max-w-full or constrained to slab width
        - hidden when flyer_b_xl is null
```

## Tokens (overrides + additions)

All from MASTER + Light Surfaces. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Breadcrumb | `text-xs text-white/50 hover:text-white mt-2` | top of page |
| Status badge — upcoming | `bg-green-600 text-white px-2 py-0.5 rounded-sm font-mono text-xs uppercase tracking-widest` | future events |
| Status badge — tonight/today | `bg-red-600 text-white px-2 py-0.5 rounded-sm font-mono text-xs uppercase tracking-widest` | events happening today |
| Status badge — past | `bg-white/10 text-white/60 px-2 py-0.5 rounded-sm font-mono text-xs uppercase tracking-widest` | concluded events |
| Subtitle row | `text-[11px] md:text-[13px] text-white/50` | under h1 |
| Action row | `flex justify-center gap-2 mb-4 flex-wrap` | actions |
| Action button | reuse `pages/release-detail.md` action-button token | like/share/calendar |
| Tickets CTA | reuse `<BtnPrimary>` (visual continuity with primary CTAs across detail pages) | tickets action |
| Flyer A (hero) | `size-[280px] sm:size-[400px]` | flyer A |
| Meta `<dl>` | `grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm` | replaces float `<p>` |
| Meta `<dt>` | `text-white/50` | label column |
| Map link | `text-white/60 hover:text-white ml-2 text-xs` | inline after location |
| Lineup section heading | `text-2xl my-6` Montserrat + count `text-white/40 ml-2 tabular-nums` | h2 |
| Lineup grid | `flex flex-wrap justify-center w-full` | reuse releases-page grid |
| Event-links heading | `text-xs uppercase tracking-widest text-white/50 mt-6 mb-2` | h3 |
| Event-links container | `flex flex-wrap justify-center gap-2` | wrap of BtnPrimary |
| Section labels in `.Content` | `text-sm font-bold m-0` (as `<h2>`) | per #17 |
| Flyer B (in `.Content`) | block, centered, max-w-full or `max-w-[480px] mx-auto my-4` | secondary flyer |

**Status thresholds** (computed from `item.date` against `Date.now()`):

```
PAST       — date < startOfToday
TONIGHT    — date == today (any time, since hour-precision is rare)
TOMORROW   — date == startOfToday + 1 day
UPCOMING   — date > startOfToday + 1 day
```

`TONIGHT` and `TOMORROW` are sub-states of upcoming with stronger urgency styling (red badge); both render the calendar/tickets CTAs.

## Components

**Reuse:**
- `<OpenImage>` (enlarge, fix `aria-hidden` per #19)
- `<BtnPrimary>` for tickets CTA + each event-link
- `<Item category="artist">` for lineup cards (when musician resolves to a known artist)
- `<SvgTriangle>`, `<Icon>` Heroicons

**To extract (refactor backlog):**
- `<EntityLinks :links group="event">` (#5) — already covers this; group key `event`. Icon mapping by `id` field defined in `app/constants/platforms.ts`.
- `<PageTitle>` (#13)

**To introduce on this page (new):**
- **Status badge** — same brand-badge shape as cat# / category badge; minimal layout, no component
- **Add-to-calendar action** — generates `.ics` blob and triggers download; small utility, not a component
- **Map link** — inline `<a>`, no component

## Data

**API change required (`/api/event/[slug]` payload extension):**

```ts
type EventDetailResponse = Event & {
  lineup_resolved: Array<
    | { musician: string; artist: { slug: string; title: string; photo_th?: string } }
    | { musician: string; artist: null }   // unknown / external
  >
  // sorted to preserve original lineup order
}
```

This eliminates the need to fetch the entire artists collection client-side just to test `lineup[].musician` against artist slugs (parallels `release-detail.md` and `artist-detail.md` server-resolve patterns).

**Composable:** existing `useEvent(id)` extends to return `lineup_resolved` in one payload.

**Computed for status badge:**

```ts
const status = computed<'past' | 'tonight' | 'tomorrow' | 'upcoming' | 'unknown'>(() => {
  if (!item.value?.date) return 'unknown'
  const d = new Date(item.value.date); d.setHours(0, 0, 0, 0)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  if (d < today) return 'past'
  if (d.getTime() === today.getTime()) return 'tonight'
  if (d.getTime() === tomorrow.getTime()) return 'tomorrow'
  return 'upcoming'
})
```

**Computed for tickets CTA:**

```ts
const TICKET_VENDORS = ['ra', 'resident-advisor', 'tickets', 'eventim', 'shotgun', 'tickettailor']
const ticketLink = computed(() =>
  item.value?.links?.find(l => TICKET_VENDORS.includes(l.id?.toLowerCase() ?? '')) ?? null
)
```

**Add-to-calendar (.ics generator):**

```ts
function generateIcs(event: Event): string {
  // RFC 5545 — minimal VEVENT with SUMMARY, DTSTART, LOCATION, DESCRIPTION, URL
  // Use UTC for DTSTART when no TZ; otherwise emit TZID
  // Server-side preferred to avoid timezone bugs in client; for v1 client-side is fine
}

function downloadIcs(event: Event) {
  const blob = new Blob([generateIcs(event)], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${event.slug}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
```

## Interactions specific to this page

### Title block

- **Status badge:** non-interactive, computed; live updates if SSR-rendered status drifts (e.g. user keeps tab open across midnight). Acceptable to recompute on `onMounted` and accept the SSR/client diff for the first paint.
- **Subtitle row:** drop fields gracefully, no orphan separators.

### Action row

- **Like, Share:** identical to release/artist-detail patterns.
- **Add to calendar:** triggers `.ics` download. Hidden for `status === 'past'` (no value in adding past events). Icon `heroicons:calendar-days`.
- **Get tickets:** `<BtnPrimary>` with `iconify="heroicons:ticket"` (or vendor icon) linking to `ticketLink.url`. Hidden when no recognised ticket vendor in `item.links`.

### Hero block

- **Flyer A:** OpenImage lightbox; same behaviour as release cover.
- **Map link:** opens Google Maps in new tab. No iframe. Hidden when no `location`.

### Lineup section

- **Known artists:** clickable `<Item category="artist">` cards. Resolved server-side.
- **Unknown / guest artists:** same Item shape but as a plain `<div>` (not `<NuxtLink>`), `opacity-60`, no hover. Visually consistent with the brand grid.
- **Order:** preserves the order in `item.lineup` (curatorial intent — opener vs headliner).

### Event-links section

- **Each link:** `<BtnPrimary>` with platform icon by `id`. Default fallback `heroicons:link`. Always opens external in new tab (BtnPrimary behaviour).
- **Section heading:** `Find out more / Get tickets` — single h3.

### `.Content` slab

- **Info HTML:** trusted Firebase content, v-html.
- **Flyer B:** centered block, NOT floated. Use `<OpenImage>` for lightbox consistency.
- **Section labels** as `<h2>` per #17.

### Keyboard

- All actions tab-reachable. `:focus-visible` ring on every button and link.
- Esc closes OpenImage lightbox.
- No page-level shortcuts.

## Accessibility specific to this page

- Heading hierarchy: `<h1>Event Title</h1>` → `<h2>Lineup</h2>` → `<h3>Find out more / Get tickets</h3>` → `<h2>Info</h2>`. Linear within sections; the h3 inside event-links is a sub-section heading after the h2 lineup.
- Status badge: `<span>`, NOT a heading. ARIA: `aria-label="Status: upcoming"` for screen readers (since uppercase styling alone may be ambiguous).
- Subtitle row: `<p>` with separators in text.
- `<dl>` semantic for date/time/location.
- Map link: `aria-label="Open {location} in Google Maps (external)"`.
- Lineup unknown-artist cards: announce as plain text, not as missing links. Avoid empty `<a>` tags.
- Add-to-calendar: button with `aria-label="Add event to calendar"`.
- Get tickets: link with `aria-label="Get tickets at {vendor}"`.
- Iframe: not used.
- Breadcrumb: `<nav aria-label="Breadcrumb">`.

## Anti-patterns specific to this page

- ❌ **Do not embed Google Maps iframe.** Conflicts with global photo-bg layering, has privacy / GDPR implications, performance cost. External link only.
- ❌ **Do not autoplay any future audio/video on event pages.** Events sell live experience, not embedded streams.
- ❌ **Do not introduce a live countdown timer.** Time-sensitive UI fights with ISR caching; status badge is enough.
- ❌ **Do not show tickets CTA when no recognised vendor link exists.** Generic "find out more" handles unknown vendors.
- ❌ **Do not float-right flyer B in `.Content`.** Disrupts prose flow; centered block is cleaner.
- ❌ **Do not mix lineup with social-platform-link styling.** Lineup is content (artists); links are navigation (vendors).
- ❌ **Do not promote past events to "TONIGHT" status by accident.** Date comparison must use start-of-day, not now.
- ❌ **Do not include past tickets links visibly.** When status === past, demote tickets section copy to "Find out more" only; ticket vendors return 404 for old events.

## Pre-delivery checklist (page-specific, in addition to MASTER)

### Structure & semantics

- [ ] Breadcrumb `← Events` above title block
- [ ] Status badge above h1, computed from date with start-of-day comparison
- [ ] Subtitle row drops missing fields cleanly (no orphan ` · `)
- [ ] Action row: Like + Share + (conditional) Calendar + (conditional) Tickets
- [ ] Calendar button hidden for past events
- [ ] Tickets CTA hidden when no recognised ticket vendor in links
- [ ] Flyer A sized `size-[280px] sm:size-[400px]`
- [ ] Meta uses `<dl>` with `<dt>` / `<dd>`
- [ ] Map link inline after location, opens external in new tab
- [ ] Lineup section: known artists as Item cards, unknown as plain shapes
- [ ] Event-links section: each link as BtnPrimary with appropriate icon
- [ ] `.Content` slab: info + centered flyer B (not floated)
- [ ] No `float-left` / `clear-left` / `float-right` survivors
- [ ] Section labels in `.Content` are `<h2>`

### Behaviour

- [ ] Status thresholds correct: past / tonight / tomorrow / upcoming
- [ ] `.ics` download generates valid VEVENT (test in Apple Calendar + Google Calendar)
- [ ] Share uses navigator.share → clipboard fallback (same as release-detail)
- [ ] Like tooltip "Sign in to like" only when unauthenticated AND not on touch
- [ ] OpenImage `⛄` placeholder wrapped in `aria-hidden` (#19)
- [ ] All `:focus-visible` rings present (#14, #15)

### Data

- [ ] `lineup_resolved` resolved server-side in `/api/event/[slug]` (#3-style fix)
- [ ] No `useArtists()` import on event detail page
- [ ] `useEvent()` is `useAsyncData` with explicit key (already correct)
- [ ] 404-throw moved above any `onMounted` references (#9)

### JSON-LD (out of design-system scope, recommended)

- [ ] `Event` schema with `name`, `startDate`, `location`, `image` (flyer_a), `performer` (lineup), `offers` (ticket link if present), `eventStatus` (mapped from status computed)
- [ ] For past events: `eventStatus: "https://schema.org/EventScheduled"` with `endDate` in the past

### Visual

- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Status badge contrast: green-600/red-600 on white text passes 4.5:1 (already enforced by Tailwind defaults)
- [ ] All `v-wave` on interactive elements
- [ ] Light Surfaces contract respected for `.Content` slab

## SEO upgrade (out of design-system scope, recommended)

```ts
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: item.value.title,
      startDate: item.value.date,
      location: {
        '@type': 'Place',
        name: item.value.location,
      },
      image: item.value.flyer_a_xl,
      performer: lineupResolved.value.map(l => ({
        '@type': 'PerformingGroup',
        name: l.artist?.title ?? l.musician,
      })),
      offers: ticketLink.value ? {
        '@type': 'Offer',
        url: ticketLink.value.url,
        availability: status.value === 'past' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
      } : undefined,
      eventStatus: status.value === 'past'
        ? 'https://schema.org/EventScheduled'  // already happened
        : 'https://schema.org/EventScheduled',  // confirmed upcoming
      url: absoluteUrl.value,
    }),
  }],
})
```

Unlocks Google Events rich card.

## Out of scope (deferred / open questions)

- **Map embed** — permanent anti-pattern.
- **Live countdown timer** — fights ISR; not worth the complexity.
- **Multi-day event support** (`endDate`) — schema doesn't have `endDate` today; defer until needed.
- **Per-event timezone field** — current date comparisons assume user TZ. Acceptable until label runs many cross-TZ events.
- **Photo report from past events** — separate `gallery` field on Event, plus a gallery viewer component. Defer until label collects enough post-event photo material.
- **RSVP / "interested" counts** — would require server state per user; out of scope for v1 (likes already cover engagement).

## Cross-references

- Refactor backlog #3-style: server-resolved `lineup_resolved`. Required.
- Refactor backlog #5: `<EntityLinks group="event">` extraction. Required.
- Refactor backlog #9: 404-throw ordering. Required.
- Refactor backlog #13: `<PageTitle>`. Use here once shipped.
- Refactor backlog #14, #15: `:focus-visible` parity. Required.
- Refactor backlog #16: breadcrumb. Implemented.
- Refactor backlog #17: section labels semantic upgrade. Required.
- Refactor backlog #19: emoji aria-hidden in OpenImage.
- `pages/events.md`: status badge styling shares semantics with the Upcoming/Past split.
- `pages/release-detail.md` and `pages/artist-detail.md`: shared Breadcrumb, action row, `<dl>` meta, share button, tooltip-on-guest-like, no-arrow-shortcuts patterns.
- MASTER §Light Surfaces: `.Content` slab now hosts info + centered flyer B (not floated).
