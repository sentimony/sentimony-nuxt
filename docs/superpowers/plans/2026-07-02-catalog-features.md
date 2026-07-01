# Catalog Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add designer portfolio gallery, organized-events section on artist pages, `/artists/all` text list with country flags, artist Swiper category dividers, and `/releases/psytrance` + `/releases/psychill` genre filter pages.

**Architecture:** Five independent slices, minimum file surface each. Tasks 3 and 5 rename existing page files to `index.vue` to allow sibling sub-pages without Nuxt 4 nested-route conflicts (same base name = parent–child in Vue Router; `index.vue` in a directory = sibling). Pure utility logic (`locationToIso2`, genre filtering) is unit-tested; Vue components are verified manually.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, Tailwind v4, Swiper 11, Vitest 4, `flag-icons` npm package (new).

## Global Constraints

- `npm run test:unit` must pass after every commit.
- No `@apply` inside `<style scoped>` — use `class=""` or add `@reference "tailwindcss"` as the first scoped line.
- No inline code comments unless the WHY is non-obvious.
- `$fetch` with a dynamic/variable URL must carry an explicit generic: `$fetch<T>(url)`.
- Use `<NuxtImg>` not `<img>` for content images.
- `organizer` has already been written to all 5 events in `server/data/server/sentimony-db-export.json` — do not touch that file.
- Run `npx nuxi typecheck` after each task; Supabase env-var warnings are expected and not failures.

---

### Task 1: Foundation — Event type, countryFlag utility, flag-icons

**Files:**
- Modify: `app/types/index.ts` — extend `Event` with `organizer`
- Create: `app/utils/countryFlag.ts`
- Create: `tests/unit/countryFlag.test.ts`
- Modify: `nuxt.config.ts` — add flag-icons to `css` array
- Install: `flag-icons` npm package

**Interfaces:**
- Produces: `locationToIso2(location: string): string | null` — consumed by Task 3
- Produces: `Event.organizer?: string[]` — consumed by Task 2

- [ ] **Step 1: Write failing test**

Create `tests/unit/countryFlag.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { locationToIso2 } from '../../app/utils/countryFlag'

describe('locationToIso2', () => {
  it('returns code for "City, Country"', () => {
    expect(locationToIso2('Kyiv, Ukraine')).toBe('ua')
  })
  it('uses last segment after -> for dual-residency', () => {
    expect(locationToIso2('Kyiv, Ukraine -> Warsaw, Poland')).toBe('pl')
  })
  it('handles country-only string', () => {
    expect(locationToIso2('Germany')).toBe('de')
  })
  it('returns null for empty string', () => {
    expect(locationToIso2('')).toBeNull()
  })
  it('returns null for unknown country', () => {
    expect(locationToIso2('City, Xanadu')).toBeNull()
  })
  it('handles multi-hop "City, A -> City, B"', () => {
    expect(locationToIso2('Knysna, South Africa -> Antwerp, Belgium')).toBe('be')
  })
  it('handles United States', () => {
    expect(locationToIso2('San Francisco, United States')).toBe('us')
  })
  it('handles USA abbreviation', () => {
    expect(locationToIso2('New York, USA')).toBe('us')
  })
  it('handles DB typo "Panam"', () => {
    expect(locationToIso2('Panama City, Panam')).toBe('pa')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:unit -- countryFlag
```

Expected: FAIL — `Cannot find module '../../app/utils/countryFlag'`

- [ ] **Step 3: Create `app/utils/countryFlag.ts`**

