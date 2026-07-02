# Code Review Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> **Target executor model:** claude-sonnet-4-6.

**Goal:** Fix the remaining confirmed findings from the 2026-07-02 branch code review: XSS-adjacent sanitizer regressions, hidden-release metadata leak, lost track navigation, BPM parsing bugs, like-count truncation, lost API ordering, and duplicated markup.

**Architecture:** Nine independent fixes, each self-contained. Two restore behavior deliberately or accidentally dropped in earlier "huge upd"/"hot-fix" commits (DOMPurify sanitizer, track links); the rest harden server endpoints and deduplicate UI code introduced by the catalog-features branch.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, Nitro server routes, Supabase JS, Vitest 4, isomorphic-dompurify (restored dependency).

## Global Constraints

- `npm run test:unit` must pass after every commit (baseline: 20 files / 63 tests before this plan).
- `npx nuxi typecheck` must pass; Supabase env-var warnings are expected and NOT failures.
- No `@apply` inside `<style scoped>` (Tailwind v4); no code comments unless the WHY is non-obvious.
- `$fetch` with a dynamic URL must carry an explicit generic: `$fetch<T>(url)`.
- Do NOT run `npm run sync:firebase` / `npm run sync:supabase` — they write to remote stores; the user runs them.
- Quote paths containing `[id]` in shell commands (zsh globbing): `'app/pages/release/[id].vue'`.

## User-run deployment prerequisites (NOT plan tasks)

These are required for features from the previous branch to work in production; the user executes them:
1. `npm run sync:firebase` — pushes `organizer` field to live Firebase (Organized Events section stays empty until then).
2. Apply `supabase/migrations/20260702_add_organizer_to_events.sql` via the `db query --linked --file` workaround documented in CLAUDE.md — required before the next `sync:supabase` run.

---

### Task 1: Restore DOMPurify-based sanitizeHtml

The custom regex sanitizer (introduced in commit "hot-fix") leaks inner text of disallowed tags into the DOM (`<script>document.cookie</script>` → visible `document.cookie`) and breaks on a literal `>` inside a quoted attribute value. Restore isomorphic-dompurify (it was the dependency before that commit; known to work on Netlify serverless).

**Files:**
- Modify: `app/utils/sanitizeHtml.ts` (full rewrite)
- Test: `tests/unit/sanitizeHtml.test.ts` (add 2 cases, keep existing 4)
- Modify: `package.json` (dependency via npm install)

**Interfaces:**
- Produces: `sanitizeHtml(value: unknown): string` — same signature as today; 7 existing callers (`BtnPrimary.vue`, `tracks.vue`, `playlist/[id].vue`, `video/[id].vue`, `release/[id].vue`, `event/[id].vue`, `artist/[id].vue`) need no changes.

- [ ] **Step 1: Add the failing tests**

Append to the `describe('sanitizeHtml', ...)` block in `tests/unit/sanitizeHtml.test.ts`:

```ts
  it('strips the inner content of disallowed tags', () => {
    const result = sanitizeHtml('<p>Safe</p><script>document.cookie</script>')

    expect(result).toContain('Safe')
    expect(result).not.toContain('document.cookie')
  })

  it('handles a literal > inside a quoted attribute value', () => {
    const result = sanitizeHtml('<a title="Price > 0" href="/releases">link</a>')

    expect(result).toContain('href="/releases"')
    expect(result).toContain('link')
    expect(result).not.toContain('0"&gt;')
  })
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npm run test:unit -- sanitizeHtml`
Expected: 4 pass, 2 FAIL (`document.cookie` found in output; `href="/releases"` missing).

- [ ] **Step 3: Install the dependency**

```bash
npm install isomorphic-dompurify
```

- [ ] **Step 4: Rewrite `app/utils/sanitizeHtml.ts`**

Replace the entire file with:

