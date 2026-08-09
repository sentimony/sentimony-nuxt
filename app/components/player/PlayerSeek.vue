<script setup lang="ts">
const props = defineProps<{
  currentTime: number
  duration: number
  disabled?: boolean
}>()

const emit = defineEmits<{ seek: [value: number] }>()

const progress = computed(() => {
  const total = props.duration || 0
  if (!total) return 0
  return Math.min(100, (props.currentTime / total) * 100)
})

function onSeek(event: Event) {
  emit('seek', Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <div class="flex min-w-0 flex-1 items-center gap-3">
    <span class="hidden font-mono text-xs tabular-nums opacity-70 sm:inline">{{ formatDuration(currentTime) }}</span>
    <input
      type="range"
      class="player-range w-full min-w-0 flex-1 sm:max-w-md lg:max-w-lg"
      :style="{ '--progress': `${progress}%` }"
      min="0"
      :max="duration || 0"
      step="1"
      :value="currentTime"
      :disabled="disabled"
      aria-label="Seek"
      @input="onSeek"
    >
    <span class="font-mono text-xs tabular-nums opacity-70">{{ formatDuration(duration) }}</span>
  </div>
</template>