```ts
const countryMap: Record<string, string> = {
  'ukraine': 'ua',
  'russian federation': 'ru',
  'russian': 'ru',
  'usa': 'us',
  'united states': 'us',
  'germany': 'de',
  'italy': 'it',
  'france': 'fr',
  'denmark': 'dk',
  'sweden': 'se',
  'netherlands': 'nl',
  'greece': 'gr',
  'malta': 'mt',
  'south africa': 'za',
  'australia': 'au',
  'brazil': 'br',
  'mexico': 'mx',
  'romania': 'ro',
  'united kingdom': 'gb',
  'india': 'in',
  'north macedonia': 'mk',
  'guatemala': 'gt',
  'chile': 'cl',
  'austria': 'at',
  'poland': 'pl',
  'belgium': 'be',
  'panam': 'pa',
  'panama': 'pa',
  'montenegro': 'me',
}

export function locationToIso2(location: string): string | null {
  if (!location?.trim()) return null
  const lastSegment = location.split('->').pop()?.trim() ?? location
  const country = lastSegment.split(',').pop()?.trim().toLowerCase() ?? ''
  return countryMap[country] ?? null
}
```

- [ ] **Step 4: Extend `Event` interface in `app/types/index.ts`**

Find the `Event` interface (line 140). Add `organizer?: string[]` after the `lineup` field:

```ts
// before
export interface Event extends BaseEntity {
  cover_og?: string
  cover_th?: string
  flyer_a_xl?: string
  flyer_b_xl?: string
  time?: string
  location?: string
  info?: string
  lineup?: EventLineup[]
  like_count?: number
  links?: EventLink[]
}

// after
export interface Event extends BaseEntity {
  cover_og?: string
  cover_th?: string
  flyer_a_xl?: string
  flyer_b_xl?: string
  time?: string
  location?: string
  info?: string
  lineup?: EventLineup[]
  organizer?: string[]
  like_count?: number
  links?: EventLink[]
}
```

- [ ] **Step 5: Install flag-icons and register its CSS**

```bash
npm install flag-icons
```

In `nuxt.config.ts`, extend the `css` array (currently line 59):

```ts
css: [
  '~/assets/css/tailwind.css',
  'flag-icons/css/flag-icons.min.css',
],
```

- [ ] **Step 6: Run all unit tests**

```bash
npm run test:unit
```

Expected: all pass, including the 9 new `countryFlag` tests.

- [ ] **Step 7: Commit**

```bash
git add app/types/index.ts app/utils/countryFlag.ts tests/unit/countryFlag.test.ts nuxt.config.ts package.json package-lock.json
git commit -m "feat: Event.organizer type, countryFlag utility, flag-icons dep"
```

---

### Task 2: Artist page — Designer portfolio + Organized Events

**Files:**
- Modify: `app/pages/artist/[id].vue` (script + template)

**Interfaces:**
- Consumes: `Event.organizer?: string[]` (Task 1)
- Consumes: `useEvents()` from `app/composables/useEvents.ts`
- Consumes: `useReleases()`, `toArray<T>()`, `visibleByDate()` — already in scope

- [ ] **Step 1: Replace the `<script setup>` block**

Full replacement of lines 1–46 in `app/pages/artist/[id].vue`:

```vue
<script setup lang="ts">
import { createError } from '#app'
import type { Release, Event } from '~/types'

const { id } = useRoute().params
const { isLiked, toggleLike, likeCount, setCount } = useArtistLikes()

const [artistAsync, releasesAsync, eventsAsync] = await Promise.all([
  useArtist(id as string, { server: true }),
  useReleases(),
  useEvents(),
])

const item = artistAsync.data
const artistError = artistAsync.error
const releasesRaw = releasesAsync.data
const eventsRaw = eventsAsync.data

if (artistError.value || !item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
}

setCount(item.value!.slug, item.value!.like_count ?? 0)

const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))
const releasesSortedByDate = computed(() => visibleByDate(releases.value))

const portfolioReleases = computed(() => {
  if (item.value?.category !== 'designer') return []
  const slug = item.value.slug
  return releasesSortedByDate.value.filter(r => {
    if (!r.artists) return false
    if (Array.isArray(r.artists)) return r.artists.includes(slug)
    return r.artists === slug
  }).filter(r => !!(r.cover_xl || r.cover_og))
})

const events = computed(() => toArray<Event>(eventsRaw.value, 'events'))
const organizedEvents = computed(() => {
  const slug = item.value?.slug
  if (!slug) return []
  return events.value.filter(e => e.visible && e.organizer?.includes(slug))
})

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const PageDescription = computed(() => [
  item.value?.title,
  item.value?.style,
].filter(Boolean).join(' - '))
useSeoMeta({
  title: () => item.value?.title,
  description: () => PageDescription.value,
  ogTitle: () => item.value?.title,
  ogDescription: () => PageDescription.value,
  ogImage: () => item.value?.photo_og || item.value?.photo_xl || appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: () => item.value?.title,
  twitterDescription: () => PageDescription.value,
  twitterImage: () => item.value?.photo_og || item.value?.photo_xl || appConfig.brand.defaultOgImage,
  twitterCard: 'summary'
})
</script>
```

