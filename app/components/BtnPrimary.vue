<script setup lang="ts">
const props = defineProps<{
  url?: string
  icon?: string
  title?: string
}>()

const url = props.url ?? ''
const icon = props.icon ?? ''
const title = props.title ?? ''
</script>

<template>
  <NuxtLink
    :to="url"
    class="inline-flex items-center h-[36px] md:h-[42px] text-[12px] md:text-[15px] tracking-tighter rounded-md border transition-background ease-in-out duration-300 hover:bg-white/30 px-3 md:px-4 mb-2 mr-2 last:mr-0 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] backdrop-blur-sm"
    target="_blank" rel="noopener"
    v-wave
  >
    <Icon :name="icon" size="18" />
    <span v-html="title" class="ml-2" />
  </NuxtLink>
</template>
