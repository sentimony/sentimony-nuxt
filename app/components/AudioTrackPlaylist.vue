<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { QueueItem } from '~/utils/audioQueue'

const props = defineProps<{
  tracks: {
    title: string
    url: string
    slug?: string
    artist?: string
    name?: string
    cover?: string
    releaseLink?: string
    artistLink?: string
  }[]
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
function toQueueItem(t: typeof props.tracks[number]): QueueItem {
  return {
    src: t.url,
    title: t.title,
    link: t.slug ? `/track/${t.slug}` : route.path,
    artist: t.artist,
    name: t.name,
    cover: t.cover,
    releaseLink: t.releaseLink ?? route.path,
    artistLink: t.artistLink,
  }
}

const queue = computed<QueueItem[]>(() => playable.value.map(toQueueItem))

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
  play({ kind: 'track', ...toQueueItem(track), queue: queue.value, queueIndex })
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

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center gap-2">
      <button
        type="button"
        class="flex items-center justify-center w-8 h-8 shrink-0 rounded-full border border-white/20 hover:bg-white/10 transition-colors duration-200 disabled:opacity-30"
        aria-label="Previous track"
        :disabled="!isActive || activeIndex === 0"
        @click="prev"
        v-wave
      >
        <Icon name="lucide:skip-back" size="14" />
      </button>

      <button
        type="button"
        class="flex items-center justify-center w-10 h-10 shrink-0 rounded-full border border-white/20 hover:bg-white/10 transition-colors duration-200"
        :aria-label="playingThis ? 'Pause' : 'Play'"
        @click="togglePlay"
        v-wave
      >
        <Icon :name="playingThis ? 'lucide:pause' : 'lucide:play'" size="18" />
      </button>

      <button
        type="button"
        class="flex items-center justify-center w-8 h-8 shrink-0 rounded-full border border-white/20 hover:bg-white/10 transition-colors duration-200 disabled:opacity-30"
        aria-label="Next track"
        :disabled="!isActive || activeIndex === playable.length - 1"
        @click="next"
        v-wave
      >
        <Icon name="lucide:skip-forward" size="14" />
      </button>

      <span class="text-sm truncate">{{ currentTrack?.title }}</span>
    </div>

    <div class="flex items-center gap-2">
      <span class="font-mono text-xs w-10 text-right">{{ formatDuration(isActive ? currentTime : 0) }}</span>
      <input
        type="range"
        class="flex-1 accent-[#144B15] dark:accent-[#4e8b52]"
        min="0"
        :max="isActive ? (duration || 0) : 0"
        step="1"
        :value="isActive ? currentTime : 0"
        :disabled="!isActive"
        @input="onSeek"
      >
      <span class="font-mono text-xs w-10">{{ formatDuration(isActive ? duration : 0) }}</span>
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

    <div class="flex flex-col gap-1 mt-2">
      <button
        v-for="(track, index) in tracks"
        :key="index"
        type="button"
        class="flex items-center gap-2 text-xs text-left px-2 py-1 rounded transition-colors duration-200 hover:bg-white/10"
        :class="track.url && track.url === current?.src ? 'text-white font-bold' : 'text-white/60'"
        @click="playTrack(index)"
      >
        <span class="font-mono w-6 shrink-0">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="truncate">{{ track.title }}</span>
        <span
          v-if="track.slug && playCounts[track.slug]"
          class="ml-auto flex items-center gap-1 font-mono shrink-0 opacity-60"
        >
          <Icon name="lucide:headphones" size="12" />
          {{ playCounts[track.slug] }}
        </span>
      </button>
    </div>
  </div>
</template>