- [ ] **Step 2: Replace the `<ItemContent>` block in the template**

Find the `<ItemContent v-if="item">` block (starts line 207). Replace it entirely:

```html
<ItemContent v-if="item">

  <div v-if="item.information">
    <div v-html="sanitizeHtml(item.information)" />
  </div>

  <div v-if="organizedEvents.length > 0">
    <hr class="my-4 border-black/30">
    <p><small><b>Organized Events:</b></small></p>
    <div class="flex flex-wrap justify-center w-full">
      <Item
        v-for="e in organizedEvents"
        :key="e.slug"
        :i="e"
        category="event"
      />
    </div>
  </div>

  <div>
    <hr class="my-4 border-black/30">
    <p><small><b>Releases with {{ item.title }}:</b></small></p>
    <div class="flex flex-wrap justify-center w-full">
      <template v-for="(i, index) in releasesSortedByDate" :key="index">
        <Item
          v-if="i.artists?.includes(item.slug)"
          :i="i"
          category="release"
        />
      </template>
    </div>
  </div>

  <div v-if="portfolioReleases.length > 0">
    <hr class="my-4 border-black/30">
    <p><small><b>Portfolio:</b></small></p>
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      <NuxtLink
        v-for="r in portfolioReleases"
        :key="r.slug"
        :to="'/release/' + r.slug"
        class="block aspect-square overflow-hidden rounded"
      >
        <NuxtImg
          :src="(r.cover_xl || r.cover_og)!"
          :alt="r.title || ''"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </NuxtLink>
    </div>
  </div>

</ItemContent>
```

- [ ] **Step 3: Type check**

```bash
npx nuxi typecheck
```

Expected: no new errors (Supabase env warnings OK).

- [ ] **Step 4: Manual test**

```bash
npm run dev
```

- `/artist/hagen` — "Organized Events" section shows all 5 events.
- `/artist/iorlovskyi` — same 5 events.
- `/artist/matik` — "Portfolio" grid shows 35+ cover images, no organized-events section.
- `/artist/irukanji` — musician; neither new section appears.

- [ ] **Step 5: Commit**

```bash
git add app/pages/artist/[id].vue
git commit -m "feat: designer portfolio gallery and organized events on artist page"
```

---

### Task 3: `/artists/all` page

**Files:**
- Rename: `app/pages/artists.vue` → `app/pages/artists/index.vue`
- Create: `app/pages/artists/all.vue`
- Modify: `app/pages/artists/index.vue` — add link to `/artists/all`

**Interfaces:**
- Consumes: `locationToIso2()` from `app/utils/countryFlag.ts` (Task 1)
- Consumes: `useArtists()`, `sortArtistsForCatalog()`, `toArray<T>()`

- [ ] **Step 1: Rename the existing page file**

```bash
mkdir -p app/pages/artists
mv app/pages/artists.vue app/pages/artists/index.vue
```

`/artists` URL is unchanged — Nuxt maps `pages/artists/index.vue` → `/artists`.

- [ ] **Step 2: Add link in `app/pages/artists/index.vue`**

After the `<h1>` tag, add:

