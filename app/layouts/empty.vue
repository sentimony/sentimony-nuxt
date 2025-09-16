<script setup lang="ts">
const host = useRequestURL().hostname
</script>

<template>
  <!-- <Fractal v-if="host == '!localhost'" /> -->
  <Fractal />
  <slot />
  <div v-if="host == 'localhost'" class="fixed bottom-0 right-0 p-2 w-auto h-auto flex items-end justify-end z-50 text-gray-500/30  text-xs text-right ">host:<br>{{ host }}</div>
</template>

<style lang="scss"></style>
