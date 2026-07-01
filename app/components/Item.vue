<script setup lang="ts">
import type { ItemEntity, ItemCategory } from '~/types'

const props = defineProps<{
  i: ItemEntity
  category?: ItemCategory
}>()

const aspectClass = computed(() =>
  props.category === 'video' ? 'aspect-video'
    : props.category === 'event' ? 'aspect-[440/620]'
      : 'aspect-square'
)
const imgWidth = computed(() =>
  props.category === 'video' ? 240 : props.category === 'event' ? 220 : 120
)
const imgHeight = computed(() =>
  props.category === 'video' ? 135 : props.category === 'event' ? 310 : 120
)
</script>

<template>

  <NuxtLink
    class="w-20 md:w-40 block group rounded-sm py-1 md:py-3 -mt-1 md:-mt-3"
    :to="'/' + category + '/' + i.slug"
    v-slot="{ isActive }"
    v-wave
  >

    <div
      class="relative flex items-center justify-center w-17.5 md:w-35 p-1.25 md:p-2.5 mx-auto rounded-sm transition-[background-color] duration-200 ease-in-out group-hover:bg-black/10 dark:group-hover:bg-white/30 mb-1"
      :class="isActive ? 'bg-black/10 dark:bg-white/20' : ''"
    >
      <div
        class="w-15 md:w-30 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] text-left rounded-sm bg-black/50 overflow-hidden"
        :class="aspectClass"
      >
        <NuxtImg
          class="rounded-sm w-full h-full object-cover"
          v-if="i.cover_xl"
          :src="i.cover_xl"
          :alt="i.title + ' Cover Thumbnail'"
          :width="imgWidth"
          :height="imgHeight"
          sizes="70px md:140px"
          densities="1x 2x"
          fit="cover"
          format="webp"
          loading="lazy"
        />
        <!-- <div v-else class="text-[7px]/[1.25] md:text-[10px]/[1.5] py-[0.3em] px-[0.5em] md:py-[0.6em] md:px-[1em] text-white/50" v-html="texts.comingCover"/> -->
        <NuxtImg
          class="rounded-sm w-full h-full object-cover"
          v-if="i.photo_xl"
          :src="i.photo_xl"
          :alt="i.title + ' Photo Thumbnail'"
          :width="imgWidth"
          :height="imgHeight"
          sizes="70px md:140px"
          densities="1x 2x"
          fit="cover"
          format="webp"
          loading="lazy"
        />
        <!-- <img
          class="rounded-sm w-full h-full object-cover"
          v-if="i.artwork_th"
          :src="i.artwork_th"
          :alt="i.title + ' Artwork Thumbnail'"
        /> -->
        <NuxtImg
          class="rounded-sm w-full h-full object-cover"
          v-if="i.flyer_a_xl"
          :src="i.flyer_a_xl"
          :alt="i.title + ' Flyer Thumbnail'"
          :width="imgWidth"
          :height="imgHeight"
          sizes="70px md:140px"
          densities="1x 2x"
          fit="cover"
          format="webp"
          loading="lazy"
        />
        <!-- <div class="swiper-lazy-preloader"></div> -->
        <!-- <div v-else class="text-[7px]/[1.25] md:text-[10px]/[1.5] py-[0.3em] px-[0.5em] md:py-[0.6em] md:px-[1em] text-white/50" v-html="texts.comingPhoto"/> -->
      </div>
      <div v-if="i.coming_soon" class="text-white text-[8px] md:text-[10px] leading-none absolute -top-0.75 md:top-0 -right-0.75 md:right-0 bg-green-600 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] p-1 rounded-tr-sm rounded-bl-sm">Coming Soon</div>
      <div v-if="i.new" class="text-white text-[8px] md:text-[10px] leading-none absolute -top-0.75 md:top-0 -right-0.75 md:right-0 bg-red-600 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] p-1 rounded-tr-sm rounded-bl-sm">Out Now</div>
      <!-- <div v-if="i.category_id" class="text-white text-[8px] md:text-[10px] leading-none absolute -top-0.75 md:top-0 -right-0.75 md:right-0 bg-red-600 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] p-1 rounded-tr-sm rounded-bl-sm">{{ i.category_id }}</div> -->
    </div>

    <div class="line-clamp-2 tracking-tight text-center">{{ i.title }}</div>


  </NuxtLink>

</template>
