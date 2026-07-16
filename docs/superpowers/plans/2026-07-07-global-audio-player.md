# Global Audio Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Playback survives navigation: one global `<audio>` in `app.vue` driven by a `useAudioPlayer()` composable, with a persistent mini player as a second header row; `AudioMixPlayer` and `AudioTrackPlaylist` become thin controllers over the shared state.

**Architecture:** Global state via Nuxt `useState` in `app/composables/useAudioPlayer.ts`; the only `<audio>` element lives in `app/components/AudioBridge.vue` mounted once in `app/app.vue`. `HeaderMiniPlayer.vue` renders inside the sticky header when something is loaded. Pure queue math lives in `app/utils/audioQueue.ts`.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, Tailwind v4 classes inline, `@nuxt/icon` (lucide), vue-sonner toasts, Vitest (node env, source-string assertion style used across `tests/unit/*`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-07-07-global-audio-player-design.md`
- No new dependencies (no Pinia).
- Comments in code: English only; avoid comments — self-documenting names.
- No `@apply` in `<style scoped>`; styles go in `class=""`.
- Icons: `<Icon name="lucide:…" />`; `font-mono` for durations; buttons get `v-wave`.
- `$fetch` calls with dynamic URLs must pass an explicit generic (`$fetch<T>`).
- Unit tests live in `tests/unit/*.test.ts`, node environment, no Vue mounting — pure functions tested directly, components asserted via source strings (see `tests/unit/audioTrackPlaylist.test.ts`).
- Verification baseline: `npm run test:unit` currently 27 files / 107 tests; `npx nuxi typecheck` passes (Supabase env warnings are expected locally).
- Branch: work stays on current branch `hot-fix`; commit per task.

---

### Task 1: Pure queue helpers (`audioQueue.ts`)

**Files:**
- Create: `app/utils/audioQueue.ts`
- Test: `tests/unit/audioQueue.test.ts`

**Interfaces:**
- Produces: `QueueItem` type `{ src: string; title: string; link?: string }`; `nextQueueIndex(length: number, index: number): number | null`; `prevQueueIndex(index: number): number | null`. Later tasks import `QueueItem` from `~/utils/audioQueue`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/audioQueue.test.ts
import { describe, expect, it } from 'vitest'
import { nextQueueIndex, prevQueueIndex } from '../../app/utils/audioQueue'

describe('audioQueue', () => {
  it('advances within bounds', () => {
    expect(nextQueueIndex(3, 0)).toBe(1)
    expect(nextQueueIndex(3, 1)).toBe(2)
  })

  it('returns null past the last track', () => {
    expect(nextQueueIndex(3, 2)).toBeNull()
    expect(nextQueueIndex(0, 0)).toBeNull()
  })

  it('goes back within bounds and stops at the first track', () => {
    expect(prevQueueIndex(2)).toBe(1)
    expect(prevQueueIndex(0)).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/audioQueue.test.ts`
Expected: FAIL (cannot resolve `app/utils/audioQueue`)

- [ ] **Step 3: Write minimal implementation**

```ts
// app/utils/audioQueue.ts
export interface QueueItem {
  src: string
  title: string
  link?: string
}

export function nextQueueIndex(length: number, index: number): number | null {
  const next = index + 1
  return next < length ? next : null
}

export function prevQueueIndex(index: number): number | null {
  return index > 0 ? index - 1 : null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/audioQueue.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add app/utils/audioQueue.ts tests/unit/audioQueue.test.ts
git commit -m "feat: add pure audio queue index helpers"
```

### Task 2: `useAudioPlayer` composable

**Files:**
- Create: `app/composables/useAudioPlayer.ts`
- Test: `tests/unit/useAudioPlayer.test.ts`

**Interfaces:**
- Consumes: `QueueItem`, `nextQueueIndex`, `prevQueueIndex` from `~/utils/audioQueue` (Task 1).
- Produces (used by Tasks 3–6):

```ts
interface PlayerItem {
  src: string
  title: string
  link?: string
  kind: 'mix' | 'track'
  queue?: QueueItem[]
  queueIndex?: number
}
function useAudioPlayer(): {
  current: Ref<PlayerItem | null>
  isPlaying: Ref<boolean>
  currentTime: Ref<number>
  duration: Ref<number>
  volume: Ref<number>
  seekTo: Ref<number | null>
  play: (item: PlayerItem) => void
  toggle: () => void
  seek: (seconds: number) => void
  setVolume: (v: number) => void
  close: () => void
  next: () => void
  prev: () => void
  isCurrent: (src: string) => boolean
}
```

State-change contract with `AudioBridge` (Task 3): the composable only mutates refs; the bridge watches them. `play()` sets `current` (and resets `currentTime`/`duration` to 0). `toggle()` flips `isPlaying` (bridge plays/pauses the element to match). `seek()` sets `seekTo`; bridge applies it to the element and resets `seekTo` to `null`. `next()`/`prev()` move `queueIndex` and swap `current.src/title/link` from the queue; no-op when there is no move. `close()` sets `current = null`, `isPlaying = false`.

- [ ] **Step 1: Write the failing test**

Node env cannot run Nuxt's `useState`, so follow the repo's source-assertion style:

```ts
// tests/unit/useAudioPlayer.test.ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  fileURLToPath(new URL('../../app/composables/useAudioPlayer.ts', import.meta.url)),
  'utf8'
)

describe('useAudioPlayer', () => {
  it('stores global state via useState keys', () => {
    expect(source).toContain("useState<PlayerItem | null>('audio-player-current'")
    expect(source).toContain("useState<boolean>('audio-player-playing'")
    expect(source).toContain("useState<number | null>('audio-player-seek'")
  })

  it('exposes the full controller API', () => {
    for (const name of ['function play', 'function toggle', 'function seek', 'function setVolume', 'function close', 'function next', 'function prev', 'function isCurrent']) {
      expect(source).toContain(name)
    }
  })

  it('uses pure queue helpers for next/prev', () => {
    expect(source).toContain('nextQueueIndex(')
    expect(source).toContain('prevQueueIndex(')
  })

  it('supports mix and track kinds with an optional queue', () => {
    expect(source).toContain("kind: 'mix' | 'track'")
    expect(source).toContain('queue?: QueueItem[]')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/useAudioPlayer.test.ts`
Expected: FAIL (file not found)

- [ ] **Step 3: Write the implementation**

```ts
// app/composables/useAudioPlayer.ts
import type { QueueItem } from '~/utils/audioQueue'
import { nextQueueIndex, prevQueueIndex } from '~/utils/audioQueue'

export interface PlayerItem {
  src: string
  title: string
  link?: string
  kind: 'mix' | 'track'
  queue?: QueueItem[]
  queueIndex?: number
}

export function useAudioPlayer() {
  const current = useState<PlayerItem | null>('audio-player-current', () => null)
  const isPlaying = useState<boolean>('audio-player-playing', () => false)
  const currentTime = useState<number>('audio-player-time', () => 0)
  const duration = useState<number>('audio-player-duration', () => 0)
  const volume = useState<number>('audio-player-volume', () => 1)
  const seekTo = useState<number | null>('audio-player-seek', () => null)

  function play(item: PlayerItem) {
    currentTime.value = 0
    duration.value = 0
    current.value = item
    isPlaying.value = true
  }

  function toggle() {
    if (!current.value) return
    isPlaying.value = !isPlaying.value
  }

  function seek(seconds: number) {
    seekTo.value = seconds
    currentTime.value = seconds
  }

  function setVolume(v: number) {
    volume.value = Math.min(1, Math.max(0, v))
  }

  function close() {
    isPlaying.value = false
    current.value = null
    currentTime.value = 0
    duration.value = 0
  }

  function moveTo(index: number | null) {
    const item = current.value
    if (index === null || !item?.queue) return
    const entry = item.queue[index]
    if (!entry) return
    play({ ...item, src: entry.src, title: entry.title, link: entry.link, queueIndex: index })
  }

  function next() {
    const item = current.value
    if (!item?.queue) return
    moveTo(nextQueueIndex(item.queue.length, item.queueIndex ?? 0))
  }

  function prev() {
    const item = current.value
    if (!item?.queue) return
    moveTo(prevQueueIndex(item.queueIndex ?? 0))
  }

  function isCurrent(src: string) {
    return current.value?.src === src
  }

  return { current, isPlaying, currentTime, duration, volume, seekTo, play, toggle, seek, setVolume, close, next, prev, isCurrent }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/useAudioPlayer.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add app/composables/useAudioPlayer.ts tests/unit/useAudioPlayer.test.ts
git commit -m "feat: add global useAudioPlayer composable"
```

### Task 3: `AudioBridge.vue` + mount in `app.vue`

**Files:**
- Create: `app/components/AudioBridge.vue`
- Modify: `app/app.vue` (add `<AudioBridge />` next to `<Toaster>`)
- Test: `tests/unit/audioBridge.test.ts`

**Interfaces:**
- Consumes: `useAudioPlayer()` (Task 2).
- Produces: the only `<audio>` element in the app; volume persisted in `localStorage['player-volume']`; Media Session metadata + handlers; `toast.error` on load failure.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/audioBridge.test.ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (p: string) => readFileSync(fileURLToPath(new URL(`../../${p}`, import.meta.url)), 'utf8')

describe('AudioBridge.vue', () => {
  const component = read('app/components/AudioBridge.vue')

  it('owns the single hidden audio element', () => {
    expect(component).toContain('<audio')
    expect(component).toContain('ref="audioEl"')
  })

  it('auto-advances the queue on ended', () => {
    expect(component).toContain('@ended="onEnded"')
    expect(component).toContain('next()')
  })

  it('persists volume and updates media session', () => {
    expect(component).toContain("localStorage.getItem('player-volume')")
    expect(component).toContain('navigator.mediaSession')
  })

  it('reports playback errors via toast', () => {
    expect(component).toContain('toast.error')
  })

  it('is mounted once in app.vue', () => {
    expect(read('app/app.vue')).toContain('<AudioBridge />')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/audioBridge.test.ts`
Expected: FAIL (file not found)

- [ ] **Step 3: Write the component**

```vue
<!-- app/components/AudioBridge.vue -->
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const audioEl = ref<HTMLAudioElement | null>(null)
const { current, isPlaying, currentTime, duration, volume, seekTo, toggle, seek, next, prev, close } = useAudioPlayer()

onMounted(() => {
  const saved = Number(localStorage.getItem('player-volume'))
  if (Number.isFinite(saved) && saved >= 0 && saved <= 1 && localStorage.getItem('player-volume') !== null) {
    volume.value = saved
  }
})

watch(() => current.value?.src, (src) => {
  const el = audioEl.value
  if (!el) return
  if (!src) {
    el.pause()
    el.removeAttribute('src')
    return
  }
  el.src = src
  el.volume = volume.value
  el.play().catch(() => { isPlaying.value = false })
  updateMediaSession()
})

watch(isPlaying, (playing) => {
  const el = audioEl.value
  if (!el || !current.value) return
  if (playing && el.paused) el.play().catch(() => { isPlaying.value = false })
  if (!playing && !el.paused) el.pause()
})

watch(seekTo, (seconds) => {
  if (seconds === null || !audioEl.value) return
  audioEl.value.currentTime = seconds
  seekTo.value = null
})

watch(volume, (v) => {
  if (audioEl.value) audioEl.value.volume = v
  localStorage.setItem('player-volume', String(v))
})

function onTimeUpdate() {
  if (audioEl.value) currentTime.value = audioEl.value.currentTime
}

function onLoadedMetadata() {
  if (audioEl.value) duration.value = audioEl.value.duration
}

function onEnded() {
  const item = current.value
  if (item?.queue) next()
  else isPlaying.value = false
}

function onError() {
  if (!current.value) return
  isPlaying.value = false
  toast.error('Audio failed to load')
}

function updateMediaSession() {
  if (!('mediaSession' in navigator) || !current.value) return
  navigator.mediaSession.metadata = new MediaMetadata({ title: current.value.title, artist: 'Sentimony Records' })
  navigator.mediaSession.setActionHandler('play', () => { if (!isPlaying.value) toggle() })
  navigator.mediaSession.setActionHandler('pause', () => { if (isPlaying.value) toggle() })
  navigator.mediaSession.setActionHandler('seekto', (d) => { if (d.seekTime !== undefined) seek(d.seekTime) })
  navigator.mediaSession.setActionHandler('nexttrack', current.value.queue ? () => next() : null)
  navigator.mediaSession.setActionHandler('previoustrack', current.value.queue ? () => prev() : null)
  navigator.mediaSession.setActionHandler('stop', () => close())
}
</script>

<template>
  <audio
    ref="audioEl"
    class="hidden"
    preload="metadata"
    @play="isPlaying = true"
    @pause="isPlaying = false"
    @timeupdate="onTimeUpdate"
    @loadedmetadata="onLoadedMetadata"
    @ended="onEnded"
    @error="onError"
  />
</template>
```

Modify `app/app.vue` template:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toaster position="top-center" />
  <AudioBridge />
</template>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/audioBridge.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add app/components/AudioBridge.vue app/app.vue tests/unit/audioBridge.test.ts
git commit -m "feat: add AudioBridge global audio element"
```

### Task 4: `HeaderMiniPlayer.vue` + mount in `Header.vue`

**Files:**
- Create: `app/components/HeaderMiniPlayer.vue`
- Modify: `app/components/Header.vue` (add `<HeaderMiniPlayer />` as second row)
- Test: `tests/unit/headerMiniPlayer.test.ts`

**Interfaces:**
- Consumes: `useAudioPlayer()` (Task 2), `formatDuration()` (auto-imported from `app/utils/formatDuration.ts`).
- Produces: second header row visible when `current !== null`.

Layout (single row, right-aligned controls under socials on desktop): `[▶/⏸] title-link · seek · mm:ss/mm:ss · volume (hidden < sm) · [✕]`. Title is a `NuxtLink` to `current.link` when set, plain span otherwise. Styling mirrors the header: top border `border-black/10 dark:border-white/10`, buttons `hover:bg-white/30 rounded-md` with `v-wave`, range inputs reuse the accent used in `AudioTrackPlaylist` (`accent-[#144B15] dark:accent-[#4e8b52]`), timings in `font-mono text-xs`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/headerMiniPlayer.test.ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (p: string) => readFileSync(fileURLToPath(new URL(`../../${p}`, import.meta.url)), 'utf8')

describe('HeaderMiniPlayer.vue', () => {
  const component = read('app/components/HeaderMiniPlayer.vue')

  it('renders only while something is loaded', () => {
    expect(component).toContain('v-if="current"')
  })

  it('has play/pause, seek, volume and close controls', () => {
    expect(component).toContain('lucide:pause')
    expect(component).toContain('lucide:play')
    expect(component).toContain('@input="onSeek"')
    expect(component).toContain('@input="onVolumeChange"')
    expect(component).toContain('lucide:x')
  })

  it('shows font-mono timings and links the title to its source page', () => {
    expect(component).toContain('font-mono')
    expect(component).toContain('formatDuration(')
    expect(component).toContain('current.link')
  })

  it('is mounted inside the header', () => {
    expect(read('app/components/Header.vue')).toContain('<HeaderMiniPlayer />')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/headerMiniPlayer.test.ts`
Expected: FAIL (file not found)

- [ ] **Step 3: Write the component**

```vue
<!-- app/components/HeaderMiniPlayer.vue -->
<script setup lang="ts">
const { current, isPlaying, currentTime, duration, volume, toggle, seek, setVolume, close } = useAudioPlayer()

function onSeek(event: Event) {
  seek(Number((event.target as HTMLInputElement).value))
}

function onVolumeChange(event: Event) {
  setVolume(Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <div
    v-if="current"
    data-testid="header-mini-player"
    class="border-t border-black/10 dark:border-white/10"
  >
    <div class="container max-w-7xl">
      <div class="flex items-center justify-end gap-2 h-10 px-2">
        <button
          type="button"
          class="flex items-center justify-center size-8 shrink-0 rounded-md hover:bg-white/30 transition-[background-color] ease-in-out duration-300"
          :aria-label="isPlaying ? 'Pause' : 'Play'"
          @click="toggle"
          v-wave
        >
          <Icon :name="isPlaying ? 'lucide:pause' : 'lucide:play'" size="16" />
        </button>

        <NuxtLink
          v-if="current.link"
          :to="current.link"
          class="text-xs truncate max-w-40 sm:max-w-56 hover:underline"
        >
          {{ current.title }}
        </NuxtLink>
        <span v-else class="text-xs truncate max-w-40 sm:max-w-56">{{ current.title }}</span>

        <input
          type="range"
          class="w-24 sm:w-40 lg:w-56 accent-[#144B15] dark:accent-[#4e8b52]"
          min="0"
          :max="duration || 0"
          step="1"
          :value="currentTime"
          aria-label="Seek"
          @input="onSeek"
        >
        <span class="font-mono text-xs whitespace-nowrap">{{ formatDuration(currentTime) }}/{{ formatDuration(duration) }}</span>

        <div class="hidden sm:flex items-center gap-1.5">
          <Icon name="lucide:volume-2" size="14" />
          <input
            type="range"
            class="w-16 accent-[#144B15] dark:accent-[#4e8b52]"
            min="0"
            max="1"
            step="0.05"
            :value="volume"
            aria-label="Volume"
            @input="onVolumeChange"
          >
        </div>

        <button
          type="button"
          class="flex items-center justify-center size-8 shrink-0 rounded-md hover:bg-white/30 transition-[background-color] ease-in-out duration-300"
          aria-label="Close player"
          @click="close"
          v-wave
        >
          <Icon name="lucide:x" size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
```

Modify `app/components/Header.vue`: the mini player must be a sibling row *below* the main `h-18.75` row but inside the sticky/backdrop wrapper. Insert after the closing `</div>` of `<div class="relative flex justify-between items-center h-18.75 px-2">` block's parent container — concretely, change the bottom of the template from:

```vue
        </div>
      </div>
    </div>
  </div>
</template>
```

to:

```vue
        </div>
      </div>
    </div>
    <HeaderMiniPlayer />
  </div>
</template>
```

(i.e. `<HeaderMiniPlayer />` sits directly before the final `</div>` of the `data-testid="site-header"` wrapper, so it spans full width under the socials.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/headerMiniPlayer.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add app/components/HeaderMiniPlayer.vue app/components/Header.vue tests/unit/headerMiniPlayer.test.ts
git commit -m "feat: add persistent header mini player"
```

### Task 5: Refactor `AudioMixPlayer.vue` into a controller

**Files:**
- Modify: `app/components/AudioMixPlayer.vue` (remove local `<audio>`, drive `useAudioPlayer`)
- Test: `tests/unit/audioMixPlayer.test.ts` (create; there is no existing test for this component)

**Interfaces:**
- Consumes: `useAudioPlayer()` (Task 2). Props stay `{ src, title?, tracklist? }` — no change needed in `app/pages/artist/[id].vue`.
- Behaviour: when `isCurrent(src)` the component mirrors global state (progress, volume, pause); otherwise it shows an idle play button that calls `play({ kind: 'mix', src, title: title || 'Mix', link: route.path })`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/unit/audioMixPlayer.test.ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const component = readFileSync(
  fileURLToPath(new URL('../../app/components/AudioMixPlayer.vue', import.meta.url)),
  'utf8'
)

describe('AudioMixPlayer.vue', () => {
  it('has no local audio element anymore', () => {
    expect(component).not.toContain('<audio')
  })

  it('drives the global player instead', () => {
    expect(component).toContain('useAudioPlayer()')
    expect(component).toContain("kind: 'mix'")
    expect(component).toContain('isCurrent(')
  })

  it('links playback back to the current page', () => {
    expect(component).toContain('route.path')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/audioMixPlayer.test.ts`
Expected: FAIL (`<audio` present, no `useAudioPlayer()`)

- [ ] **Step 3: Rewrite the component**

Full replacement of `app/components/AudioMixPlayer.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { CompactParagraph } from '~/types'

const props = defineProps<{
  src: string
  title?: string
  tracklist?: CompactParagraph[]
}>()

const route = useRoute()
const { current, isPlaying, currentTime, duration, volume, play, toggle, seek, setVolume, isCurrent } = useAudioPlayer()

const active = computed(() => isCurrent(props.src))
const playingThis = computed(() => active.value && isPlaying.value)

function togglePlay() {
  if (active.value) toggle()
  else play({ kind: 'mix', src: props.src, title: props.title || 'Mix', link: route.path })
}

function onSeek(event: Event) {
  if (!active.value) return
  seek(Number((event.target as HTMLInputElement).value))
}

function onVolumeChange(event: Event) {
  setVolume(Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="flex items-center justify-center w-10 h-10 shrink-0 rounded-full border border-white/20 hover:bg-white/10 transition-colors duration-200"
        :aria-label="playingThis ? 'Pause' : 'Play'"
        @click="togglePlay"
        v-wave
      >
        <Icon :name="playingThis ? 'lucide:pause' : 'lucide:play'" size="18" />
      </button>

      <span v-if="title" class="text-sm">{{ title }}</span>
    </div>

    <div class="flex items-center gap-2">
      <span class="font-mono text-xs w-10 text-right">{{ formatDuration(active ? currentTime : 0) }}</span>
      <input
        type="range"
        class="flex-1 accent-[#144B15] dark:accent-[#4e8b52]"
        min="0"
        :max="active ? (duration || 0) : 0"
        step="1"
        :value="active ? currentTime : 0"
        :disabled="!active"
        @input="onSeek"
      >
      <span class="font-mono text-xs w-10">{{ formatDuration(active ? duration : 0) }}</span>
    </div>

    <div class="flex items-center gap-2">
      <Icon name="lucide:volume-2" size="16" />
      <input
        type="range"
        class="w-24 accent-[#144B15] dark:accent-[#4e8b52]"
        min="0"
        max="1"
        step="0.05"
        :value="volume"
        @input="onVolumeChange"
      >
    </div>

    <div v-if="tracklist?.length" class="flex flex-col gap-1">
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

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/audioMixPlayer.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add app/components/AudioMixPlayer.vue tests/unit/audioMixPlayer.test.ts
git commit -m "refactor: AudioMixPlayer drives global audio player"
```

### Task 6: Refactor `AudioTrackPlaylist.vue` into a controller (tracks + queue)

**Files:**
- Modify: `app/components/AudioTrackPlaylist.vue` (remove local `<audio>`, drive `useAudioPlayer` with a queue)
- Modify: `tests/unit/audioTrackPlaylist.test.ts` (update assertions to the new controller shape)

**Interfaces:**
- Consumes: `useAudioPlayer()` (Task 2), `QueueItem` (Task 1). Props stay `{ tracks: { title: string; url: string; slug?: string }[] }`; `defineExpose({ playTrack })` is kept — `app/pages/release/[id].vue` calls it.
- Behaviour: `playTrack(index)` builds `queue` from all tracks with a non-empty `url` and calls `play({ kind: 'track', ..., queue, queueIndex, link: route.path })`. Play-count registration (`/api/track-plays` POST, session-deduped) moves off the removed `@play` audio event: register inside `playTrack` and in a watcher that fires when the global player auto-advances to another track of this queue. Prev/next buttons call global `prev()`/`next()` when this playlist is active. The active row highlight keys off the globally playing src, not a local index.

- [ ] **Step 1: Update the test (write failing assertions)**

In `tests/unit/audioTrackPlaylist.test.ts`, replace the body of the `describe` block's audio-element assertions:

```ts
  it('has no local audio element anymore', () => {
    expect(component).not.toContain('<audio')
  })

  it('drives the global player with a track queue', () => {
    expect(component).toContain('useAudioPlayer()')
    expect(component).toContain("kind: 'track'")
    expect(component).toContain('queue')
  })

  it('still exposes playTrack for the release page', () => {
    expect(component).toContain('defineExpose({ playTrack })')
  })

  it('keeps registering play counts', () => {
    expect(component).toContain("$fetch('/api/track-plays', { method: 'POST'")
  })
```

Keep the existing assertions that still hold (`tracks` prop shape, lucide play/pause icons, prev/next boundary gating) and delete ones tied to the removed local element (`:src="currentTrack?.url"`, `@ended="onEnded"`, `function onEnded`).

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/audioTrackPlaylist.test.ts`
Expected: FAIL (local `<audio` still present)

- [ ] **Step 3: Rewrite the component**

Full replacement of `app/components/AudioTrackPlaylist.vue` script + the `<audio>`/controls part of the template (tracklist rows and play-count badges keep their existing markup):

```vue
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { QueueItem } from '~/utils/audioQueue'

const props = defineProps<{
  tracks: { title: string; url: string; slug?: string }[]
}>()

const route = useRoute()
const { current, isPlaying, currentTime, duration, volume, play, toggle, seek, setVolume, next, prev } = useAudioPlayer()

const playCounts = ref<Record<string, number>>({})
const countedThisSession = new Set<string>()

const trackSlugs = computed(() =>
  props.tracks.map(t => t.slug).filter((s): s is string => Boolean(s))
)

onMounted(async () => {
  if (!trackSlugs.value.length) return
  try {
    playCounts.value = await $fetch<Record<string, number>>('/api/track-plays', {
      query: { slugs: trackSlugs.value.join(',') },
    })
  } catch { /* counts stay empty */ }
})