```html
<div class="text-right mb-4">
  <NuxtLink
    to="/artists/all"
    class="text-sm text-white/50 hover:text-white/80 underline underline-offset-2"
  >
    View all (text list)
  </NuxtLink>
</div>
```

- [ ] **Step 3: Create `app/pages/artists/all.vue`**

```vue
<script setup lang="ts">
import type { Artist, ArtistCategory } from '~/types'
import { sortArtistsForCatalog } from '~/utils/artists'
import { locationToIso2 } from '~/utils/countryFlag'

const { data: artistsRaw } = await useArtists()
const artists = computed(() => toArray<Artist>(artistsRaw.value, 'artists'))
const sorted = computed(() => sortArtistsForCatalog(artists.value))

const sections: Array<{ label: string; category: ArtistCategory }> = [
  { label: 'Producers & Musicians', category: 'musician' },
  { label: 'DJs', category: 'dj' },
  { label: 'Sound Engineers & Mastering', category: 'mastering' },
  { label: 'Visual Artists & Designers', category: 'designer' },
]

function sectionArtists(category: ArtistCategory) {
  return sorted.value.filter(a => a.category === category)
}

const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const PageTitle = 'All Artists'
const PageDescription = 'Complete list of all Sentimony Records artists: producers, DJs, sound engineers and visual designers from around the world.'
useSeoMeta({
  title: PageTitle,
  description: PageDescription,
  ogTitle: PageTitle,
  ogDescription: PageDescription,
  ogImage: appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: PageTitle,
  twitterDescription: PageDescription,
  twitterImage: appConfig.brand.defaultOgImage,
  twitterCard: 'summary',
})
</script>

<template>
  <div class="container max-w-4xl">
    <div class="flex items-baseline gap-4 my-4 md:my-6">
      <h1 class="text-2xl md:text-4xl">{{ PageTitle }}</h1>
      <NuxtLink
        to="/artists"
        class="text-sm text-white/50 hover:text-white/80 underline underline-offset-2"
      >
        ← Card view
      </NuxtLink>
    </div>

    <template v-for="section in sections" :key="section.category">
      <template v-if="sectionArtists(section.category).length > 0">
        <h2 class="text-lg md:text-xl mt-8 mb-3 text-white/60">{{ section.label }}</h2>
        <ul class="space-y-1">
          <li
            v-for="artist in sectionArtists(section.category)"
            :key="artist.slug"
            class="flex items-center gap-3"
          >
            <span
              v-if="locationToIso2(artist.location || '')"
              :class="`fi fi-${locationToIso2(artist.location || '')} rounded-sm shrink-0`"
              :title="artist.location || ''"
            />
            <span v-else class="w-[1.33em] shrink-0" />
            <NuxtLink
              :to="'/artist/' + artist.slug"
              class="hover:text-white/80 transition-colors"
            >
              {{ artist.title }}
            </NuxtLink>
            <span
              v-if="artist.location"
              class="text-white/30 text-sm truncate hidden sm:block"
            >
              {{ artist.location }}
            </span>
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>
```

- [ ] **Step 4: Type check and unit tests**

```bash
npx nuxi typecheck
npm run test:unit
```

Expected: all pass.

- [ ] **Step 5: Manual test**

```bash
npm run dev
```

- `/artists` — renders as before, "View all (text list)" link in top-right.
- `/artists/all` — 4 category sections; flags appear for artists with known countries; artists without a location get an empty spacer keeping columns aligned; every name is a link to the artist detail page.

- [ ] **Step 6: Commit**

```bash
git add app/pages/artists/
git commit -m "feat: /artists/all text list page with country flags"
```

---

### Task 4: Artist Swiper — category dividers

**Files:**
- Modify: `app/components/Swiper.vue`
- Modify: `app/layouts/default.vue`

**Interfaces:**
- `Swiper` gains optional prop `sections?: Array<{ label: string; list: ItemEntity[] }>`. When present, takes precedence over `list`. Existing callers using `list` are unaffected.

