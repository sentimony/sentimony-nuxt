<script setup lang="ts">
import { computed } from 'vue'
import type { CompactParagraph } from '~/types'

const props = defineProps<{
  src: string
  title?: string
  tracklist?: CompactParagraph[]
}>()

const route = useRoute()
const { isPlaying, currentTime, duration, play, toggle, seek, isCurrent } = useAudioPlayer()

const active = computed(() => isCurrent(props.src))
const playingThis = computed(() => active.value && isPlaying.value)
const progress = computed(() => {
  const total = active.value ? duration.value || 0 : 0
  if (!total) return 0
  return Math.min(100, (currentTime.value / total) * 100)
})

function togglePlay() {
  if (active.value) toggle()
  else play({ kind: 'mix', src: props.src, title: props.title || 'Mix', link: route.path })
}

function onSeek(event: Event) {
  if (!active.value) return
  seek(Number((event.target as HTMLInputElement).value))
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
        class="player-range flex-1 min-w-0"
        :style="{ '--progress': `${progress}%` }"
        min="0"
        :max="active ? (duration || 0) : 0"
        step="1"
        :value="active ? currentTime : 0"
        :disabled="!active"
        aria-label="Seek"
        @input="onSeek"
      >
    </div>

    <ol v-if="tracklist?.length" class="list-none flex flex-col gap-1">
      <li
        v-for="(track, index) in tracklist"
        :key="index"
        class="text-xs"
        v-html="sanitizeHtml(track.p)"
      />
    </ol>
  </div>
</template>