const playable = computed(() => props.tracks.filter(t => t.url))
const queue = computed<QueueItem[]>(() =>
  playable.value.map(t => ({ src: t.url, title: t.title, link: route.path }))
)

const activeIndex = computed(() =>
  playable.value.findIndex(t => t.url === current.value?.src)
)
const isActive = computed(() => activeIndex.value !== -1)
const playingThis = computed(() => isActive.value && isPlaying.value)
const currentTrack = computed(() => playable.value[activeIndex.value] ?? playable.value[0])

function registerPlay(slug?: string) {
  if (!slug || countedThisSession.has(slug)) return
  countedThisSession.add(slug)
  playCounts.value = { ...playCounts.value, [slug]: (playCounts.value[slug] ?? 0) + 1 }
  $fetch('/api/track-plays', { method: 'POST', body: { slug } }).catch(() => {})
}

function playTrack(index: number) {
  const track = props.tracks[index]
  if (!track?.url) return
  const queueIndex = playable.value.findIndex(t => t.url === track.url)
  play({ kind: 'track', src: track.url, title: track.title, link: route.path, queue: queue.value, queueIndex })
  registerPlay(track.slug)
}

watch(activeIndex, (index) => {
  if (index === -1) return
  registerPlay(playable.value[index]?.slug)
})

