<script setup lang="ts">
const { current, isPlaying, currentTime, duration, volume, toggle, seek, setVolume, close } = useAudioPlayer()

function onSeek(event: Event) {
  seek(Number((event.target as HTMLInputElement).value))
}

function onVolumeChange(event: Event) {
  setVolume(Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <div
    v-if="current"
    data-testid="header-mini-player"
    class="border-t border-black/10 dark:border-white/10"
  >
    <div class="container max-w-7xl">
      <div class="flex items-center justify-end gap-2 h-10 px-2">
        <button
          type="button"
          class="flex items-center justify-center size-8 shrink-0 rounded-md hover:bg-white/30 transition-[background-color] ease-in-out duration-300"
          :aria-label="isPlaying ? 'Pause' : 'Play'"
          @click="toggle"
          v-wave
        >
          <Icon :name="isPlaying ? 'lucide:pause' : 'lucide:play'" size="16" />
        </button>

        <NuxtLink
          v-if="current.link"
          :to="current.link"
          class="text-xs truncate max-w-40 sm:max-w-56 hover:underline"
        >
          {{ current.title }}
        </NuxtLink>
        <span v-else class="text-xs truncate max-w-40 sm:max-w-56">{{ current.title }}</span>

        <input
          type="range"
          class="w-24 sm:w-40 lg:w-56 accent-[#144B15] dark:accent-[#4e8b52]"
          min="0"
          :max="duration || 0"
          step="1"
          :value="currentTime"
          aria-label="Seek"
          @input="onSeek"
        >
        <span class="font-mono text-xs whitespace-nowrap">{{ formatDuration(currentTime) }}/{{ formatDuration(duration) }}</span>

        <div class="hidden sm:flex items-center gap-1.5">
          <Icon name="lucide:volume-2" size="14" />
          <input
            type="range"
            class="w-16 accent-[#144B15] dark:accent-[#4e8b52]"
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
          class="flex items-center justify-center size-8 shrink-0 rounded-md hover:bg-white/30 transition-[background-color] ease-in-out duration-300"
          aria-label="Close player"
          @click="close"
          v-wave
        >
          <Icon name="lucide:x" size="16" />
        </button>
      </div>
    </div>
  </div>
</template>
