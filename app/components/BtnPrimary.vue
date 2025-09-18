<script setup lang="ts">
import { computed } from 'vue'

// TODO: використовувати to замість url, iconify замість icon
const props = defineProps<{
  url?: string
  icon?: string
  img?: string
  svg?: string
  title?: string
}>()

const url = props.url ?? ''
const icon = props.icon ?? false
const img = props.img ?? false
const svg = props.svg ?? false
const title = props.title ?? ''

// Treat absolute URLs as external links
const isExternal = computed(() => url.startsWith('https://'))
</script>

<template>
  <NuxtLink
    :to="url"
    class="transition-background ease-in-out duration-300 inline-flex items-center h-[36px] md:h-[42px] text-[12px] md:text-[15px] tracking-tighter rounded-md border hover:bg-white/30 px-3 md:px-4 mb-2 mr-2 last:mr-0 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] backdrop-blur-sm"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener' : undefined"
    v-wave
  >
    <Icon class="mr-2" v-if="icon" :name="icon" size="19" />
    <img class="mr-2" v-if="img" :src="img" :alt="img + ' icon'" width="19" height="19">
    <span class="mr-2" v-if="svg" v-html="svg" />

    <span class="mr-0" v-if="title" v-html="title" />
  </NuxtLink>
</template>
