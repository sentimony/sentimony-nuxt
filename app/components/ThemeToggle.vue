<script setup lang="ts">
const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    class="flex items-center justify-center transition-[background-color] ease-in-out duration-300 hover:bg-white/30 w-[46px] lg:w-[56px] h-[56px] rounded-[2px]"
    @click="toggle($event)"
    v-wave
  >
    <Icon v-if="isDark" name="lucide:moon" size="22" aria-hidden="true" />
    <Icon v-else name="lucide:sun" size="22" aria-hidden="true" />
  </button>
</template>
