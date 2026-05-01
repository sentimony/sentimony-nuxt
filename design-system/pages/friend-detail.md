# Page Override: Friend Detail (`/friend/[slug]`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for a single Friend (allied label / promoter / media / partner) detail page.
> Source: derived from an audit of `app/pages/friend/[id].vue` (70 lines today — minimal page: title centered, 120px image inline, `<p>{{ title }}</p>` duplicating the title in the `.Content` slab; no information field used, no external URL exposed despite `Friend.url` being in schema).
> Distinct from all other detail pages: friends are **organisations**, not content. The primary user goal is to **leave the page and visit them**. Internal value lives in the description and any cross-pollination (shared releases / artists / events).

## Pattern

- **Page role:** Single-friend acknowledgement page. Tells you who they are, what they do, and sends you to their site.
- **Composition:** `Breadcrumb` → `Title block (type badge + title + subtitle + actions)` → `Hero (logo, centered)` → `.Content slab (description)` → `Cross-pollination section (releases / artists / events shared with this friend, when wired)`.
- **Why diverge from artist-detail:** no embedded media player (friends don't release through us), no streaming CTAs, no discography. The single most important action is "Visit website".

## Layout (top → bottom)

```
border-t border-white/30                           (existing seam, keep)
│
├── BREADCRUMB                                     (#16)
│   ← Friends
│
├── TITLE BLOCK  (centered, container max-w-3xl)
│   ┌────────────────────────────────────────────────┐
│   │       LABEL  ↔            ← type badge +       │
│   │       (font-mono text-xs uppercase             │
│   │        tracking-widest text-white/60           │
│   │        bg-white/5 px-2 py-0.5 rounded-sm)      │
│   │                                                │
│   │       The "↔" suffix appears only when         │
│   │       Friend.reciprocal === true (we're in     │
│   │       their friends list too)                  │
│   │                                                │
│   │     Friend Name                                │
│   │     (h1: text-2xl md:text-4xl my-2 md:my-4)    │
│   │                                                │
│   │     Tagline / short description · est. 2014    │
│   │     (subtitle row: text-[11px] md:text-[13px]  │
│   │      text-white/50, drops missing fields)      │
│   │                                                │
│   │     [↗ Visit website]  [↗ Share]               │
│   │     - Visit website is PRIMARY, rendered as    │
│   │       BtnPrimary (not as an action-row pill)   │
│   │     - No Like button (friends are not a user-  │
│   │       liked surface)                           │
│   └────────────────────────────────────────────────┘
│
├── HERO LOGO  (centered, container max-w-3xl)
│   ┌──────────────────────────────────────────────────────┐
│   │              ┌───────────────────────────┐           │
│   │              │                           │           │
│   │              │  <img object-contain      │           │
│   │              │   src=cover_xl />         │           │
│   │              │                           │           │
│   │              └───────────────────────────┘           │
│   │   - aspect-square outer (max-w-[280px] sm:max-w-[360px]) │
│   │   - bg-white/10 rounded-sm p-6 flex items-center      │
│   │     justify-center                                    │
│   │   - logo inside object-contain (preserves wordmark    │
│   │     proportions; same rule as on listing card)        │
│   │   - mx-auto                                           │
│   │   - NOT wrapped in <OpenImage> — logos are not        │
│   │     "preview-worthy" images; the lightbox affordance  │
│   │     is wrong here                                     │
│   └──────────────────────────────────────────────────────┘
│
├── .Content SLAB  (light surface)
│   ┌──────────────────────────────────────────────────────┐
│   │ <article class="max-w-prose mx-auto px-2">           │
│   │   <div v-html="item.information">                    │
│   │   <!-- Authored description: who they are, what       │
│   │        they do, why they matter to us. -->           │
│   │ </article>                                           │
│   │                                                      │
│   │ When item.information is missing, render a fallback: │
│   │   <p class="italic text-black/60">                   │
│   │     A friend of Sentimony Records.                   │
│   │   </p>                                               │
│   │ (Currently the page renders {{ item.title }} which   │
│   │  is just the title duplicated — that's the bug to    │
│   │  fix.)                                               │
│   └──────────────────────────────────────────────────────┘
│
└── CROSS-POLLINATION  (dark, optional, only when relations exist)
    ┌──────────────────────────────────────────────────────┐
    │ Together                                  [h2]       │
    │                                                      │
    │ Optional sections, each only when data exists:       │
    │                                                      │
    │ When item.shared_releases.length:                    │
    │   "Co-released"                                      │
    │   <Item category="release" :i="r" /> × N             │
    │                                                      │
    │ When item.shared_artists.length:                     │
    │   "Shared artists"                                   │
    │   <Item category="artist" :i="a" /> × N              │
    │                                                      │
    │ When item.shared_events.length:                      │
    │   "Shared events"                                    │
    │   <Item category="event" :i="e" /> × N               │
    │                                                      │
    │ - sub-headings as <h3 class="text-xs uppercase       │
    │   tracking-widest text-white/50 mt-4 mb-2">          │
    │ - section completely hidden when no relations        │
    └──────────────────────────────────────────────────────┘
```

## Tokens (overrides + additions)

All from MASTER + Light Surfaces. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Container (page) | `container max-w-3xl` (article-shape, like news-detail) | page wrapper |
| Breadcrumb | `text-xs text-white/50 hover:text-white mt-2` | top |
| Type badge | `font-mono text-xs uppercase tracking-widest text-white/60 bg-white/5 px-2 py-0.5 rounded-sm` | above h1 |
| Reciprocal indicator | `↔` literal char inside the type badge, after the type label, separated by a non-breaking space | inside type badge |
| Subtitle row | `text-[11px] md:text-[13px] text-white/50` | under h1 |
| Action row | `flex justify-center gap-2 mb-6 flex-wrap` | actions |
| Visit website (primary) | reuse `<BtnPrimary>` with `iconify="heroicons:arrow-top-right-on-square"` | primary external CTA |
| Share | reuse action-button token | secondary |
| Hero logo wrapper | `aspect-square max-w-[280px] sm:max-w-[360px] mx-auto bg-white/10 rounded-sm p-6 flex items-center justify-center mb-8` | logo container |
| Hero logo image | `object-contain w-full h-full max-h-full max-w-full` | inside |
| `.Content` body fallback | `italic text-black/60` | when no information |
| Cross-pollination section | `container max-w-3xl mt-12` | between body and footer |
| Cross-pollination h2 | `text-2xl my-6` Montserrat | section heading |
| Cross-pollination h3 | `text-xs uppercase tracking-widest text-white/50 mt-4 mb-2` | "Co-released" / "Shared artists" / etc |

## Components

**Reuse:**
- `<BtnPrimary>` for "Visit website" + share action (share consistent with other detail pages)
- `<Item category="...">` for cross-pollination cards
- `<Icon>` Heroicons
- `<PageTitle>` once shipped (#13)

**Do not introduce:**
- ❌ A media player. Friends don't release through us; embedding their content here is scope creep.
- ❌ A like button. Friends are not a user-engagement surface.
- ❌ `<OpenImage>` for the logo. Logos aren't "viewed" the way photos/covers are.
- ❌ A custom "logo card" component for the detail page (the listing has `<FriendCard>`; the detail page uses inline-template, single-page use).

## Data

**Schema additions (also referenced in `friends.md`):**

```ts
export interface Friend extends BaseEntity {
  // existing: slug, title, visible, date, cover_og, cover_th, cover_xl, information, url
  type?: FriendType                       // NEW
  short_description?: string              // NEW — for subtitle row
  reciprocal?: boolean                    // NEW — for ↔ indicator
  established_year?: number               // NEW — optional for subtitle ("est. 2014")
}
```

**API change required (`/api/friend/[slug]` payload extension for cross-pollination):**

```ts
type FriendDetailResponse = Friend & {
  shared_releases?: Array<Pick<Release, 'slug'|'title'|'cover_th'|'date'>>
  shared_artists?: Array<Pick<Artist, 'slug'|'title'|'photo_th'>>
  shared_events?: Array<Pick<Event, 'slug'|'title'|'flyer_a_xl'|'date'>>
}
```

The "shared" relations require a way to associate a release / artist / event with a friend. Two options:

1. **Tag-style** — add `friend_slugs?: string[]` to Release / Artist / Event schemas. Server-side cross-references resolve from these.
2. **Junction table** — introduce a `friend_associations` table linking Friend ↔ {Release, Artist, Event}. Cleaner, scales better, but more schema work.

Recommendation: start with **option 1 (tag-style)** for v1 because it's a simple field addition. Move to junction table if association becomes denser than ~5 friends per release.

**For v1 without these fields:** the cross-pollination section simply hides. The page still works as an acknowledgement card with description + visit CTA.

**Composable:** existing `useFriend(id)` extends to return `shared_*` relations once the schema lands.

**Computed for type-badge label:**

```ts
const typeLabel = computed<string>(() => {
  switch (item.value?.type) {
    case 'label':    return 'LABEL'
    case 'promoter': return 'PROMOTER'
    case 'media':    return 'MEDIA'
    case 'partner':  return 'PARTNER'
    default:         return 'FRIEND'
  }
})
```

**Computed for subtitle row:**

```ts
const subtitleParts = computed(() => [
  item.value?.short_description,
  item.value?.established_year ? `est. ${item.value.established_year}` : null,
].filter(Boolean))
```

## Interactions specific to this page

### Title block

- **Type badge:** non-interactive. Reciprocal `↔` appended when `Friend.reciprocal === true`.
- **Subtitle row:** drops missing fields cleanly. Hidden entirely when no parts.

### Action row

- **Visit website (primary):** `<BtnPrimary>` with `:to="item.url"` + arrow-top-right icon. Opens external in new tab (existing BtnPrimary behaviour). Hidden when no URL.
- **Share:** `navigator.share` → clipboard fallback (parallel with other detail pages). Toast "Link copied" on clipboard success.
- **No Like button.**

### Hero logo

- Plain `<img>` inside a square padded skim container. Not a lightbox. Not clickable.
- `bg-white/10` skim ensures monochrome white-on-black logos remain visible.
- Padding (`p-6`) provides breathing space for wordmark logos.

### Body

- `v-html` of `information` HTML in `.Content` slab.
- Fallback italic copy when no information exists. Better than the current behaviour (rendering `{{ item.title }}` — duplicating the headline as if it were body content).

### Cross-pollination section

- Hidden completely when no relations exist.
- Each sub-section (Co-released / Shared artists / Shared events) hides independently.

### Keyboard

- All actions tab-reachable. `:focus-visible` rings.
- No page-level shortcuts.

## Accessibility specific to this page

- Heading hierarchy: `<h1>Friend Name</h1>` → `<h2>Together</h2>` → `<h3>Co-released / Shared artists / Shared events</h3>`. Linear, no skips. The body's authored content may have its own h2/h3 inside `<article>` — that's nested inside the page's flow, acceptable as long as authors follow the same scheme.
- Type badge: `<span aria-label="Type: Label">LABEL</span>` (uppercase styling alone may be ambiguous). Reciprocal indicator `<span aria-label="Reciprocal friendship">↔</span>` when shown.
- Logo image: `alt="{title} logo"`.
- "Visit website": `<a href>` already has accessible name from BtnPrimary `title` prop; aria-label additionally clarifies "Visit {title} website (external link)".
- Cross-pollination items already accessible via existing components.
- Breadcrumb: `<nav aria-label="Breadcrumb">`.

## Anti-patterns specific to this page

- ❌ **Do not render `{{ item.title }}` as the body when `information` is missing.** That's the current bug. Use a clear italic fallback or nothing at all.
- ❌ **Do not auto-fetch friend's external content** (RSS, latest releases). Privacy / brittleness; if needed, the friend's website handles its own surfacing.
- ❌ **Do not use `<OpenImage>` lightbox for logos.** Logos are not photos.
- ❌ **Do not show release-style metadata** (date, format, total time) — none of those concepts apply.
- ❌ **Do not promote the friend's social links via `<EntityLinks>`** if you ship that pattern. Friends own their socials on their own site; one "Visit website" CTA is enough — multiplying social CTAs muddles the acknowledgement intent.
- ❌ **Do not introduce a "follow on Bandcamp" CTA** even if the friend is a label with a Bandcamp page. Single primary CTA = visit; their site lists their own platforms.
- ❌ **Do not show share button at the same visual weight as Visit website.** Visit is primary; Share is secondary action-row pill.
- ❌ **Do not introduce a comment/discussion area.** Same scope-creep concern as news-detail.
- ❌ **Do not include the `Friend.date` admin-side field in the UI.** It's not editorial.

## Pre-delivery checklist (page-specific, in addition to MASTER)

### Structure & semantics

- [ ] Breadcrumb `← Friends` above title block
- [ ] Type badge above h1 with computed label
- [ ] Reciprocal `↔` indicator appears only when `Friend.reciprocal === true`
- [ ] Subtitle row drops missing fields cleanly; hidden entirely when empty
- [ ] Action row: Visit website (primary BtnPrimary) + Share
- [ ] No Like button on this page
- [ ] Hero logo uses `<img>` (not OpenImage) inside a square padded skim
- [ ] Body uses `v-html` of `information`; falls back to italic stub copy when absent
- [ ] Body NEVER falls back to `{{ item.title }}` (current bug fixed)
- [ ] Cross-pollination section hidden when no shared relations
- [ ] Section labels in `.Content` (when authored) use `<h2>`/`<h3>` per #17

### Behaviour

- [ ] Visit website renders only when `item.url` exists
- [ ] Share uses navigator.share → clipboard fallback
- [ ] OpenImage `⛄` placeholder NOT used here (logo is plain `<img>` instead)
- [ ] All `:focus-visible` rings present (#14, #15)
- [ ] All `v-wave` on interactive elements

### Data

- [ ] `Friend.type`, `short_description`, `reciprocal`, `established_year` schema fields exist
- [ ] `useFriend()` is `useAsyncData` with explicit key (already correct)
- [ ] 404-throw above any `onMounted` references (#9)
- [ ] Cross-pollination data resolved server-side (when feature lands)

### JSON-LD (out of design-system scope, recommended)

```ts
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: item.value.title,
      description: item.value.short_description ?? stripHtml(item.value.information ?? ''),
      logo: item.value.cover_xl,
      url: item.value.url,
      foundingDate: item.value.established_year ? String(item.value.established_year) : undefined,
    }),
  }],
})
```

### Visual

- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Logo legible against `bg-white/10` skim for both light and dark logos
- [ ] All `v-wave` on interactive elements
- [ ] Light Surfaces contract respected for `.Content` slab

## Out of scope (deferred / open questions)

- **Friend's RSS / latest content surfacing** — privacy, scope, brittleness.
- **Auto-detection of reciprocal links** — depends on friend exposing a parseable list; manual `reciprocal: boolean` flag is cleaner.
- **Friend categorisation by music genre** — partly covered by friend type; deeper genre tagging is feature creep.
- **Multi-language descriptions** — i18n out of scope until the project ships Ukrainian / English variants of all content.
- **Friend's social links cluster** — explicitly out of scope (anti-pattern above).
- **"Open in their friends list"** reverse link — depends on the reciprocal partner's site exposing such a URL pattern; brittle.

## Cross-references

- `pages/friends.md`: schema fields shared (`type`, `short_description`, `reciprocal`, `established_year`).
- `pages/release-detail.md`, `pages/artist-detail.md`, `pages/event-detail.md`: each can reference a Friend via `friend_slugs?: string[]` (tag-style association). Required for cross-pollination section to populate.
- Refactor backlog #3-style: server-resolved `shared_*` relations.
- Refactor backlog #5: `<EntityLinks>` extraction — explicitly NOT used on this page (single primary CTA).
- Refactor backlog #9: 404-throw ordering.
- Refactor backlog #13: `<PageTitle>`. Use here.
- Refactor backlog #14, #15: `:focus-visible` parity.
- Refactor backlog #16: breadcrumb. Implemented.
- Refactor backlog #17: section labels semantic upgrade.
- Refactor backlog #19: emoji aria-hidden — NOT applicable here (no OpenImage usage).
- MASTER §Light Surfaces: `.Content` slab hosts the description body.
- MASTER §Components: `<FriendCard>` (listing) is sibling to `<Item>`, both retain their own purposes.