```ts
import DOMPurify from 'isomorphic-dompurify'

const allowedTags = [
  'a',
  'b',
  'br',
  'em',
  'i',
  'li',
  'ol',
  'p',
  'small',
  'span',
  'strong',
  'ul',
]

const allowedAttributes = [
  'class',
  'href',
  'rel',
  'target',
  'title',
]

export function sanitizeHtml(value: unknown): string {
  if (typeof value !== 'string') return ''

  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
  })
}
```

DOMPurify strips `javascript:` hrefs and event handlers by default, so the removed `isSafeHref`/`escapeAttribute` helpers need no replacement.

- [ ] **Step 5: Run the sanitizer tests**

Run: `npm run test:unit -- sanitizeHtml`
Expected: 6/6 pass. If the byte-identity test (`preserves catalog formatting tags`) fails on serialization details (e.g. attribute reordering), inspect the actual output; adjust that one assertion to `toContain` checks for each tag only if the output is semantically identical — do not weaken the other tests.

- [ ] **Step 6: Full suite + typecheck**

Run: `npm run test:unit && npx nuxi typecheck`
Expected: all tests pass; typecheck clean (Supabase env warnings OK).

- [ ] **Step 7: Commit**

```bash
git add app/utils/sanitizeHtml.ts tests/unit/sanitizeHtml.test.ts package.json package-lock.json
git commit -m "fix: restore DOMPurify sanitizer, strip disallowed tag content"
```

---

### Task 2: Restore track links in the release tracklist

Commit "huge upd" replaced `<NuxtLink :to="/track/...">` with a plain `<span>` in the release-page tracklist, making `/track/*` pages unreachable from the UI. The user confirmed the links must be restored.

**Files:**
- Modify: `app/pages/release/[id].vue` (~line 321)

**Interfaces:**
- Consumes: `track.slug` from the existing `Track` type in the same file.

- [ ] **Step 1: Replace the span with a NuxtLink**

In `app/pages/release/[id].vue`, find (currently ~lines 321–323):

```html
              <span>
                <small>{{ track.track_number < 10 ? ' ' + track.track_number : track.track_number }}.</small> <b>{{ track.artist_name }}</b> - {{ track.title }} <small v-if="track.bpm">({{ track.bpm }}bpm)</small>
              </span>
```

Replace with:

```html
              <NuxtLink
                :to="`/track/${track.slug}`"
                class="hover:underline"
              >
                <small>{{ track.track_number < 10 ? ' ' + track.track_number : track.track_number }}.</small> <b>{{ track.artist_name }}</b> - {{ track.title }} <small v-if="track.bpm">({{ track.bpm }}bpm)</small>
              </NuxtLink>
```

- [ ] **Step 2: Typecheck and manual test**

Run: `npx nuxi typecheck`
Expected: clean.

Run: `TMPDIR=/tmp npm run dev`, open any release page (e.g. `/release/irukanji-rebuild`): track titles are links, clicking navigates to `/track/<slug>`, the like button still works independently.

- [ ] **Step 3: Commit**

```bash
git add 'app/pages/release/[id].vue'
git commit -m "fix: restore track links in release tracklist"
```

---

### Task 3: Track endpoint hardening — hidden-release 404 + targeted queries

`GET /api/track/[id]` currently (a) returns track metadata with `release: null` for tracks of hidden releases instead of 404, and (b) full-scans the whole `tracks` table on every cache miss (`fetchAllSupabaseTracks` has no filter).

`fetchRelease()` in this file already returns `null` for hidden releases in BOTH modes (Supabase `.eq('visible', true)`, Firebase `isPublicEntity`), so the leak fix is a guard in the handler.

**Files:**
- Modify: `server/api/track/[id].get.ts`

**Interfaces:**
- Produces: same response shape `{ track, release, artists, releaseTracks, similarTracks, likeCount }`; consumers (`app/pages/track/[id].vue`) unchanged.

- [ ] **Step 1: Replace the Supabase full-scan helpers**

