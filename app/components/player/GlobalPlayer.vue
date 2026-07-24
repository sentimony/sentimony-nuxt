<script setup lang="ts">
import { toArray } from '~/composables/toArray'
import { visibleByDate } from '~/composables/sortByDate'
import type { Release } from '~/types'

const { current, isPlaying, currentTime, duration, volume, repeatMode, cycleRepeat, play, toggle, seek, setVolume, next, prev } = useAudioPlayer()
const { isTrackLiked, toggleTrackLike, trackLikeCount } = useTrackLikes()
const user = useSupabaseUser()

const { data: releasesRaw } = await useReleases()
const latestRelease = computed(() =>
  visibleByDate(toArray<Release>(releasesRaw.value, 'releases')).find(r => !r?.coming_soon) ?? null
)

const starting = ref(false)
async function playLatestRelease() {
  const rel = latestRelease.value
  if (!rel?.slug || starting.value) return
  starting.value = true
  try {
    const detail = await $fetch<Release>(`/api/release/${rel.slug}`)
    const cover = detail.cover_th || detail.cover_xl
    const playable = (detail.tracklist ?? []).filter(t => t.url)
    if (!playable.length) return
    const queue = playable.map(t => ({
      src: t.url!,
      title: `${t.artist} - ${t.title}`,
      link: t.slug ? `/track/${t.slug}` : `/release/${rel.slug}`,
      artist: t.artist,
      name: t.title,
      cover,
      releaseLink: `/release/${rel.slug}`,
      releaseTitle: detail.title,
      artistLink: t.artist_slug ? `/artist/${t.artist_slug}` : undefined,
    }))
    play({ kind: 'track', ...queue[0]!, queue, queueIndex: 0 })
  }
  catch { /* nothing to play */ }
  finally {
    starting.value = false
  }
}

function onPlayToggle() {
  if (current.value) toggle()
  else playLatestRelease()
}

const trackSlug = computed(() => {
  const link = current.value?.link
  return link?.startsWith('/track/') ? link.slice('/track/'.length) : ''
})

const trackParts = computed(() => {
  const c = current.value
  if (c?.artist || c?.name) return { artist: c.artist ?? '', name: c.name ?? '' }
  const raw = c?.title ?? ''
  const idx = raw.indexOf(' - ')
  if (idx === -1) return { artist: raw, name: '' }
  return { artist: raw.slice(0, idx), name: raw.slice(idx + 3) }
})

const artistSegments = computed(() => {
  const segments = current.value?.artistSegments
  if (segments?.length) return segments
  return [{ text: trackParts.value.artist, slug: null }]
})

const nameSegments = computed(() => {
  const segments = current.value?.nameSegments
  if (segments?.length) return segments
  return [{ text: trackParts.value.name, slug: null }]
})

const canPrev = computed(() => !!current.value?.queue && (current.value.queueIndex ?? 0) > 0)
const canNext = computed(() => {
  const c = current.value
  return !!c?.queue && (c.queueIndex ?? 0) < c.queue.length - 1
})

function onSeek(event: Event) {
  seek(Number((event.target as HTMLInputElement).value))
}

const lastVolume = ref(1)

function onVolumeChange(event: Event) {
  const v = Number((event.target as HTMLInputElement).value)
  setVolume(v)
  if (v > 0) lastVolume.value = v
}

function toggleMute() {
  if (volume.value > 0) {
    lastVolume.value = volume.value
    setVolume(0)
  }
  else {
    setVolume(lastVolume.value || 1)
  }
}

const seekProgress = computed(() => {
  const total = duration.value || 0
  if (!total) return 0
  return Math.min(100, (currentTime.value / total) * 100)
})

const volumeProgress = computed(() => Math.min(100, volume.value * 100))
</script>

