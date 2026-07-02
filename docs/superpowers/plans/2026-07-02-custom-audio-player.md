# Custom Audio Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the SoundCloud iframe embed on `/artist/hagen` with a self-built, self-hosted `<audio>` player that plays his "Tempo Syndicate" DJ mix from Cloudflare R2, without touching the existing iframe tabs used by other artists.

**Architecture:** A pure `formatDuration()` utility formats elapsed/total time; a new `AudioMixPlayer.vue` component wraps a native `<audio>` element with custom Tailwind controls; the artist detail page gains a new gated `<Tab>` wired to three new optional `Artist` fields (`mix_audio_url`, `mix_title`, `mix_release_slug`).

**Tech Stack:** Nuxt 4 / Vue 3 `<script setup>`, native HTML5 `<audio>`, Tailwind v4, `@nuxt/icon` (lucide set), Vitest (`environment: 'node'`, no DOM/mount tooling — tests are pure-function or file-content assertions, matching this repo's existing convention, e.g. `tests/unit/likeButtons.test.ts`).

## Global Constraints

- No new npm dependencies — no audio library (Howler/wavesurfer/Plyr), no `@vue/test-utils`/jsdom. Matches the spec's "no new dependency" decision and the repo's existing `environment: 'node'` Vitest setup (`vitest.config.ts`).
- `font-mono` must be applied to elapsed/duration time text (project convention for technical/time data, `CLAUDE.md`).
- Do not modify the existing YouTube/SoundCloud `<Tab>` blocks in `app/pages/artist/[id].vue` — three other artists still have `soundcloud_track_id` populated and rely on that iframe.
- Do not run `npm run sync:firebase` / `npm run sync:supabase` as part of this plan — both are explicitly opt-in per `CLAUDE.md`. This plan only edits the local `sentimony-db-export.json`.
- No Supabase `artists` table migration in this pass — `CATALOG_SOURCE` defaults to `firebase` (`nuxt.config.ts:9`), which is schemaless. A Supabase migration for the new fields is an explicit follow-up, out of scope here.
- Code comments: English only, and only where the WHY isn't obvious (project convention) — none of the code below needs one.

---

## Prerequisite (manual — not part of automated task execution)

The Cloudflare R2 bucket, custom domain, and the actual mix audio file must exist before Task 4 can safely go live. This requires Cloudflare account access an agent doesn't have, so it is **not** one of the numbered tasks below. Tasks 1–3 don't depend on it and are fully testable without it.

1. In the Cloudflare dashboard, create an R2 bucket (e.g. `sentimony-audio`).
2. Enable public access on the bucket and connect a custom domain (e.g. `audio.sentimony.com`).
3. Upload the mix file as `mixes/hagen-tempo-syndicate.mp3` (or `.m4a`).
4. Verify Range support: `curl -I -H "Range: bytes=0-1" https://audio.sentimony.com/mixes/hagen-tempo-syndicate.mp3` should return `HTTP/1.1 206 Partial Content` with an `Accept-Ranges: bytes` header (R2 supports this by default).

Task 4 assumes the file ends up live at exactly `https://audio.sentimony.com/mixes/hagen-tempo-syndicate.mp3`. If the bucket/domain naming ends up different, update `mix_audio_url` in Task 4's JSON edit to match before merging.

---

### Task 1: `formatDuration` utility

**Files:**
- Create: `app/utils/formatDuration.ts`
- Test: `tests/unit/formatDuration.test.ts`

**Interfaces:**
- Produces: `formatDuration(totalSeconds: number): string` — returns `"m:ss"` under an hour, `"h:mm:ss"` at/above an hour; non-finite or negative input returns `"0:00"`. Consumed by Task 2 (`AudioMixPlayer.vue`).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/formatDuration.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { formatDuration } from '../../app/utils/formatDuration'

describe('formatDuration', () => {
  it('formats zero seconds', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('pads seconds under 10', () => {
    expect(formatDuration(5)).toBe('0:05')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(65)).toBe('1:05')
  })

  it('formats exactly one hour', () => {
    expect(formatDuration(3600)).toBe('1:00:00')
  })

  it('formats the Tempo Syndicate mix total time (1:19:40)', () => {
    expect(formatDuration(4780)).toBe('1:19:40')
  })

  it('treats NaN as zero', () => {
    expect(formatDuration(NaN)).toBe('0:00')
  })

  it('treats negative input as zero', () => {
    expect(formatDuration(-5)).toBe('0:00')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/formatDuration.test.ts`
Expected: FAIL — `Cannot find module '../../app/utils/formatDuration'`

- [ ] **Step 3: Write minimal implementation**

Create `app/utils/formatDuration.ts`:

```ts
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '0:00'

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)
  const paddedSeconds = String(seconds).padStart(2, '0')

  if (hours > 0) {
    const paddedMinutes = String(minutes).padStart(2, '0')
    return `${hours}:${paddedMinutes}:${paddedSeconds}`
  }

  return `${minutes}:${paddedSeconds}`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/formatDuration.test.ts`
Expected: PASS — 7 tests passed

- [ ] **Step 5: Commit**

```bash
git add app/utils/formatDuration.ts tests/unit/formatDuration.test.ts
git commit -m "feat: add formatDuration utility for audio player time display"
```

---

### Task 2: `AudioMixPlayer.vue` component

**Files:**
- Create: `app/components/AudioMixPlayer.vue`
- Test: `tests/unit/audioMixPlayer.test.ts`

**Interfaces:**
- Consumes: `formatDuration(totalSeconds: number): string` from Task 1 (auto-imported inside the `.vue` file — matches the `app/utils` auto-import convention already used by `sanitizeHtml`/`toArray` elsewhere in this repo, no explicit import statement needed).
- Consumes: `CompactParagraph` type (`{ p: string }`) from `~/types` (already defined, used by `Release.tracklistCompact`).
- Produces: component `AudioMixPlayer` with props `{ src: string, title?: string, tracklist?: CompactParagraph[] }`, auto-imported by filename (flat `app/components/*.vue` convention). Consumed by Task 3 (`app/pages/artist/[id].vue`).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/audioMixPlayer.test.ts`. This repo's Vitest config runs with `environment: 'node'` and has no `@vue/test-utils`/jsdom, so component tests here follow the existing `tests/unit/likeButtons.test.ts` pattern: read the component source and assert on its content, rather than mounting it:

```ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const projectFile = (path: string) => fileURLToPath(new URL(`../../${path}`, import.meta.url))
const readProjectFile = (path: string) => readFileSync(projectFile(path), 'utf8')

describe('AudioMixPlayer.vue', () => {
  const component = readProjectFile('app/components/AudioMixPlayer.vue')

  it('defines src, title, and tracklist props', () => {
    expect(component).toContain('src: string')
    expect(component).toContain('title?: string')
    expect(component).toContain('tracklist?: CompactParagraph[]')
  })

  it('renders a native audio element bound to src', () => {
    expect(component).toContain('<audio')
    expect(component).toContain(':src="src"')
  })

  it('toggles lucide play/pause icons off playing state', () => {
    expect(component).toContain('lucide:play')
    expect(component).toContain('lucide:pause')
  })

  it('formats elapsed and total time with formatDuration', () => {
    expect(component).toContain('formatDuration(currentTime)')
    expect(component).toContain('formatDuration(duration)')
  })

  it('applies font-mono to the time display', () => {
    expect(component).toContain('font-mono')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/audioMixPlayer.test.ts`
Expected: FAIL — `ENOENT: no such file or directory, open '.../app/components/AudioMixPlayer.vue'`

- [ ] **Step 3: Write minimal implementation**

Create `app/components/AudioMixPlayer.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { CompactParagraph } from '~/types'

const props = defineProps<{
  src: string
  title?: string
  tracklist?: CompactParagraph[]
}>()

const audioEl = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)

function togglePlay() {
  if (!audioEl.value) return
  if (audioEl.value.paused) audioEl.value.play()
  else audioEl.value.pause()
}

function onTimeUpdate() {
  if (audioEl.value) currentTime.value = audioEl.value.currentTime
}

function onLoadedMetadata() {
  if (audioEl.value) duration.value = audioEl.value.duration
}

function onSeek(event: Event) {
  const target = event.target as HTMLInputElement
  const seconds = Number(target.value)
  if (audioEl.value) audioEl.value.currentTime = seconds
  currentTime.value = seconds
}

function onVolumeChange(event: Event) {
  const target = event.target as HTMLInputElement
  volume.value = Number(target.value)
  if (audioEl.value) audioEl.value.volume = volume.value
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <audio
      ref="audioEl"
      :src="src"
      class="hidden"
      preload="metadata"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
    />

    <div class="flex items-center gap-3">
      <button
        type="button"
        class="flex items-center justify-center w-10 h-10 shrink-0 rounded-full border border-white/20 hover:bg-white/10 transition-colors duration-200"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
        @click="togglePlay"
        v-wave
      >
        <Icon :name="isPlaying ? 'lucide:pause' : 'lucide:play'" size="18" />
      </button>

      <span v-if="title" class="text-sm">{{ title }}</span>
    </div>

    <div class="flex items-center gap-2">
      <span class="font-mono text-xs w-10 text-right">{{ formatDuration(currentTime) }}</span>
      <input
        type="range"
        class="flex-1"
        min="0"
        :max="duration || 0"
        step="1"
        :value="currentTime"
        @input="onSeek"
      >
      <span class="font-mono text-xs w-10">{{ formatDuration(duration) }}</span>
    </div>

    <div class="flex items-center gap-2">
      <Icon name="lucide:volume-2" size="16" />
      <input
        type="range"
        class="w-24"
        min="0"
        max="1"
        step="0.05"
        :value="volume"
        @input="onVolumeChange"
      >
    </div>

    <div v-if="tracklist?.length" class="flex flex-col gap-1 mt-2">
      <p
        v-for="(track, index) in tracklist"
        :key="index"
        class="text-xs"
        v-html="sanitizeHtml(track.p)"
      />
    </div>
  </div>
</template>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/audioMixPlayer.test.ts`
Expected: PASS — 5 tests passed

- [ ] **Step 5: Typecheck**

Run: `npx nuxi typecheck`
Expected: no new errors attributable to `AudioMixPlayer.vue` (pre-existing Supabase env warnings are expected per `CLAUDE.md` and unrelated to this change)

- [ ] **Step 6: Commit**

```bash
git add app/components/AudioMixPlayer.vue tests/unit/audioMixPlayer.test.ts
git commit -m "feat: add AudioMixPlayer component with native audio controls"
```

---

### Task 3: Extend `Artist` type and wire the Mix tab into the artist page

**Files:**
- Modify: `app/types/index.ts:63-87` (the `Artist` interface)
- Modify: `app/pages/artist/[id].vue:26` (script — add `mixRelease` computed) and `app/pages/artist/[id].vue:179-197` (template — add the `<Tab>`)
- Test: `tests/unit/audioMixPlayer.test.ts` (extend from Task 2 with page-wiring assertions)

**Interfaces:**
- Consumes: `AudioMixPlayer` component from Task 2 (props `src`, `title`, `tracklist`).
- Consumes: `Release.tracklistCompact` (existing, `CompactParagraph[]`).
- Produces: `Artist.mix_audio_url?: string`, `Artist.mix_title?: string`, `Artist.mix_release_slug?: string` — consumed by Task 4 (data population).

- [ ] **Step 1: Write the failing test**

Append a new `describe` block to the end of `tests/unit/audioMixPlayer.test.ts`:

```ts
describe('artist page mix tab', () => {
  const page = readProjectFile('app/pages/artist/[id].vue')

  it('gates the Mix tab on mix_audio_url', () => {
    expect(page).toContain('v-if="item.mix_audio_url"')
  })

  it('renders AudioMixPlayer with the mix title and release tracklist', () => {
    expect(page).toContain('<AudioMixPlayer')
    expect(page).toContain("item.mix_audio_url || ''")
    expect(page).toContain(':title="item.mix_title"')
    expect(page).toContain('mixRelease?.tracklistCompact')
  })

  it('looks up mixRelease by mix_release_slug without touching the iframe tabs', () => {
    expect(page).toContain('mix_release_slug')
    expect(page).toContain('v-if="item.youtube_playlist_id"')
    expect(page).toContain('v-if="item.soundcloud_track_id"')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/audioMixPlayer.test.ts`
Expected: FAIL — the 3 new assertions in `artist page mix tab` fail (strings not found yet)

- [ ] **Step 3: Extend the `Artist` interface**

In `app/types/index.ts`, add three fields to `Artist` (after `soundcloud_track_id?: string`):

```ts
export interface Artist extends BaseEntity {
  photo_og?: string
  photo_th?: string
  photo_xl?: string
  name?: string
  location?: string
  style?: string
  information?: string
  info_sc?: string
  category?: ArtistCategory
  category_id?: number
  bandcamp_url?: string
  soundcloud_url?: string
  spotify?: string
  apple_music?: string
  youtubemusic_url?: string
  youtube_url?: string
  facebook?: string
  instagram?: string
  discogs?: string
  wikipedia_url?: string
  youtube_playlist_id?: string
  soundcloud_track_id?: string
  mix_audio_url?: string
  mix_title?: string
  mix_release_slug?: string
  like_count?: number
}
```

- [ ] **Step 4: Add the `mixRelease` computed**

In `app/pages/artist/[id].vue`, right after the existing `releasesSortedByDate` computed:

```ts
const releasesSortedByDate = computed(() => visibleByDate(releases.value))

const mixRelease = computed(() =>
  releasesSortedByDate.value.find(r => r.slug === item.value?.mix_release_slug)
)
```

- [ ] **Step 5: Add the Mix tab**

In `app/pages/artist/[id].vue`, inside the existing `<Tabs>` block, add the new `<Tab>` immediately after `<Tabs>` opens and before the YouTube `<Tab>`:

```vue
            <Tabs>

              <Tab
                v-if="item.mix_audio_url"
                icon="lucide:music"
                title="Mix"
              >
                <AudioMixPlayer
                  :src="item.mix_audio_url || ''"
                  :title="item.mix_title"
                  :tracklist="mixRelease?.tracklistCompact"
                />
              </Tab>

              <Tab
                v-if="item.youtube_playlist_id"
                icon="simple-icons:youtube"
                title="YouTube"
              >
```

Leave the rest of the `<Tabs>` block (YouTube and SoundCloud tabs) exactly as-is — do not reorder or modify them.

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/unit/audioMixPlayer.test.ts`
Expected: PASS — all 8 tests passed (5 from Task 2 + 3 new)

- [ ] **Step 7: Run the full unit suite and typecheck**

Run: `npm run test:unit`
Expected: all test files pass

Run: `npx nuxi typecheck`
Expected: no new errors (pre-existing Supabase env warnings only)

- [ ] **Step 8: Commit**

```bash
git add app/types/index.ts "app/pages/artist/[id].vue" tests/unit/audioMixPlayer.test.ts
git commit -m "feat: wire AudioMixPlayer into artist page behind mix_audio_url"
```

---

### Task 4: Populate Hagen's mix data (requires the Prerequisite step to be complete)

**Files:**
- Modify: `server/data/server/sentimony-db-export.json` (the `artists.hagen` entry, currently lines 927-957)

**Interfaces:**
- Consumes: `Artist.mix_audio_url`/`mix_title`/`mix_release_slug` from Task 3.
- Consumes: the live R2 URL from the Prerequisite step.

- [ ] **Step 1: Confirm the file is live before editing data**

Run: `curl -I https://audio.sentimony.com/mixes/hagen-tempo-syndicate.mp3`
Expected: `HTTP/2 200` (or `206` for a ranged request) with a `content-type` matching the uploaded audio format

If this doesn't return 200/206, stop here — do not proceed to Step 2 until the Prerequisite section (R2 bucket + upload) is actually done. Populating `mix_audio_url` before the file exists ships a broken player to `/artist/hagen`.

- [ ] **Step 2: Edit the hagen entry**

In `server/data/server/sentimony-db-export.json`, add the three fields to the `hagen` object (after `"soundcloud_track_id": ""`):

```json
    "hagen": {
      "title": "Hagen",
      "slug": "hagen",
      "visible": true,
      "category": "dj",
      "category_id": "029",
      "name": "",
      "location": "Kyiv, Ukraine",
      "style": "Psychill, Psybient",
      "photo_xl": "https://content.sentimony.com/assets/img/artists/hagen-01_xl.jpg",
      "information": "",
      "info_sc": "",
      "soundcloud_url": "",
      "soundcloud_label_playlist_id": "",
      "soundcloud_artist_playlist_id": "",
      "mixcloud": "",
      "youtube_artist_playlist_id": "",
      "youtube_playlist_id": "",
      "spotify": "",
      "apple_music": "",
      "discogs": "",
      "facebook": "",
      "facebook_personal": "",
      "instagram": "",
      "instagram_personal": "",
      "bandcamp_url": "",
      "youtube_url": "",
      "youtubemusic_url": "",
      "website": "",
      "wikipedia_url": "",
      "mix_audio_url": "https://audio.sentimony.com/mixes/hagen-tempo-syndicate.mp3",
      "mix_title": "Tempo Syndicate DJ Mix",
      "mix_release_slug": "va-tempo-syndicate"
    },
```

- [ ] **Step 3: Validate the JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('server/data/server/sentimony-db-export.json', 'utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 4: Run the full verification suite**

Run: `npm run test:unit`
Expected: all tests pass

Run: `npx nuxi typecheck`
Expected: no new errors

- [ ] **Step 5: Manual check in dev**

Run: `npm run dev`, open `http://localhost:3000/artist/hagen`, confirm:
- a "Mix" tab appears and is selected by default
- play starts audio playback
- the seek bar moves during playback and can be dragged to jump position
- dragging the seek bar near the end of the ~80-minute file loads and plays without buffering the whole file first (confirms Range requests work against R2, not just the initial chunk)
- elapsed/duration show as `mm:ss` (or `h:mm:ss`) in monospace
- the Tempo Syndicate tracklist renders below the controls
- open an artist with `soundcloud_track_id` populated (e.g. check `server/data/server/sentimony-db-export.json` for one of the 3 artists that still has it) and confirm the SoundCloud iframe tab still renders correctly — no regression

- [ ] **Step 6: Commit**

```bash
git add server/data/server/sentimony-db-export.json
git commit -m "feat: point hagen's artist page at the Tempo Syndicate mix on R2"
```

**Note:** this commit only updates the local export. It does not reach production until `npm run sync:firebase` is run — per `CLAUDE.md`, that script writes to the remote Firebase DB and must only be run when explicitly requested, not automatically as part of this plan.