In `server/api/track/[id].get.ts`, delete the `fetchAllSupabaseTracks` function entirely and add these three targeted helpers in its place:

```ts
const TRACK_COLUMNS = 'slug, title, release_slug, artist_slug, artist_name, track_number, bpm'

async function fetchSupabaseTrackBySlug(slug: string): Promise<TrackRow | undefined> {
  const { data, error } = await supabaseAdmin()
    .from('tracks')
    .select(TRACK_COLUMNS)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? undefined) as TrackRow | undefined
}

async function fetchSupabaseTrackByPosition(releaseSlug: string, trackNumber: number): Promise<TrackRow | undefined> {
  const { data, error } = await supabaseAdmin()
    .from('tracks')
    .select(TRACK_COLUMNS)
    .eq('release_slug', releaseSlug)
    .eq('track_number', trackNumber)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return (data ?? undefined) as TrackRow | undefined
}

async function fetchTracksByArtists(artistSlugs: string[]): Promise<TrackRow[]> {
  if (!artistSlugs.length) return []

  if (isSupabaseCatalogSource()) {
    const { data } = await supabaseAdmin()
      .from('tracks')
      .select(TRACK_COLUMNS)
      .or(artistSlugs.map(slug => `artist_slug.ilike.%${slug}%`).join(','))

    return (data ?? []) as TrackRow[]
  }

  return await fetchAllFirebaseTracks() as TrackRow[]
}
```

Update the existing `fetchTracksForRelease` Supabase branch to use `TRACK_COLUMNS` in its `.select()` (same column list, now shared).

The `ilike` match can over-match on substring slugs (e.g. `ka` inside `ka-art`); the handler's exact re-filter in Step 3 removes false positives, so this is safe.

- [ ] **Step 2: Rewrite `findTrack` to use targeted lookups**

Replace the whole `findTrack` function with:

```ts
async function findTrack(id: string): Promise<TrackRow | undefined> {
  if (isSupabaseCatalogSource()) {
    const directTrack = await fetchSupabaseTrackBySlug(id)
    if (directTrack) return directTrack

    const firebaseTrack = (await fetchAllFirebaseTracks()).find(track => track.slug === id)
    if (!firebaseTrack) return undefined

    const equivalentTrack = await fetchSupabaseTrackByPosition(firebaseTrack.release_slug, firebaseTrack.track_number)
    return equivalentTrack ?? firebaseTrack as TrackRow
  }

  const firebaseTracks = await fetchAllFirebaseTracks()
  const directTrack = firebaseTracks.find(track => track.slug === id)
  if (directTrack) return directTrack

  const supabaseTrack = await fetchSupabaseTrackBySlug(id).catch(() => undefined)
  if (!supabaseTrack) return undefined

  return firebaseTracks.find(track =>
    track.release_slug === supabaseTrack.release_slug
    && track.track_number === supabaseTrack.track_number
  ) ?? supabaseTrack
}
```

(`fetchAllFirebaseTracks` stays — in Firebase mode tracks are derived from the releases collection and there is no per-slug lookup; this matches the documented architecture.)

- [ ] **Step 3: Update the handler — 404 guard + similar tracks from the targeted query**

In the handler body, replace:

```ts
    const { allTracks, track } = await findTrack(id)

    if (!track) {
      throw createError({ statusCode: 404, statusMessage: 'Track not found' })
    }
```

with:

```ts
    const track = await findTrack(id)

    if (!track) {
      throw createError({ statusCode: 404, statusMessage: 'Track not found' })
    }
```

Extend the `Promise.all` with the artist-tracks fetch and add the release guard right after it:

```ts
    const [releaseResult, artistsResult, siblingResult, likeCountResult, artistTracksResult] = await Promise.all([
      fetchRelease(track.release_slug),
      fetchArtists(artistSlugs),
      fetchTracksForRelease(track.release_slug),
      fetchLikeCount('track_likes', 'track_slug', track.slug),
      fetchTracksByArtists(artistSlugs),
    ])

    if (!releaseResult) {
      throw createError({ statusCode: 404, statusMessage: 'Track not found' })
    }
```

