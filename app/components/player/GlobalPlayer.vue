<script setup lang="ts">
import { toArray } from '~/composables/toArray'
import { visibleByDate } from '~/composables/sortByDate'
import type { Release, ReleaseTracklistEntry } from '~/types'

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
    const playable = (detail.tracklist ?? []).filter((t): t is ReleaseTracklistEntry & { url: string } => Boolean(t.url))
    if (!playable.length) return
    const queue = playable.map(t => ({
      src: t.url,
      title: `${t.artist} - ${t.title}`,
      link: t.slug ? `/track/${t.slug}` : `/release/${rel.slug}`,
      artist: t.artist,
      name: t.title,
      cover,
      releaseLink: `/release/${rel.slug}`,
      releaseTitle: detail.title,
      artistLink: t.artist_slug ? `/artist/${t.artist_slug}` : undefined,
    }))
    const [first] = queue
    if (!first) return
    play({ kind: 'track', ...first, queue, queueIndex: 0 })
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

const nowPlayingLabel = computed(() => {
  const c = current.value
  if (!c) return ''
  const { artist, name } = trackParts.value
  return name ? `${artist} - ${name}` : artist
})

const canPrev = computed(() => !!current.value?.queue && (current.value.queueIndex ?? 0) > 0)
const canNext = computed(() => {
  const c = current.value
  return !!c?.queue && (c.queueIndex ?? 0) < c.queue.length - 1
})

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

const volumeProgress = computed(() => Math.min(100, volume.value * 100))

const introDone = useState('fractal-intro-done', () => false)
const pageLoaded = ref(false)
const revealed = ref(false)

onMounted(() => {
  if (document.readyState === 'complete') pageLoaded.value = true
  else window.addEventListener('load', () => { pageLoaded.value = true }, { once: true })
})

watch([pageLoaded, introDone], ([loaded, intro]) => {
  if (loaded && intro) revealed.value = true
})
</script>

<template>
  <div class="sticky bottom-0 z-[110]">
    <p class="sr-only" aria-live="polite" aria-atomic="true">{{ nowPlayingLabel }}</p>
    <div
      data-testid="audio-bottom-player"
      class="border-t border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 backdrop-blur-md transition-[translate,opacity] duration-700 ease-out motion-reduce:transition-none!"
      :class="revealed ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'"
      :aria-hidden="!revealed"
      :inert="!revealed"
    >
      <div class="container max-w-7xl">
        <div class="grid min-h-[71px] grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-2 py-2 sm:grid-cols-[auto_1fr] sm:py-0">
          <div class="order-2 flex items-center gap-1.5 sm:order-1">
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

          <div class="order-1 col-span-2 flex min-w-0 items-center gap-3 sm:order-2 sm:col-span-1">
            <PlayerSeek
              :current-time="currentTime"
              :duration="duration"
              :disabled="!current"
              @seek="seek"
            />

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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
