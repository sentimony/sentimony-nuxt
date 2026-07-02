<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/keyboard'
import 'swiper/css/mousewheel'
import { ref, watch, nextTick, computed } from 'vue'
import {
  FreeMode,
  Navigation,
  Keyboard,
  Pagination,
  Mousewheel
} from 'swiper/modules'

const modules = [FreeMode, Keyboard, Navigation, Pagination, Mousewheel]

import type { ItemCategory, ItemEntity } from '~/types'

interface ArtistSection {
  label: string
  list: ItemEntity[]
}

const props = defineProps<{
  title?: string
  category?: ItemCategory
  list?: ItemEntity[]
  sections?: ArtistSection[]
  centeredSlidesBounds?: boolean
  centerInsufficientSlides?: boolean
  activeSlug?: string | null
  pagination?: boolean
}>()

const swiperRef = ref<any | null>(null)
function onSwiper(sw: any) {
  swiperRef.value = sw
  nextTick(() => slideToActiveSlug())
}

function slideToActiveSlug() {
  if (!swiperRef.value) return
  const slug = props.activeSlug || ''
  if (!slug) return

  if (props.sections) {
    let idx = 0
    for (const [si, section] of props.sections.entries()) {
      if (si > 0) idx++
      const found = section.list.findIndex((it: any) => it?.slug === slug)
      if (found >= 0) {
        swiperRef.value.slideTo(idx + found, 0)
        return
      }
      idx += section.list.length
    }
  } else {
    const list = props.list || []
    const idx = list.findIndex((it: any) => it?.slug === slug)
    if (idx >= 0) swiperRef.value.slideTo(idx, 0)
  }
}

const totalLength = computed(() =>
  props.sections
    ? props.sections.reduce((acc, s) => acc + s.list.length, 0)
    : (props.list || []).length
)

watch(() => [props.activeSlug, totalLength.value], () => {
  slideToActiveSlug()
})
</script>

<template>
  <div class="overflow-hidden"
    :class="['relative overflow-hidden h-[174px] md:h-[284px] lg:h-[292px] ', 'swiper-' + category]"
  >

    <div :class="[
      pagination ? 'mt-3 md:mt-5 text-lg md:text-2xl' : 'text-2xl md:text-4xl my-4 md:my-6'
    ]">{{ title }}</div>

    <ClientOnly>


        <div :class="[
          'swiper-pagination mb-3 md:mb-5',
          'swiper-pagination-' + category
        ]" />
      <!-- </div> -->

      <!-- <div class="text-[18px] md:text-[32px] my-[.5em] mb-4">{{ title }}</div> -->

      <Swiper
        :enabled="true"
        :mousewheel="{
          enabled: true,
          forceToAxis: true,
          sensitivity: 3,
          thresholdDelta: 100,
        }"
        :slides-per-view="'auto'"
        :space-between="0"
        :free-mode="{
          enabled: true,
          sticky: true,
        }"
        :modules="modules"
        @swiper="onSwiper"
        :speed="300"
        :centeredSlides="true"
        :slideToClickedSlide="true"
        :centeredSlidesBounds="centeredSlidesBounds"
        :centerInsufficientSlides="centerInsufficientSlides"
        :cssMode="false"
        :navigation="{
          enabled: true,
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
          disabledClass: 'swiper-button-disabled',
        }"
        :pagination="{
          enabled: pagination ?? false,
          el: '.swiper-pagination-' + category,
          type: 'fraction',
        }"
        :slidesOffsetBefore="0"
        :slidesOffsetAfter="0"
        :keyboard="{
          enabled: true,
        }"
      >

        <template v-if="sections">
          <template v-for="(section, si) in sections" :key="section.label">
            <SwiperSlide
              v-if="si > 0"
              class="!pointer-events-none select-none"
              style="width: 2.5rem"
            >
              <div class="h-full flex flex-col items-center justify-center px-1 text-foreground/25">
                <div class="w-px flex-1 bg-current" />
                <span
                  class="text-[8px] tracking-widest uppercase py-2"
                  style="writing-mode: vertical-rl; transform: rotate(180deg)"
                >{{ section.label }}</span>
                <div class="w-px flex-1 bg-current" />
              </div>
            </SwiperSlide>
            <SwiperSlide
              v-for="i in section.list"
              :key="i.slug"
            >
              <Item :category="category" :i="i" />
            </SwiperSlide>
          </template>
        </template>
        <template v-else>
          <SwiperSlide
            v-for="i in list"
            :key="i.slug"
          >
            <Item :category="category" :i="i" />
          </SwiperSlide>
        </template>

        <button
          class="swiper-button-next"
          v-wave
        />

        <button
          class="swiper-button-prev"
          v-wave
        />
      </Swiper>

    </ClientOnly>
  </div>
</template>

<style>
@reference "../assets/css/tailwind.css";

.swiper { @apply overflow-visible static }
.swiper-slide { @apply w-[auto] }

.swiper-pagination { @apply text-xs/3 md:text-sm/4 text-foreground/50 }

.swiper-button-prev,
.swiper-button-next { @apply transition-colors ease-in-out duration-300 cursor-pointer absolute top-[0px] h-[100%] z-10 text-foreground/40 hover:text-foreground/80 hover:bg-black/5 dark:hover:bg-white/5 hover:backdrop-blur-sm hidden md:block p-4 }
.swiper-button-prev { @apply left-0 }
.swiper-button-next { @apply right-0 }

.swiper-button-prev svg,
.swiper-button-next svg { @apply size-6 }
.swiper-button-prev svg { @apply rotate-[180deg] }

.swiper-button-disabled { @apply text-foreground/10 pointer-events-none }
</style>