Replace the `similarTracks` computation (it referenced the deleted `allTracks`):

```ts
    let similarTracks: TrackRow[] = []
    if (artistSlugs.length) {
      similarTracks = (artistTracksResult as TrackRow[])
        .filter(item => item.slug !== track.slug)
        .filter(item => artistSlugs.some(slug => item.artist_slug.split(',').map(s => s.trim()).includes(slug)))
        .slice(0, 8)
    }
```

- [ ] **Step 4: Typecheck, full suite, manual test**

Run: `npx nuxi typecheck && npm run test:unit`
Expected: clean / all pass.

Manual (`TMPDIR=/tmp npm run dev`):
- Any existing track page (e.g. from a release tracklist link) renders with release, artists, similar tracks.
- A fabricated slug `/api/track/does-not-exist` returns 404.

- [ ] **Step 5: Commit**

```bash
git add 'server/api/track/[id].get.ts'
git commit -m "fix: 404 for hidden-release tracks, replace tracks full scan with targeted queries"
```

---

### Task 4: BPM parsing fixes in parseTrackParagraph

Two bugs in `server/utils/firebaseCatalog.ts` (`parseTrackParagraph`): a BPM range `(130-160bpm)` stores the upper bound (160) instead of the nominal lower bound, and a BPM marker not wrapped in `<small>` survives into the track title.

**Files:**
- Modify: `server/utils/firebaseCatalog.ts` (~lines 73–80)
- Test: `tests/unit/firebaseCatalog.test.ts`

**Interfaces:**
- Produces: unchanged `FirebaseTrack` shape; `bpm` now = lower bound of a range; `title` never contains a `(NNNbpm)` suffix.

- [ ] **Step 1: Add failing tests**

