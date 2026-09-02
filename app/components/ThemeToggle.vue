<script setup lang="ts">
const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    class="flex items-center justify-center transition-[background-color] ease-in-out duration-300 hover:bg-white/30 size-9 rounded-md"
    @click="toggle($event)"
    v-wave
  >
    <span class="hidden dark:flex"><Icon name="lucide:moon" size="18" aria-hidden="true" /></span>
    <span class="flex dark:hidden"><Icon name="lucide:sun" size="18" aria-hidden="true" /></span>
  </button>
</template>
