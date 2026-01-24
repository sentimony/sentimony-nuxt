<script setup lang="ts">
import type { Tag } from '~/types'

defineProps<{
  tag: Tag
}>()

// Convert country code to flag emoji
function countryCodeToFlag(code: string): string {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
</script>

<template>
  <NuxtLink
    class="w-[80px] md:w-[180px] block group rounded-sm py-1 md:py-3 mt-[-0.25rem] md:mt-[-0.75rem]"
    :to="'/tag/' + tag.slug"
    v-slot="{ isActive }"
    v-wave
  >
    <div
      class="relative mb-[4px] flex items-center justify-center w-[70px] md:w-[140px] h-[70px] md:h-[140px] mx-auto rounded-sm transition-[background-color] duration-200 ease-in-out group-hover:bg-white/30"
      :class="isActive ? 'bg-white/20' : ''"
    >
      <div class="size-[60px] md:size-[120px] shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] rounded-sm bg-black/50 flex items-center justify-center">
        <!-- Tag image if available -->
        <img
          v-if="tag.image_url"
          class="rounded-sm size-[60px] md:size-[120px] object-cover"
          :src="tag.image_url"
          :alt="tag.title"
          loading="lazy"
        >
        <!-- Country flag for countries -->
        <span
          v-else-if="tag.country_code"
          class="text-[32px] md:text-[64px] leading-none"
        >
          {{ countryCodeToFlag(tag.country_code) }}
        </span>
        <!-- Default icon based on type -->
        <Icon
          v-else-if="tag.type?.slug === 'musicians'"
          name="mdi:account-music"
          class="text-[32px] md:text-[64px] text-white/50"
        />
        <Icon
          v-else-if="tag.type?.slug === 'styles'"
          name="mdi:music-note"
          class="text-[32px] md:text-[64px] text-white/50"
        />
        <Icon
          v-else
          name="mdi:tag"
          class="text-[32px] md:text-[64px] text-white/50"
        />
      </div>
    </div>

    <div class="line-clamp-2 tracking-tight text-center">{{ tag.title }}</div>
  </NuxtLink>
</template>