function togglePlay() {
  if (isActive.value) toggle()
  else playTrack(props.tracks.findIndex(t => t.url))
}

function onSeek(event: Event) {
  if (!isActive.value) return
  seek(Number((event.target as HTMLInputElement).value))
}

function onVolumeChange(event: Event) {
  setVolume(Number((event.target as HTMLInputElement).value))
}

defineExpose({ playTrack })
</script>
```

Template control changes (structure and classes stay as today, only bindings move to global state):
- delete the whole `<audio … />` element
- prev button: `:disabled="!isActive || activeIndex === 0"`, `@click="prev"`
- play button: icon `playingThis ? 'lucide:pause' : 'lucide:play'`, `@click="togglePlay"`
- next button: `:disabled="!isActive || activeIndex === playable.length - 1"`, `@click="next"`
- title span: `{{ currentTrack?.title }}` (unchanged expression, new computed)
- seek row: `:max="isActive ? (duration || 0) : 0"`, `:value="isActive ? currentTime : 0"`, `:disabled="!isActive"`, `@input="onSeek"`; timings `formatDuration(isActive ? currentTime : 0)` / `formatDuration(isActive ? duration : 0)`
- volume row: `:value="volume"`, `@input="onVolumeChange"`
- tracklist row highlight: `:class="track.url && track.url === current?.src ? 'text-white font-bold' : 'text-white/60'"`; row `@click="playTrack(index)"` stays

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/unit/audioTrackPlaylist.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/components/AudioTrackPlaylist.vue tests/unit/audioTrackPlaylist.test.ts
git commit -m "refactor: AudioTrackPlaylist drives global player with queue"
```