- [ ] **Step 1: Replace the `<script setup>` block in `Swiper.vue`**

Full replacement of lines 1–55 in `app/components/Swiper.vue`:

```vue
<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/keyboard'
import 'swiper/css/mousewheel'
import { ref, watch, nextTick, computed } from 'vue'
import {
  FreeMode,
  Navigation,
  Keyboard,
  Pagination,
  Mousewheel
} from 'swiper/modules'

const modules = [FreeMode, Keyboard, Navigation, Pagination, Mousewheel]

import type { ItemCategory, ItemEntity } from '~/types'

interface ArtistSection {
  label: string
  list: ItemEntity[]
}

const props = defineProps<{
  title?: string
  category?: ItemCategory
  list?: ItemEntity[]
  sections?: ArtistSection[]
  centeredSlidesBounds?: boolean
  centerInsufficientSlides?: boolean
  activeSlug?: string | null
  pagination?: boolean
}>()

const swiperRef = ref<any | null>(null)
function onSwiper(sw: any) {
  swiperRef.value = sw
  nextTick(() => slideToActiveSlug())
}

function slideToActiveSlug() {
  if (!swiperRef.value) return
  const slug = props.activeSlug || ''
  if (!slug) return

  if (props.sections) {
    let idx = 0
    for (let si = 0; si < props.sections.length; si++) {
      if (si > 0) idx++ // one divider slide precedes each section after the first
      const found = props.sections[si].list.findIndex((it: any) => it?.slug === slug)
      if (found >= 0) {
        swiperRef.value.slideTo(idx + found, 0)
        return
      }
      idx += props.sections[si].list.length
    }
  } else {
    const list = props.list || []
    const idx = list.findIndex((it: any) => it?.slug === slug)
    if (idx >= 0) swiperRef.value.slideTo(idx, 0)
  }
}

const totalLength = computed(() =>
  props.sections
    ? props.sections.reduce((acc, s) => acc + s.list.length, 0)
    : (props.list || []).length
)

watch(() => [props.activeSlug, totalLength.value], () => {
  slideToActiveSlug()
})
</script>
```

- [ ] **Step 2: Replace slide rendering in the template**

Inside the `<Swiper>` component (after the existing `:keyboard` prop and before the nav buttons), replace the single `<SwiperSlide v-for="i in list">` block with:

```html
<template v-if="sections">
  <template v-for="(section, si) in sections" :key="section.label">
    <SwiperSlide
      v-if="si > 0"
      class="!pointer-events-none select-none"
      style="width: 2.5rem"
    >
      <div class="h-full flex flex-col items-center justify-center px-1 text-foreground/25">
        <div class="w-px flex-1 bg-current" />
        <span
          class="text-[8px] tracking-widest uppercase py-2"
          style="writing-mode: vertical-rl; transform: rotate(180deg)"
        >{{ section.label }}</span>
        <div class="w-px flex-1 bg-current" />
      </div>
    </SwiperSlide>
    <SwiperSlide
      v-for="i in section.list"
      :key="i.slug"
    >
      <Item :category="category" :i="i" />
    </SwiperSlide>
  </template>
</template>
<template v-else>
  <SwiperSlide
    v-for="i in list"
    :key="i.slug"
  >
    <Item :category="category" :i="i" />
  </SwiperSlide>
</template>
```

- [ ] **Step 3: Add `artistSections` computed to `default.vue`**

In `app/layouts/default.vue`, after the `artistsSortedByCategoryId` computed (line 59–61), add:

```ts
const artistSections = computed(() => {
  const order = [
    { label: 'Producers', category: 'musician' as const },
    { label: 'DJs',       category: 'dj' as const },
    { label: 'Mastering', category: 'mastering' as const },
    { label: 'Designers', category: 'designer' as const },
  ]
  return order
    .map(({ label, category }) => ({
      label,
      list: artistsSortedByCategoryId.value.filter(a => a.category === category),
    }))
    .filter(s => s.list.length > 0)
})
```

