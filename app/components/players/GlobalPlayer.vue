<script setup lang="ts">
const { current, isPlaying, currentTime, duration, volume, toggle, seek, setVolume, close, next, prev } = useAudioPlayer()

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

const footerOffset = ref(0)
let rafId = 0

function updateFooterOffset() {
  const footer = document.querySelector('[data-testid="site-footer"]')
  if (!footer) {
    footerOffset.value = 0
    return
  }
  const top = footer.getBoundingClientRect().top
  const overlap = window.innerHeight - top
  footerOffset.value = overlap > 0 ? overlap : 0
}

function scheduleUpdate() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    rafId = 0
    updateFooterOffset()
  })
}

onMounted(() => {
  updateFooterOffset()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', scheduleUpdate)
  window.removeEventListener('resize', scheduleUpdate)
  if (rafId) cancelAnimationFrame(rafId)
})

watch(current, (val) => {
  if (val) nextTick(updateFooterOffset)
})
</script>

<template>
  <div v-if="current">
    <div
      data-testid="audio-bottom-player"
      class="fixed inset-x-0 bottom-0 z-[110] border-t border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 backdrop-blur-md"
      :style="{ transform: `translateY(-${footerOffset}px)` }"
    >
      <div class="container max-w-7xl">
        <div class="grid min-h-18 grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-2 py-2 sm:grid-cols-[auto_1fr] sm:py-0">
          <div class="order-2 sm:order-1">
            <PlayerControls
              size="sm"
              :is-playing="isPlaying"
              :can-prev="canPrev"
              :can-next="canNext"
              @prev="prev"
              @toggle="toggle"
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
              aria-label="Seek"
              @input="onSeek"
            >
            <span class="font-mono text-xs tabular-nums opacity-70">{{ formatDuration(duration) }}</span>

            <PlayerTrackInfo
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
              <div class="hidden items-center gap-1.5 md:flex">
                <button
                  type="button"
                  class="flex size-9 shrink-0 items-center justify-center rounded-md opacity-70 transition-[background-color,opacity] duration-300 ease-in-out hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/20"
                  :aria-label="volume > 0 ? 'Mute' : 'Unmute'"
                  @click="toggleMute"
                  v-wave
                >
                  <Icon :name="volume > 0 ? 'lucide:volume-2' : 'lucide:volume-x'" size="16" />
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

              <button
                type="button"
                class="flex size-9 shrink-0 items-center justify-center rounded-md transition-[background-color] duration-300 ease-in-out hover:bg-black/10 dark:hover:bg-white/20"
                aria-label="Close player"
                @click="close"
                v-wave
              >
                <Icon name="lucide:x" size="17" />
              </button>
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
  --track-bg: rgba(0, 0, 0, 0.15);
  appearance: none;
  -webkit-appearance: none;
  height: 0.5rem;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    var(--track-fill) 0%,
    var(--track-fill) var(--progress, 0%),
    var(--track-bg) var(--progress, 0%),
    var(--track-bg) 100%
  );
  cursor: pointer;
}

:global(.dark) .player-range {
  --track-fill: #6ee7b7;
  --track-bg: rgba(255, 255, 255, 0.15);
}

.player-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background: var(--track-fill);
  border: 2px solid #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.player-range::-moz-range-thumb {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 9999px;
  background: var(--track-fill);
  border: 2px solid #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}
</style>