### Task 7: Full verification

**Files:** none new.

- [ ] **Step 1: Run the whole unit suite**

Run: `npm run test:unit`
Expected: PASS — 31 files (27 baseline + audioQueue, useAudioPlayer, audioBridge, headerMiniPlayer, audioMixPlayer), no failures.

- [ ] **Step 2: Typecheck**

Run: `npx nuxi typecheck`
Expected: PASS (local Supabase env warnings are fine).

- [ ] **Step 3: Manual smoke test in dev**

Run: `npm run dev`, then in the browser:
1. Open an artist page with `mix_audio_url` (e.g. one that shows the Mix tab), press play — mini player row appears in the header, audio plays.
2. Navigate to `/releases`, `/artists`, home — audio keeps playing, mini player persists, seek/volume/pause work from the header.
3. Open a release page with playable tracks — start a track: it replaces the mix in the global player; track auto-advances on end (seek near the end to check); prev/next work.
4. Press ✕ in the mini player — playback stops, row disappears.
5. Reload — volume choice persisted.
6. Check mobile width (devtools) — volume control hidden, row fits without horizontal scroll; check both themes.

- [ ] **Step 4: Commit any fixups**

```bash
git add -A && git commit -m "fix: global audio player polish"
```

(Skip if nothing changed.)
