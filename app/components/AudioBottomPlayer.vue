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

function onSeek(event: Event) {
  seek(Number((event.target as HTMLInputElement).value))
}

function onVolumeChange(event: Event) {
  setVolume(Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <div v-if="current">
    <div class="h-24 sm:h-18" aria-hidden="true" />
    <div
      data-testid="audio-bottom-player"
      class="fixed inset-x-0 bottom-0 z-[110] border-t border-black/20 dark:border-white/20 bg-black/5 dark:bg-white/5 backdrop-blur-sm"
    >
      <div class="container max-w-7xl">
        <div class="grid min-h-18 grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 px-2 py-2 sm:grid-cols-[auto_minmax(12rem,1fr)_minmax(12rem,auto)] sm:py-0">
          <div class="order-2 flex items-center gap-1 sm:order-1">
            <button
              type="button"
              class="flex size-9 shrink-0 items-center justify-center rounded-md transition-[background-color] duration-300 ease-in-out hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-white/20"
              aria-label="Previous track"
              :disabled="!current.queue || (current.queueIndex ?? 0) <= 0"
              @click="prev"
              v-wave
            >
              <Icon name="lucide:skip-back" size="18" />
            </button>

            <button
              type="button"
              class="flex size-10 shrink-0 items-center justify-center rounded-full bg-black text-white transition-[background-color] duration-300 ease-in-out hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
              :aria-label="isPlaying ? 'Pause' : 'Play'"
              @click="toggle"
              v-wave
            >
              <Icon :name="isPlaying ? 'lucide:pause' : 'lucide:play'" size="18" />
            </button>

            <button
              type="button"
              class="flex size-9 shrink-0 items-center justify-center rounded-md transition-[background-color] duration-300 ease-in-out hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-35 dark:hover:bg-white/20"
              aria-label="Next track"
              :disabled="!current.queue || (current.queueIndex ?? 0) >= current.queue.length - 1"
              @click="next"
              v-wave
            >
              <Icon name="lucide:skip-forward" size="18" />
            </button>
          </div>

          <div class="order-3 col-span-2 flex min-w-0 items-center gap-3 sm:order-2 sm:col-span-1">
            <span class="hidden font-mono text-xs tabular-nums opacity-70 sm:inline">{{ formatDuration(currentTime) }}</span>
            <input
              type="range"
              class="h-2 min-w-0 flex-1 accent-[#144B15] dark:accent-[#4e8b52]"
              min="0"
              :max="duration || 0"
              step="1"
              :value="currentTime"
              aria-label="Seek"
              @input="onSeek"
            >
            <span class="font-mono text-xs tabular-nums opacity-70">{{ formatDuration(duration) }}</span>
          </div>

          <div class="order-1 col-span-2 flex min-w-0 items-center justify-between gap-3 sm:order-3 sm:col-span-1">
            <div class="flex min-w-0 items-center gap-3">
              <component
                :is="current.releaseLink ? 'NuxtLink' : 'div'"
                v-if="current.cover"
                :to="current.releaseLink"
                class="shrink-0"
                :aria-label="current.releaseLink ? 'Open release' : undefined"
              >
                <NuxtImg
                  :src="current.cover"
                  :alt="trackParts.name || 'Release cover'"
                  width="44"
                  height="44"
                  class="size-11 rounded object-cover"
                />
              </component>

              <div class="min-w-0 text-left text-sm font-medium leading-tight">
                <component
                  :is="current.artistLink ? 'NuxtLink' : 'span'"
                  :to="current.artistLink"
                  class="block truncate"
                  :class="current.artistLink && 'hover:underline'"
                >{{ trackParts.artist }}</component>
                <component
                  :is="current.link ? 'NuxtLink' : 'span'"
                  :to="current.link"
                  class="block truncate opacity-60"
                  :class="current.link && 'hover:underline'"
                >{{ trackParts.name }}</component>
              </div>
            </div>

            <div class="flex shrink-0 items-center gap-1.5">
              <div class="hidden items-center gap-1.5 md:flex">
                <Icon name="lucide:volume-2" size="16" class="opacity-70" />
                <input
                  type="range"
                  class="w-18 accent-[#144B15] dark:accent-[#4e8b52]"
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