- [ ] **Step 4: Switch artist Swiper to use `sections` in `default.vue` template**

Replace the artist `<LazySwiper>` block (lines 120–130):

```html
<LazySwiper
  v-if="showArtists"
  :activeSlug="activeArtistSlug"
  :class="isIndex ? 'order-3' : 'order-1'"
  title="Artists"
  :sections="artistSections"
  category="artist"
  :centeredSlidesBounds="false"
  :centerInsufficientSlides="false"
  :pagination="false"
/>
```

(Remove `:list="artistsSortedByCategoryId"`, add `:sections="artistSections"`.)

- [ ] **Step 5: Type check and unit tests**

```bash
npx nuxi typecheck
npm run test:unit
```

Expected: all pass.

- [ ] **Step 6: Manual test**

```bash
npm run dev
```

- Visit any `/artist/[id]` page — Swiper shows thin vertical dividers with rotated labels ("Producers", "DJs", "Mastering", "Designers") between sections.
- Clicking a divider does nothing (pointer-events-none).
- The currently-viewed artist is centered in the Swiper on load; verify across artists from different categories (e.g., open `/artist/matik` for a designer, swiper should scroll to the Designers section).
- All other Swipers (releases, events, videos, playlists) are unaffected — they still use `list`.

- [ ] **Step 7: Commit**

```bash
git add app/components/Swiper.vue app/layouts/default.vue
git commit -m "feat: category dividers between sections in artist Swiper"
```

---

### Task 5: Genre filter pages — Psytrance & Psychill

**Files:**
- Rename: `app/pages/releases.vue` → `app/pages/releases/index.vue`
- Create: `app/components/ReleasesFiltered.vue`
- Create: `app/pages/releases/psytrance.vue`
- Create: `app/pages/releases/psychill.vue`
- Modify: `app/pages/releases/index.vue` — add genre tabs

**Interfaces:**
- `ReleasesFiltered` props: `{ keyword: string; title: string; description: string }`

**Why the rename:** `releases.vue` + `releases/` at the same level makes Vue Router treat `releases.vue` as the parent layout of genre pages (child routes render inside `<NuxtPage>`). Moving to `releases/index.vue` makes all files siblings under one directory — no nesting, same URL.

- [ ] **Step 1: Rename releases.vue**

```bash
mkdir -p app/pages/releases
mv app/pages/releases.vue app/pages/releases/index.vue
```

`/releases` URL unchanged — Nuxt maps `releases/index.vue` → `/releases`.

- [ ] **Step 2: Create `app/components/ReleasesFiltered.vue`**

```vue
<script setup lang="ts">
import type { Release } from '~/types'

const props = defineProps<{
  keyword: string
  title: string
  description: string
}>()

const { data: releasesRaw } = await useReleases()
const releases = computed(() => toArray<Release>(releasesRaw.value, 'releases'))
const filtered = computed(() =>
  [...releases.value]
    .filter(r => r.visible && r.style?.toLowerCase().includes(props.keyword.toLowerCase()))
    .sort((a, b) => new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime())
)
</script>

<template>
  <div class="container max-w-[112rem]">
    <h1 class="text-2xl md:text-4xl my-4 md:my-6">{{ title }}</h1>

    <div class="flex gap-2 mb-6">
      <NuxtLink
        to="/releases"
        class="px-3 py-1 rounded-full text-sm border border-white/20 hover:border-white/50 transition-colors"
        exact-active-class="border-white/60 text-white"
      >
        All
      </NuxtLink>
      <NuxtLink
        to="/releases/psytrance"
        class="px-3 py-1 rounded-full text-sm border border-white/20 hover:border-white/50 transition-colors"
        exact-active-class="border-white/60 text-white"
      >
        Psytrance
      </NuxtLink>
      <NuxtLink
        to="/releases/psychill"
        class="px-3 py-1 rounded-full text-sm border border-white/20 hover:border-white/50 transition-colors"
        exact-active-class="border-white/60 text-white"
      >
        Psychill
      </NuxtLink>
    </div>

    <p class="text-white/40 text-sm mb-4">{{ filtered.length }} releases</p>

    <div class="flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px]">
      <Item
        v-for="i in filtered"
        :key="i.slug"
        category="release"
        :i="i"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 3: Create `app/pages/releases/psytrance.vue`**

```vue
<script setup lang="ts">
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const PageTitle = 'Psytrance Releases'
const PageDescription = 'Dark progressive psytrance, forest psy and zenonesque releases from Sentimony Records.'
useSeoMeta({
  title: PageTitle,
  description: PageDescription,
  ogTitle: PageTitle,
  ogDescription: PageDescription,
  ogImage: appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: PageTitle,
  twitterDescription: PageDescription,
  twitterImage: appConfig.brand.defaultOgImage,
  twitterCard: 'summary',
})
</script>

