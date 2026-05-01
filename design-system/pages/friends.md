# Page Override: Friends (`/friends`)

> Inherits from `../MASTER.md`. Documents only **deviations and additions** for the Friends listing page.
> Source: derived from a UX audit of `app/pages/friends.vue` (62 lines today — flat `<p><NuxtLink>` list of titles only, container `max-w-[112rem]`, logos commented out).
> Distinct from all other listings: friends are **other labels / partners / promoters / media** — organisations, not content. The visual object is a **logo**, not a cover or a photo.

## Pattern

- **Page role:** Directory of allied labels, promoters, media outlets, and other partners — outward-facing acknowledgements with primary intent of "go visit them".
- **Composition:** `Type sections (h2 + grid of <FriendCard>)` → `Empty state`.
- **Why diverge from `/artists` 4-category pattern:** structurally similar, but the visual object is fundamentally different. Logos need their own card type that respects intrinsic aspect ratios (logos are not square photos). Search/filter is unnecessary at typical scale (≤30 friends).

## Layout (top → bottom)

```
container max-w-7xl   ← override of current max-w-[112rem]
│
├── <PageTitle>Friends</PageTitle>
│
├── <p class="text-white/60 max-w-2xl mb-8 text-sm">
│     Labels, promoters and media we share the floor with.
│   </p>
│   (one-line context — friends section needs framing because the page
│    is otherwise just logos. Optional but recommended.)
│
├── 4 TYPE SECTIONS  (each <section> with <h2>, only sections with ≥1 entry render)
│   ┌────────────────────────────────────────────────────────┐
│   │ Labels  ·  12                            [h2]          │
│   │ <FriendCard> × N (logo-tile)                          │
│   ├────────────────────────────────────────────────────────┤
│   │ Promoters  ·  4                                       │
│   ├────────────────────────────────────────────────────────┤
│   │ Media  ·  3                                           │
│   ├────────────────────────────────────────────────────────┤
│   │ Other  ·  2                                           │
│   └────────────────────────────────────────────────────────┘
│   - h2: text-2xl my-6 (Montserrat, NOT font-julius)
│   - count: text-white/40 ml-2 tabular-nums
│   - grid: flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]
│   - sections with count = 0 hide entirely (h2 + grid)
│
└── EMPTY STATE
    Only when no visible friends across all types (rare — page usually populated).
    text-center py-24
    heroicons:hand-thumb-up size 48 text-white/30
    "No friends listed yet"
```

### `<FriendCard>` shape

```
NuxtLink  to="/friend/[slug]"  v-wave
class="block group rounded-sm py-1 md:py-3 mt-[-0.25rem] md:mt-[-0.75rem] w-[120px] md:w-[200px]"
│
├── LOGO TILE  (relative, ratio 1:1 to keep grid consistent
│               but logo inside is object-contain, NOT object-cover)
│   class="relative size-[100px] md:size-[180px] mx-auto rounded-sm
│          bg-white/10 transition-[background-color] duration-200 ease-in-out
│          group-hover:bg-white/30 group-focus-visible:bg-white/30 mb-[4px]
│          flex items-center justify-center p-3 md:p-4"
│   ┌─────────────────────────────────────────────┐
│   │  ┌─────────────────────────────────────┐    │
│   │  │ <img cover_th object-contain w-full │    │
│   │  │      h-full max-h-full max-w-full>  │    │
│   │  └─────────────────────────────────────┘    │
│   └─────────────────────────────────────────────┘
│
└── TITLE
    class="line-clamp-2 tracking-tight text-center text-xs md:text-sm"
    {{ i.title }}
```

**Why a card instead of `<Item>`:**