<template>
  <div class="sticky bottom-0 z-[110]">
    <div
      data-testid="audio-bottom-player"
      class="border-t border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 backdrop-blur-md"
    >
      <div class="container max-w-7xl">
        <div class="grid min-h-[71px] grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-2 py-2 sm:grid-cols-[auto_1fr] sm:py-0">
          <div class="order-2 sm:order-1">
            <PlayerControls
              size="sm"
              :is-playing="isPlaying"
              :can-prev="canPrev"
              :can-next="canNext"
              :play-disabled="!current && !latestRelease"
              @prev="prev"
              @toggle="onPlayToggle"
              @next="next"
            />
          </div>

          <div class="order-1 col-span-2 flex min-w-0 items-center gap-3 sm:order-2 sm:col-span-1">
            <span class="hidden font-mono text-xs tabular-nums opacity-70 sm:inline">{{ formatDuration(currentTime) }}</span>
            <input
              type="range"
              class="player-range w-full min-w-0 flex-1 sm:max-w-md lg:max-w-lg"
              :style="{ '--progress': `${seekProgress}%` }"
              min="0"
              :max="duration || 0"
              step="1"
              :value="currentTime"
              :disabled="!current"
              aria-label="Seek"
              @input="onSeek"
            >
            <span class="font-mono text-xs tabular-nums opacity-70">{{ formatDuration(duration) }}</span>

            <PlayerTrackInfo
              v-if="current"
              class="ml-1"
              :cover="current.cover"
              :cover-size="44"
              :release-link="current.releaseLink"
              :release-title="current.releaseTitle"
              :artist-segments="artistSegments"
              :name-segments="nameSegments"
              :track-link="current.link"
            />

            <div class="ml-auto flex shrink-0 items-center gap-1.5">
              <button
                v-if="trackSlug"
                type="button"
                class="flex h-7.5 shrink-0 items-center gap-1 rounded-md px-1.5 opacity-70 transition-[background-color,opacity] duration-300 ease-in-out hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/20"
                :aria-label="isTrackLiked(trackSlug) ? 'Liked' : 'Like track'"
                @click="toggleTrackLike(trackSlug)"
                v-wave
              >
                <Icon
                  name="lucide:thumbs-up"
                  size="14"
                  :class="user && isTrackLiked(trackSlug) && 'text-emerald-600 dark:text-emerald-300'"
                />
                <span v-if="trackLikeCount(trackSlug) > 0" class="font-mono text-xs tabular-nums">{{ trackLikeCount(trackSlug) }}</span>
              </button>

              <div class="hidden items-center gap-1.5 md:flex">
                <button
                  type="button"
                  class="flex size-7.5 shrink-0 items-center justify-center rounded-md opacity-70 transition-[background-color,opacity] duration-300 ease-in-out hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/20"
                  :aria-label="volume > 0 ? 'Mute' : 'Unmute'"
                  @click="toggleMute"
                  v-wave
                >
                  <Icon :name="volume > 0 ? 'lucide:volume-2' : 'lucide:volume-x'" size="14" />
                </button>
                <input
                  type="range"
                  class="player-range w-18"
                  :style="{ '--progress': `${volumeProgress}%` }"
                  min="0"
                  max="1"
                  step="0.05"
                  :value="volume"
                  aria-label="Volume"
                  @input="onVolumeChange"
                >
                <button
                  type="button"
                  class="flex size-7.5 shrink-0 items-center justify-center rounded-md transition-[background-color,opacity] duration-300 ease-in-out hover:bg-black/10 dark:hover:bg-white/20"
                  :class="repeatMode === 'off' ? 'opacity-50 hover:opacity-80' : 'text-emerald-600 opacity-100 dark:text-emerald-300'"
                  :aria-label="repeatMode === 'off' ? 'Repeat off' : repeatMode === 'all' ? 'Repeat all' : 'Repeat one'"
                  @click="cycleRepeat"
                  v-wave
                >
                  <Icon :name="repeatMode === 'one' ? 'lucide:repeat-1' : 'lucide:repeat'" size="14" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-range {
  --track-fill: #047857;
  --track-bg: rgba(0, 0, 0, 0.2);
  appearance: none;
  -webkit-appearance: none;
  height: 1rem;
  background:
    linear-gradient(
      to right,
      var(--track-fill) 0%,
      var(--track-fill) var(--progress, 0%),
      var(--track-bg) var(--progress, 0%),
      var(--track-bg) 100%
    )
    no-repeat center / 100% 3px;
  cursor: pointer;
}

:global(.dark) .player-range {
  --track-fill: #6ee7b7;
  --track-bg: rgba(255, 255, 255, 0.2);
}

.player-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 4px;
  height: 14px;
  border-radius: 9999px;
  background: var(--track-fill);
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}

.player-range::-moz-range-thumb {
  width: 4px;
  height: 14px;
  border-radius: 9999px;
  background: var(--track-fill);
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
</style>