<template>
  <ReleasesFiltered
    keyword="psytrance"
    title="Psytrance"
    description="Dark progressive psytrance, forest psy and zenonesque releases from Sentimony Records."
  />
</template>
```

- [ ] **Step 4: Create `app/pages/releases/psychill.vue`**

```vue
<script setup lang="ts">
const appConfig = useAppConfig()
const { absoluteUrl } = useAbsoluteUrl()
useCanonical(() => absoluteUrl.value)
const PageTitle = 'Psychill Releases'
const PageDescription = 'Psychill, psybient and ambient releases from Sentimony Records.'
useSeoMeta({
  title: PageTitle,
  description: PageDescription,
  ogTitle: PageTitle,
  ogDescription: PageDescription,
  ogImage: appConfig.brand.defaultOgImage,
  ogUrl: () => absoluteUrl.value,
  twitterTitle: PageTitle,
  twitterDescription: PageDescription,
  twitterImage: appConfig.brand.defaultOgImage,
  twitterCard: 'summary',
})
</script>

<template>
  <ReleasesFiltered
    keyword="psychill"
    title="Psychill"
    description="Psychill, psybient and ambient releases from Sentimony Records."
  />
</template>
```

- [ ] **Step 5: Add genre tabs to `app/pages/releases/index.vue`**

In the template, add tabs after `<h1>` and before the `<div class="flex flex-wrap">` items grid:

```html
<div class="flex gap-2 mb-6">
  <NuxtLink
    to="/releases"
    class="px-3 py-1 rounded-full text-sm border border-white/20 hover:border-white/50 transition-colors"
    exact-active-class="border-white/60 text-white"
  >
    All
  </NuxtLink>
  <NuxtLink
    to="/releases/psytrance"
    class="px-3 py-1 rounded-full text-sm border border-white/20 hover:border-white/50 transition-colors"
    exact-active-class="border-white/60 text-white"
  >
    Psytrance
  </NuxtLink>
  <NuxtLink
    to="/releases/psychill"
    class="px-3 py-1 rounded-full text-sm border border-white/20 hover:border-white/50 transition-colors"
    exact-active-class="border-white/60 text-white"
  >
    Psychill
  </NuxtLink>
</div>
```

- [ ] **Step 6: Type check and unit tests**

```bash
npx nuxi typecheck
npm run test:unit
```

Expected: all pass.

- [ ] **Step 7: Manual test**

```bash
npm run dev
```

- `/releases` — all releases visible, three tabs at top with "All" active.
- `/releases/psytrance` — ~40 releases filtered by "psytrance" in style; "Psytrance" tab active; count shown.
- `/releases/psychill` — ~30 releases filtered by "psychill"; "Psychill" tab active.
- Clicking tabs navigates correctly between the three pages.
- Releases with both psytrance and psychill in style (none currently) would appear on both pages.

- [ ] **Step 8: Commit**

```bash
git add app/pages/releases/ app/components/ReleasesFiltered.vue
git commit -m "feat: /releases/psytrance and /releases/psychill genre filter pages"
```
