<script setup lang="ts">
defineProps<{
  url?: string
  icon?: string
  title?: string
}>()
</script>

<template>
  <NuxtLink
    :to="url"
    class="inline-flex items-center h-[36px] md:h-[42px] text-[12px] md:text-[15px] tracking-tighter rounded-md border transition-[background-color] ease-in-out duration-300 hover:bg-white/30 px-2 md:px-3 mb-2 mr-2 last:mr-0 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)]"
    target="_blank" rel="noopener"
  >
    <Icon :name="icon" size="16" />
    <span v-html="title" class="ml-2" />
  </NuxtLink>
</template>

<style lang="scss"></style>