In `tests/unit/firebaseCatalog.test.ts`, inside the existing describe for `parseTrackParagraph` (match the file's existing call pattern for constructing `artistByTitle`), add:

```ts
  it('uses the lower bound of a bpm range', () => {
    const track = parseTrackParagraph(
      '<small>1.</small> <b>Artist</b> - Ranged Track <small>(130-160bpm)</small>',
      'test-release',
      0,
      new Map(),
    )

    expect(track.bpm).toBe(130)
  })

  it('strips a bpm marker not wrapped in small from the title', () => {
    const track = parseTrackParagraph(
      '<small>2.</small> <b>Artist</b> - Bare Track (140bpm)',
      'test-release',
      1,
      new Map(),
    )

    expect(track.title).toBe('Bare Track')
    expect(track.bpm).toBe(140)
  })
```

- [ ] **Step 2: Run to verify both fail**

Run: `npm run test:unit -- firebaseCatalog`
Expected: FAIL — `bpm` is 160; `title` is `'Bare Track (140bpm)'`.

- [ ] **Step 3: Fix the implementation**

In `parseTrackParagraph`, change:

```ts
  const withoutBpm = paragraph.replace(/\s*<small>\([^)]*bpm\)<\/small>.*$/i, '')
  const titleRaw = withoutBpm.replace(/^<small>\d+\.<\/small>\s*<b>.*?<\/b>\s*-\s*/, '')
  const title = titleRaw.replace(/<\/?b>/g, '').trim()

  const bpmMatch = paragraph.match(/\((\d+)(?:-(\d+))?bpm\)/i)
  const parsedBpm = bpmMatch ? Number.parseInt(bpmMatch[2] ?? bpmMatch[1]!, 10) : null
```

to:

```ts
  const withoutBpm = paragraph.replace(/\s*<small>\([^)]*bpm\)<\/small>.*$/i, '')
  const titleRaw = withoutBpm.replace(/^<small>\d+\.<\/small>\s*<b>.*?<\/b>\s*-\s*/, '')
  const title = titleRaw.replace(/<\/?b>/g, '').replace(/\s*\(\d+(?:-\d+)?bpm\)\s*$/i, '').trim()

  const bpmMatch = paragraph.match(/\((\d+)(?:-(\d+))?bpm\)/i)
  const parsedBpm = bpmMatch ? Number.parseInt(bpmMatch[1]!, 10) : null
```

- [ ] **Step 4: Run tests**

Run: `npm run test:unit -- firebaseCatalog`
Expected: all pass, including pre-existing cases. NOTE: sitemap track slugs reuse `parseTrackParagraph`; run the full suite to confirm `sitemapUrls` tests still pass (slugs are derived from `track_number`, not bpm/title, so they must not change).

- [ ] **Step 5: Commit**

```bash
git add server/utils/firebaseCatalog.ts tests/unit/firebaseCatalog.test.ts
git commit -m "fix: bpm range parses to lower bound, strip unwrapped bpm from track title"
```

---

### Task 5: likeCounts pagination past the 1000-row cap

`fetchLikeCounts` in `server/utils/likeCounts.ts` selects raw like rows; PostgREST caps responses at 1000 rows, silently truncating counts. Fix with a pagination loop extracted into a pure, testable helper.

**Files:**
- Modify: `server/utils/likeCounts.ts`
- Test: `tests/unit/likeCounts.test.ts` (new)

**Interfaces:**
- Produces: `fetchPagedRows<T>(pageSize: number, fetchPage: (from: number, to: number) => Promise<T[]>): Promise<T[]>` exported from `server/utils/likeCounts.ts`.

- [ ] **Step 1: Write the failing test**

Create `tests/unit/likeCounts.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { fetchPagedRows } from '../../server/utils/likeCounts'

describe('fetchPagedRows', () => {
  it('collects all pages until a short page', async () => {
    const source = Array.from({ length: 2500 }, (_, i) => ({ id: i }))
    const calls: [number, number][] = []

    const rows = await fetchPagedRows(1000, async (from, to) => {
      calls.push([from, to])
      return source.slice(from, to + 1)
    })

    expect(rows).toHaveLength(2500)
    expect(calls).toEqual([[0, 999], [1000, 1999], [2000, 2999]])
  })

  it('stops after one call when the first page is short', async () => {
    let calls = 0
    const rows = await fetchPagedRows(1000, async () => {
      calls++
      return [{ id: 1 }]
    })

    expect(rows).toHaveLength(1)
    expect(calls).toBe(1)
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test:unit -- likeCounts`
Expected: FAIL — `fetchPagedRows` is not exported.

- [ ] **Step 3: Implement the helper and use it**

In `server/utils/likeCounts.ts`, add the export:

```ts
export async function fetchPagedRows<T>(
  pageSize: number,
  fetchPage: (from: number, to: number) => Promise<T[]>,
): Promise<T[]> {
  const rows: T[] = []
  let from = 0

  while (true) {
    const batch = await fetchPage(from, from + pageSize - 1)
    rows.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }

  return rows
}
```

Then replace the single query inside `fetchLikeCounts`'s `try` block:

```ts
  try {
    const { data } = await supabaseAdmin()
      .from(table)
      .select(slugCol)
      .in(slugCol, uniqueSlugs)

    for (const like of (data ?? []) as Record<string, string>[]) {
```

with:

```ts
  try {
    const data = await fetchPagedRows(1000, async (from, to) => {
      const { data: page } = await supabaseAdmin()
        .from(table)
        .select(slugCol)
        .in(slugCol, uniqueSlugs)
        .order(slugCol, { ascending: true })
        .range(from, to)

      return (page ?? []) as Record<string, string>[]
    })

    for (const like of data) {
```

`.range()` pagination requires the stable `.order()` above — without it PostgREST may return overlapping or missing rows across pages.

- [ ] **Step 4: Run tests**

Run: `npm run test:unit`
Expected: all pass including the 2 new ones.

- [ ] **Step 5: Commit**

```bash
git add server/utils/likeCounts.ts tests/unit/likeCounts.test.ts
git commit -m "fix: paginate like-count rows past the PostgREST 1000-row cap"
```

---

### Task 6: Restore server-side ordering in /api/artists

The branch dropped `.order('category_id', { ascending: true })` from the Supabase path of `server/api/artists.get.ts`; Vue consumers mask it via `sortArtistsForCatalog()`, but direct API consumers see arbitrary order.

**Files:**
- Modify: `server/api/artists.get.ts` (~line 9)

- [ ] **Step 1: Re-add the order clause**

```ts
      const { data, error } = await useSupabase()
        .from('artists')
        .select('slug, title, photo_xl, visible, category, category_id')
        .eq('visible', true)
        .order('category_id', { ascending: true })
```

- [ ] **Step 2: Typecheck + suite**

Run: `npx nuxi typecheck && npm run test:unit`
Expected: clean / all pass.

- [ ] **Step 3: Commit**

```bash
git add server/api/artists.get.ts
git commit -m "fix: restore category_id ordering in artists API"
```

---

### Task 7: Extract shared GenreTabs component

The three-pill genre tab block (`All` / `Psytrance` / `Psychill`) is duplicated verbatim in `app/pages/releases/index.vue` (~lines 31–53) and `app/components/ReleasesFiltered.vue` (~lines 22–44).

**Files:**
- Create: `app/components/GenreTabs.vue`
- Modify: `app/pages/releases/index.vue`
- Modify: `app/components/ReleasesFiltered.vue`

**Interfaces:**
- Produces: `<GenreTabs />` — no props; auto-imported by filename.

- [ ] **Step 1: Create `app/components/GenreTabs.vue`**

```vue
<template>
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
</template>
```

- [ ] **Step 2: Replace both duplicated blocks**

In `app/pages/releases/index.vue` and `app/components/ReleasesFiltered.vue`, delete the whole `<div class="flex gap-2 mb-6">…</div>` tab block and put `<GenreTabs />` in its place.

- [ ] **Step 3: Typecheck + manual test**

Run: `npx nuxi typecheck`
Manual: `/releases`, `/releases/psytrance`, `/releases/psychill` — tabs render identically on all three, active pill follows the current route exactly.

- [ ] **Step 4: Commit**

```bash
git add app/components/GenreTabs.vue app/pages/releases/index.vue app/components/ReleasesFiltered.vue
git commit -m "refactor: extract shared GenreTabs component"
```

---

### Task 8: Shared groupArtistsByCategory utility

`app/layouts/default.vue` (`artistSections`) and `app/pages/artists/all.vue` (`sectionedArtists`) independently implement the same category-grouping pattern. Labels DIFFER between the two consumers (Swiper uses short labels, /artists/all uses long ones), so the shared util groups only; labels stay per-consumer.

**Files:**
- Modify: `app/utils/artists.ts`
- Modify: `app/layouts/default.vue`
- Modify: `app/pages/artists/all.vue`
- Test: `tests/unit/artistSorting.test.ts`

**Interfaces:**
- Produces: `groupArtistsByCategory(artists: Artist[]): { category: ArtistCategory; list: Artist[] }[]` exported from `app/utils/artists.ts` — ordered musician → dj → mastering → designer, empty groups removed.

- [ ] **Step 1: Add failing test**

Append to `tests/unit/artistSorting.test.ts` (reuse the file's existing Artist fixture style):

```ts
import { groupArtistsByCategory } from '../../app/utils/artists'

describe('groupArtistsByCategory', () => {
  it('groups in catalog order and drops empty categories', () => {
    const artists = [
      { slug: 'd1', title: 'D1', visible: true, category: 'designer' as const, category_id: 10 },
      { slug: 'm1', title: 'M1', visible: true, category: 'musician' as const, category_id: 1 },
      { slug: 'm2', title: 'M2', visible: true, category: 'musician' as const, category_id: 2 },
    ]

    const groups = groupArtistsByCategory(artists)

    expect(groups.map(g => g.category)).toEqual(['musician', 'designer'])
    expect(groups[0]!.list.map(a => a.slug)).toEqual(['m1', 'm2'])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test:unit -- artistSorting`
Expected: FAIL — `groupArtistsByCategory` is not exported.

- [ ] **Step 3: Implement in `app/utils/artists.ts`**

```ts
export function groupArtistsByCategory(artists: Artist[]): { category: ArtistCategory; list: Artist[] }[] {
  return artistCategoryOrder
    .map(category => ({ category, list: artists.filter(a => a.category === category) }))
    .filter(group => group.list.length > 0)
}
```

- [ ] **Step 4: Switch both consumers**

`app/layouts/default.vue` — replace the `artistSections` computed body with:

```ts
const artistSectionLabels: Record<ArtistCategory, string> = {
  musician: 'Producers',
  dj: 'DJs',
  mastering: 'Mastering',
  designer: 'Designers',
}
const artistSections = computed(() =>
  groupArtistsByCategory(artistsSortedByCategoryId.value).map(group => ({
    label: artistSectionLabels[group.category],
    list: group.list,
  }))
)
```

Add `groupArtistsByCategory` to the existing import from `~/utils/artists` and `ArtistCategory` to the type import from `~/types`.

`app/pages/artists/all.vue` — replace the `sections` array + `sectionedArtists` computed with:

```ts
const sectionLabels: Record<ArtistCategory, string> = {
  musician: 'Producers & Musicians',
  dj: 'DJs',
  mastering: 'Sound Engineers & Mastering',
  designer: 'Visual Artists & Designers',
}
const sectionedArtists = computed(() =>
  groupArtistsByCategory(sorted.value).map(group => ({
    ...group,
    label: sectionLabels[group.category],
  }))
)
```

Template: iterate `section in sectionedArtists`, render `section.label` and `section.list` (the `v-if="section.artists.length > 0"` guard becomes unnecessary — empty groups are already dropped; rename `section.artists` to `section.list`).

- [ ] **Step 5: Run tests + typecheck + manual**

Run: `npm run test:unit && npx nuxi typecheck`
Manual: `/artists/all` sections unchanged; artist Swiper on any `/artist/*` page shows the same four divided groups as before.

- [ ] **Step 6: Commit**

```bash
git add app/utils/artists.ts app/layouts/default.vue app/pages/artists/all.vue tests/unit/artistSorting.test.ts
git commit -m "refactor: shared groupArtistsByCategory utility"
```

---

### Task 9: Cosmetic cleanup

Three leftover items flagged by reviewers.

**Files:**
- Modify: `app/components/Swiper.vue`
- Modify: `app/pages/artists/index.vue`
- Modify: `.gitignore`

- [ ] **Step 1: Remove stale HTML comments from `app/components/Swiper.vue`**

Inside the `<ClientOnly>` block there are leftover comments `<!-- </div> -->` and `<!-- <div class="text-[18px] md:text-[32px] my-[.5em] mb-4">{{ title }}</div> -->` — delete both lines.

- [ ] **Step 2: Fix heading in `app/pages/artists/index.vue`**

Change `<h2 class="">Djs</h2>` to `<h2 class="">DJs</h2>` (matches "DJs" used on `/artists/all`).

- [ ] **Step 3: Deduplicate `.gitignore`**

`.gitignore` contains `/.superpowers/` twice in adjacent lines — remove one.

- [ ] **Step 4: Suite + commit**

Run: `npm run test:unit`
Expected: all pass (`artistsPage.test.ts` references `artists/index.vue` — if it asserts the literal heading text `Djs`, update the assertion to `DJs`).

```bash
git add app/components/Swiper.vue app/pages/artists/index.vue .gitignore
git commit -m "chore: remove stale comments, fix DJs heading, dedupe gitignore entry"
```
