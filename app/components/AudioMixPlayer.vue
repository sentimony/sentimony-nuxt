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
