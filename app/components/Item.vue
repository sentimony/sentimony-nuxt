<script setup lang="ts">
import type { ItemEntity, ItemCategory } from '~/types'

defineProps<{
  i: ItemEntity
  category?: ItemCategory
}>()
</script>

<template>

  <NuxtLink
    class="w-[80px] md:w-[180px] block group rounded-sm py-1 md:py-3 mt-[-0.25rem] md:mt-[-0.75rem]"
    :to="'/' + category + '/' + i.slug"
    v-slot="{ isActive }"
    v-wave
  >

    <div
      class="relative mb-[4px] flex items-center justify-center w-[70px] md:w-[140px] h-[70px] md:h-[140px] mx-auto rounded-sm transition-[background-color] duration-200 ease-in-out group-hover:bg-white/30"
      :class="isActive ? 'bg-white/20' : ''"
    >
      <div class="size-[60px] md:size-[120px] shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] text-left rounded-sm bg-black/50">
        <img
          class="rounded-sm size-[60px] md:size-[120px] object-cover"
          v-if="i.cover_th"
          :src="i.cover_th"
          :alt="i.title + ' Cover Thumbnail'"
          loading="lazy"
        >
        <!-- <div v-else class="text-[7px]/[1.25] md:text-[10px]/[1.5] py-[0.3em] px-[0.5em] md:py-[0.6em] md:px-[1em] text-white/50" v-html="texts.comingCover"/> -->
        <img
          class="rounded-sm size-[60px] md:size-[120px] object-cover"
          v-if="i.photo_th"
          :src="i.photo_th"
          :alt="i.title + ' Photo Thumbnail'"
          loading="lazy"
        >
        <!-- <img
          class="rounded-sm size-[60px] md:size-[120px] object-cover"
          v-if="i.artwork_th"
          :src="i.artwork_th"
          :alt="i.title + ' Artwork Thumbnail'"
        /> -->
        <img
          class="rounded-sm size-[60px] md:size-[120px] object-cover"
          v-if="i.flyer_a_xl"
          :src="i.flyer_a_xl"
          :alt="i.title + ' Flyer Thumbnail'"
          loading="lazy"
        />
        <!-- <div class="swiper-lazy-preloader"></div> -->
        <!-- <div v-else class="text-[7px]/[1.25] md:text-[10px]/[1.5] py-[0.3em] px-[0.5em] md:py-[0.6em] md:px-[1em] text-white/50" v-html="texts.comingPhoto"/> -->
      </div>
      <div v-if="i.coming_soon" class="text-[8px] md:text-[10px] leading-none absolute top-[-3px] md:top-[0] right-[-3px] md:right-[0] bg-green-600 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] p-1 rounded-tr-sm rounded-bl-sm">Coming Soon</div>
      <div v-if="i.new" class="text-[8px] md:text-[10px] leading-none absolute top-[-3px] md:top-[0] right-[-3px] md:right-[0] bg-red-600 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] p-1 rounded-tr-sm rounded-bl-sm">Out Now</div>
    </div>

    <div class="line-clamp-2 tracking-tight">{{ i.title }}</div>

  </NuxtLink>

</template>
