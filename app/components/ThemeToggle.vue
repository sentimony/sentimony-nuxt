<script setup lang="ts">
const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    class="flex items-center justify-center transition-[background-color] ease-in-out duration-300 hover:bg-black/10 dark:hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background size-9 rounded-md"
    @click="toggle($event)"
    v-wave
  >
    <Icon v-if="isDark" name="lucide:moon" size="18" aria-hidden="true" />
    <Icon v-else name="lucide:sun" size="18" aria-hidden="true" />
  </button>
</template>
