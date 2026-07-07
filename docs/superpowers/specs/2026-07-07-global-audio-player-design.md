# Global Audio Player — Design

Date: 2026-07-07
Status: approved (approach A)

## Problem

`AudioMixPlayer.vue` owns its `<audio>` element inside the artist page. Navigating away unmounts the component and kills playback. Users should be able to keep listening while browsing the whole site.

## Goal

A single global audio pipeline that serves both artist mixes (`mix_audio_url`) and individual tracks (`tracks[].audio_url`), with a minimalist persistent mini player rendered as a second header row while something is loaded.

## Architecture (approach A: global composable + single `<audio>` in app.vue)

### 1. `app/composables/useAudioPlayer.ts`

Global state via `useState` (no Pinia). Client-only behaviour; SSR renders nothing playing.

State:

- `current: PlayerItem | null` where `PlayerItem = { src: string; title: string; link?: string; kind: 'mix' | 'track'; queue?: QueueItem[]; queueIndex?: number }`
  - `QueueItem = { src: string; title: string; link?: string }`
- `isPlaying: boolean`
- `currentTime: number`, `duration: number`
- `volume: number` — persisted in `localStorage['player-volume']`

API:

- `play(item: PlayerItem)` — replaces current source and starts playback
- `toggle()` — play/pause current
- `seek(seconds: number)`
- `setVolume(v: number)`
- `close()` — stop, clear `current` (mini player row disappears)
- `next()` / `prev()` — move within `queue` when `kind === 'track'`; no-op otherwise
- `isCurrent(src: string): boolean` — helper for page-level players

### 2. `app/components/AudioBridge.vue`

Mounted once in `app/app.vue` (next to `<Toaster>`). Renders a hidden `<audio>` element and is the only place that touches it:

- watches `current.src` → sets `audio.src`, plays
- syncs `timeupdate`/`loadedmetadata`/`play`/`pause` events back into state
- applies `volume` and imperative `seek` requests
- `ended` → `next()` if queue has more, otherwise stops (keeps `current`, `isPlaying=false`)
- updates Media Session API (`title`, play/pause/seek handlers) for lockscreen/OS controls

### 3. `app/components/HeaderMiniPlayer.vue`

Second row inside the sticky header (`Header.vue`), rendered only when `current !== null`. Full-width thin bar, controls aligned right (under the social icons on desktop). Single row layout:

`[▶/⏸] Title (NuxtLink to source page) · seek bar · mm:ss/mm:ss (font-mono) · volume · [✕]`

- volume control hidden below `sm`
- header visual language: `border-white/20`-style borders, `bg-black/5 dark:bg-white/5`, lucide icons via `<Icon>`, `v-wave` on buttons
- ✕ calls `close()`

### 4. `AudioMixPlayer.vue` refactor

Remove its own `<audio>`; becomes a controller over `useAudioPlayer`:

- play button calls `play({ kind: 'mix', src, title, link: route.path })`
- shows live progress/controls only when `isCurrent(src)`; otherwise shows idle play state
- tracklist rendering stays as-is

### 5. Tracks support

Wherever a track with non-null `audio_url` is rendered (track page, release tracklist), a play button calls `play({ kind: 'track', ..., queue, queueIndex })` with the release tracklist as the queue. `ended` auto-advances. (UI hookup for tracks may land in the same or a follow-up PR; the composable supports it from day one.)

## Error handling

- `audio.onerror` → `toast.error` (vue-sonner, same pattern as likes) + `isPlaying=false`
- `play()` promise rejection (autoplay policy) → state stays paused

## Testing

- Unit (Vitest): `useAudioPlayer` — play replaces source, toggle, close clears state, queue next/prev bounds, volume persistence
- Manual: start mix on artist page → navigate site-wide → audio continues, mini player controls it; theme toggle, mobile layout

## Out of scope

- Playback position persistence across reloads
- Shuffle/repeat
- Per-component light-theme polish beyond existing token behaviour