`<Item>` uses `object-cover` on a square — that crops logos at unpredictable angles. Logos must be `object-contain`. Other differences:
- Slightly wider tile (`w-[120px] md:w-[200px]`) to give wordmark logos enough horizontal room.
- Inner padding (`p-3 md:p-4`) — logos need breathing space; cover photos don't.
- Light skim background (`bg-white/10`) inside the tile — many label logos are monochrome white-on-black; without a skim they vanish on dark photo bg areas. Hover deepens to `bg-white/30` (consistent with the rest of the brand).
- No `coming_soon` / `Out Now` badges (don't apply to friends).
- No like button (friends are not user-curated content; not a like surface).
- Title centered (logos are visually centered, label below should match).

## Tokens (overrides + additions)

All from MASTER. **No new HEX.**

| Token | Value | Scope |
|-------|-------|-------|
| Container | `container max-w-7xl` (was `max-w-[112rem]`) | page wrapper |
| Page intro copy | `text-white/60 max-w-2xl mb-8 text-sm` | one-line framing under title |
| Section h2 | `text-2xl my-6` (Montserrat) | type headers |
| Section count | `text-white/40 ml-2 tabular-nums` | inline after h2 |
| FriendCard tile | `relative size-[100px] md:size-[180px] mx-auto rounded-sm bg-white/10 flex items-center justify-center p-3 md:p-4 transition-[background-color] duration-200 group-hover:bg-white/30 group-focus-visible:bg-white/30` | logo container |
| FriendCard logo image | `object-contain w-full h-full max-h-full max-w-full` | inside tile |
| FriendCard title | `line-clamp-2 tracking-tight text-center text-xs md:text-sm mt-1` | label below |
| FriendCard wrapper | `block group rounded-sm py-1 md:py-3 w-[120px] md:w-[200px]` | NuxtLink |
| Empty state | reuse `pages/releases.md` empty-state token | filter zero |

## Components

**Reuse:**
- `<NuxtLink>` for card click target (with `v-wave`)
- `<Icon>` for empty state
- `<PageTitle>` once shipped (#13)

**To introduce (new):**
- **`<FriendCard :i>`** — small dedicated component. Worth extracting because:
  1. Inner layout is genuinely different from `<Item>` (object-contain, padded, light skim, wider tile).
  2. Used twice across listing + (potentially) home-page friends strip.
  3. Existing `<Item>` would otherwise need a `category="friend"` branch with significantly different rules — branching `<Item>` adds complexity to the most-used component on the site.

```vue
<!-- app/components/FriendCard.vue -->
<script setup lang="ts">
import type { Friend } from '~/types'
defineProps<{ i: Friend }>()
</script>

<template>
  <NuxtLink
    :to="'/friend/' + i.slug"
    class="block group rounded-sm py-1 md:py-3 w-[120px] md:w-[200px]"
    v-wave
  >
    <div
      class="relative size-[100px] md:size-[180px] mx-auto rounded-sm bg-white/10
             flex items-center justify-center p-3 md:p-4
             transition-[background-color] duration-200 ease-in-out
             group-hover:bg-white/30 group-focus-visible:bg-white/30 mb-[4px]"
    >
      <img
        v-if="i.cover_th"
        :src="i.cover_th"
        :alt="i.title + ' logo'"
        class="object-contain w-full h-full max-h-full max-w-full"
        loading="lazy"
      />
    </div>
    <div class="line-clamp-2 tracking-tight text-center text-xs md:text-sm mt-1">
      {{ i.title }}
    </div>
  </NuxtLink>
</template>
```

**Do not introduce:**
- ❌ Search / filter chips at v1 — directory typically ≤30 entries, scrolling and 4 type sections are sufficient affordance.
- ❌ Sort dropdown — type sections already organise the page; alphabetical inside each section is the implicit default.
- ❌ A "Featured friend" Spotlight — friendships are mutual acknowledgements, not curatorial content; spotlighting one feels exclusionary.

## Data

**Schema additions required:**

```ts
// app/types/index.ts — Friend
export type FriendType = 'label' | 'promoter' | 'media' | 'partner' | 'other'

export interface Friend extends BaseEntity {
  // existing: slug, title, visible, date, cover_og, cover_th, cover_xl, information, url
  type?: FriendType                  // NEW — for grouping
  short_description?: string         // NEW — 1-line for the detail page subtitle
  reciprocal?: boolean               // NEW — when true, "we're in their friends list too";
                                     //       displayed as a small "↔" badge on detail page
}
```

`type` defaults to `'other'` when missing on the server side. Existing entries without `type` should be backfilled by an admin.

**Section grouping derivation:**

```ts
const visibleFriends = computed(() => friends.value.filter(f => Boolean(f.visible)))

const grouped = computed(() => ({
  label:    visibleFriends.value.filter(f => f.type === 'label').sort(byTitle),
  promoter: visibleFriends.value.filter(f => f.type === 'promoter').sort(byTitle),
  media:    visibleFriends.value.filter(f => f.type === 'media').sort(byTitle),
  partner:  visibleFriends.value.filter(f => f.type === 'partner').sort(byTitle),
  other:    visibleFriends.value.filter(f => !f.type || f.type === 'other').sort(byTitle),
}))

const byTitle = (a: Friend, b: Friend) =>
  (a.title ?? '').localeCompare(b.title ?? '')
```

**Sort within sections is alphabetical** — friends sections are not chronological; alphabetical is the predictable default for a directory. Drop the current date-desc sort.

Render section order: Labels → Promoters → Media → Partners → Other. "Partner" covers anything that doesn't fit Labels/Promoters/Media (record stores, festivals organisers, vinyl pressing plants); "Other" is the catch-all.

## Interactions specific to this page

- **Card click:** `<NuxtLink>` to `/friend/[slug]`. `v-wave`.
- **Hover:** background skim deepens from `bg-white/10` to `bg-white/30` via `transition-[background-color]`.
- **Empty type sections:** completely removed from DOM (h2 + grid).
- **No filtering / sorting controls** at v1.

## Accessibility specific to this page

- Heading hierarchy: `<h1>Friends</h1>` → `<h2>Labels</h2>` → `<h2>Promoters</h2>` → `<h2>Media</h2>` → `<h2>Partners</h2>` → `<h2>Other</h2>`. Linear; only sections with content render.
- `<FriendCard>`: image `alt="{title} logo"` (existing pattern across the project).
- Logo skim background ensures monochrome logos remain visible against the photo background — verify visually for any new logo added.
- Card link: `aria-label` defaults to the visible label; no separate aria-label needed because the link wraps both image and text.
- Focus order: page heading → first section's cards → next section's cards → ... → footer.
- All `v-wave`.

## Anti-patterns specific to this page

- ❌ **Do not use `<Item>` for friends.** `object-cover` on logos crops them; `<Item>` is for content covers, not for organisation marks.
- ❌ **Do not display Friend `date` field as a meta line.** Friend.date is admin-set ordering / addition-time, not editorial. Hide from UI.
- ❌ **Do not introduce an inline-like on FriendCard.** Friends are acknowledgements, not user-curated content.
- ❌ **Do not show external URL on the listing page.** The card navigates to `/friend/[slug]` where the external URL gets a proper CTA. Listing page click goes internal first; users self-direct from the detail page.
- ❌ **Do not group by region / country.** Genre / collaboration type is the meaningful axis; geography is not.
- ❌ **Do not show coming-soon / new badges.** Don't apply.
- ❌ **Do not paginate.** Bounded directory.

## Pre-delivery checklist (page-specific, in addition to MASTER)

- [ ] Container narrowed to `max-w-7xl`
- [ ] Page intro copy added under title
- [ ] `Friend.type` schema field exists; existing entries backfilled
- [ ] Sections rendered in order: Labels → Promoters → Media → Partners → Other
- [ ] Sections without entries hide entirely (h2 + grid)
- [ ] `<FriendCard>` extracted to `app/components/FriendCard.vue` with `object-contain` + light skim
- [ ] Section count displayed: `Labels · 12` with tabular-nums
- [ ] Sort within sections: alphabetical by title
- [ ] All cards have `alt="{title} logo"`
- [ ] All `v-wave`; all `:focus-visible` rings present
- [ ] Heading hierarchy linear (h1 → h2 only)
- [ ] Verified at 375 / 768 / 1024 / 1440
- [ ] Logo legibility verified for both light + dark logos against `bg-white/10` skim

## Cross-references

- Refactor backlog #2: `useDefaultSeo`. Use here once shipped.
- Refactor backlog #12: container divergence — resolved here.
- Refactor backlog #13: `<PageTitle>`. Use here.
- `pages/artists.md`: structural analog (4 category sections, `<h2>` + count). The `<FriendCard>` parallels `<Item category="artist">` with logo-specific adjustments.
- MASTER §Components: `<Item>` retains its original purpose (content covers). `<FriendCard>` is a sibling, not a replacement.
