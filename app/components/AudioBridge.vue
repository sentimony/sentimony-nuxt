<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { PLAYER_CURRENT_KEY, type PlayerItem } from '~/composables/useAudioPlayer'

const audioEl = ref<HTMLAudioElement | null>(null)
const { current, isPlaying, currentTime, duration, volume, seekTo, repeatMode, shuffle, playToken, restore, reshuffle, stepIndex, toggle, seek, next, prev, moveTo, close } = useAudioPlayer()

function readStoredItem(): PlayerItem | null {
  const raw = localStorage.getItem(PLAYER_CURRENT_KEY)
  if (!raw) return null
  try {
    const item = JSON.parse(raw) as PlayerItem
    const valid = typeof item?.src === 'string' && typeof item?.title === 'string'
      && (item.kind === 'track' || item.kind === 'mix')
    return valid ? item : null
  }
  catch {
    return null
  }
}

onMounted(() => {
  const stored = localStorage.getItem('player-volume')
  const saved = Number(stored)
  if (stored !== null && Number.isFinite(saved) && saved >= 0 && saved <= 1) {
    // Snap to the slider's 0-10 steps so the knob and the fill agree.
    volume.value = Math.round(saved * 10) / 10
  }

  const item = readStoredItem()
  if (item && !current.value) restore(item)
})

watch(current, (item) => {
  // Only non-null writes: a queue that ended calls close(), and forgetting the
  // last track there would defeat the point of restoring it.
  if (item) localStorage.setItem(PLAYER_CURRENT_KEY, JSON.stringify(item))
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
  // A restored track is loaded paused; only an actual play request starts audio.
  if (isPlaying.value) el.play().catch(() => { isPlaying.value = false })
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

function replayCurrent() {
  const el = audioEl.value
  if (!el) return
  el.currentTime = 0
  currentTime.value = 0
  el.play().catch(() => { isPlaying.value = false })
  playToken.value++
}

function onEnded() {
  if (repeatMode.value === 'one') {
    replayCurrent()
    return
  }
  const item = current.value
  if (!item?.queue) {
    isPlaying.value = false
    return
  }
  if (stepIndex('next') !== null) next()
  else if (repeatMode.value === 'all') {
    // A new pass gets a new order, otherwise shuffle would repeat the same sequence.
    if (shuffle.value) reshuffle(0)
    moveTo(0)
  }
  else close()
}

function onError() {
  if (!current.value) return
  // A stale restored src errors on page load with no user action; stay silent then.
  const wasPlaying = isPlaying.value
  isPlaying.value = false
  if (wasPlaying) toast.error('Audio failed to load')
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
