<script setup lang="ts">
withDefaults(defineProps<{
  isPlaying: boolean
  canPrev: boolean
  canNext: boolean
  playDisabled?: boolean
  size?: 'sm' | 'md'
  showSides?: boolean
}>(), {
  playDisabled: false,
  size: 'md',
  showSides: true,
})

defineEmits<{ prev: []; toggle: []; next: [] }>()

const sideClass = 'flex shrink-0 items-center justify-center rounded-full border border-black/15 transition-colors duration-200 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/20 dark:hover:bg-white/10'
const mainClass = 'flex size-11 shrink-0 items-center justify-center rounded-full border border-black/25 transition-colors duration-200 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-35 dark:border-white/40 dark:hover:bg-white/10'
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-if="showSides"
      type="button"
      :class="[sideClass, size === 'sm' ? 'size-7.5' : 'size-9']"
      aria-label="Previous track"
      :disabled="!canPrev"
      @click="$emit('prev')"
      v-wave
    >
      <Icon name="lucide:skip-back" :size="size === 'sm' ? 14 : 18" />
    </button>

    <button
      type="button"
      :class="mainClass"
      :aria-label="isPlaying ? 'Pause' : 'Play'"
      :disabled="playDisabled"
      @click="$emit('toggle')"
      v-wave
    >
      <Icon :name="isPlaying ? 'lucide:pause' : 'lucide:play'" :size="20" />
    </button>

    <button
      v-if="showSides"
      type="button"
      :class="[sideClass, size === 'sm' ? 'size-7.5' : 'size-9']"
      aria-label="Next track"
      :disabled="!canNext"
      @click="$emit('next')"
      v-wave
    >
      <Icon name="lucide:skip-forward" :size="size === 'sm' ? 14 : 18" />
    </button>
  </div>
</template>
