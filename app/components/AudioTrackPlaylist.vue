<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'

const props = defineProps<{
  tracks: { title: string; url: string; slug?: string }[]
}>()

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

function registerPlay() {
  const slug = props.tracks[currentIndex.value]?.slug
  if (!slug || countedThisSession.has(slug)) return
  countedThisSession.add(slug)
  playCounts.value = { ...playCounts.value, [slug]: (playCounts.value[slug] ?? 0) + 1 }
  $fetch('/api/track-plays', { method: 'POST', body: { slug } }).catch(() => {})
}

const audioEl = ref<HTMLAudioElement | null>(null)
const currentIndex = ref(0)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)

const currentTrack = computed(() => props.tracks[currentIndex.value])

function playTrack(index: number) {
  currentIndex.value = index
  currentTime.value = 0
  nextTick(() => audioEl.value?.play())
}

function togglePlay() {
  if (!audioEl.value) return
  if (audioEl.value.paused) audioEl.value.play()
  else audioEl.value.pause()
}

function playPrev() {
  if (currentIndex.value > 0) playTrack(currentIndex.value - 1)
}

function playNext() {
  if (currentIndex.value < props.tracks.length - 1) playTrack(currentIndex.value + 1)
}

function onEnded() {
  if (currentIndex.value < props.tracks.length - 1) playTrack(currentIndex.value + 1)
  else isPlaying.value = false
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
      :src="currentTrack?.url"
      class="hidden"
      preload="metadata"
      @play="isPlaying = true; registerPlay()"
      @pause="isPlaying = false"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
    />

    <div class="flex items-center gap-2">
      <button
        type="button"
        class="flex items-center justify-center w-8 h-8 shrink-0 rounded-full border border-white/20 hover:bg-white/10 transition-colors duration-200 disabled:opacity-30"
        aria-label="Previous track"
        :disabled="currentIndex === 0"
        @click="playPrev"
        v-wave
      >
        <Icon name="lucide:skip-back" size="14" />
      </button>

      <button
        type="button"
        class="flex items-center justify-center w-10 h-10 shrink-0 rounded-full border border-white/20 hover:bg-white/10 transition-colors duration-200"
        :aria-label="isPlaying ? 'Pause' : 'Play'"
        @click="togglePlay"
        v-wave
      >
        <Icon :name="isPlaying ? 'lucide:pause' : 'lucide:play'" size="18" />
      </button>

      <button
        type="button"
        class="flex items-center justify-center w-8 h-8 shrink-0 rounded-full border border-white/20 hover:bg-white/10 transition-colors duration-200 disabled:opacity-30"
        aria-label="Next track"
        :disabled="currentIndex === tracks.length - 1"
        @click="playNext"
        v-wave
      >
        <Icon name="lucide:skip-forward" size="14" />
      </button>

      <span class="text-sm truncate">{{ currentTrack?.title }}</span>
    </div>

    <div class="flex items-center gap-2">
      <span class="font-mono text-xs w-10 text-right">{{ formatDuration(currentTime) }}</span>
      <input
        type="range"
        class="flex-1 accent-[#144B15] dark:accent-[#4e8b52]"
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
        :class="index === currentIndex ? 'text-white font-bold' : 'text-white/60'"
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
