<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  to?: string
  iconify?: string
  img?: string
  svg?: string
  title?: string
}>()

const to = computed(() => props.to?.trim() || '')
const iconify = computed(() => props.iconify?.trim() || '')
const img = computed(() => props.img ?? false)
const svg = computed(() => props.svg ?? false)
const title = computed(() => props.title ?? '')

// Визначаємо зовнішні посилання: http/https, mailto, tel тощо
const isExternal = computed(() => /^(https?:|mailto:|tel:)/i.test(to.value))
const openInNewTab = computed(() => /^https?:/i.test(to.value))
</script>

<template>
  <NuxtLink
    v-if="to && !isExternal"
    :to="to"
    class="transition-background ease-in-out duration-300 inline-flex items-center h-[36px] md:h-[42px] text-[12px] md:text-[15px] tracking-tighter rounded-md border hover:bg-white/30 px-3 md:px-4 mb-2 mr-2 last:mr-0 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] backdrop-blur-sm"
    v-wave
  >
    <Icon class="mr-2" v-if="iconify" :name="iconify" size="19" />
    <img class="mr-2" v-if="img" :src="img" :alt="img + ' icon'" width="19" height="19">
    <span class="mr-2" v-if="svg" v-html="svg" />

    <span class="mr-0" v-if="title" v-html="title" />
  </NuxtLink>
  <a
    v-else-if="to"
    :href="to"
    class="transition-background ease-in-out duration-300 inline-flex items-center h-[36px] md:h-[42px] text-[12px] md:text-[15px] tracking-tighter rounded-md border hover:bg-white/30 px-3 md:px-4 mb-2 mr-2 last:mr-0 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] backdrop-blur-sm"
    :target="openInNewTab ? '_blank' : undefined"
    :rel="openInNewTab ? 'noopener' : undefined"
    v-wave
  >
    <Icon class="mr-2" v-if="iconify" :name="iconify" size="19" />
    <img class="mr-2" v-if="img" :src="img" :alt="img + ' icon'" width="19" height="19">
    <span class="mr-2" v-if="svg" v-html="svg" />

    <span class="mr-0" v-if="title" v-html="title" />
  </a>
</template>
