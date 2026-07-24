<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { nextQueueIndex } from '~/utils/audioQueue'

const audioEl = ref<HTMLAudioElement | null>(null)
const { current, isPlaying, currentTime, duration, volume, seekTo, repeatMode, playToken, toggle, seek, next, prev, moveTo, close } = useAudioPlayer()

onMounted(() => {
  const stored = localStorage.getItem('player-volume')
  const saved = Number(stored)
  if (stored !== null && Number.isFinite(saved) && saved >= 0 && saved <= 1) {
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
  if (nextQueueIndex(item.queue.length, item.queueIndex ?? 0) !== null) next()
  else if (repeatMode.value === 'all') moveTo(0)
  else close()
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
