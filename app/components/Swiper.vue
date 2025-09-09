<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/scss/keyboard';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
import 'swiper/scss/mousewheel';
import { ref, watch, nextTick } from 'vue'
import {
  FreeMode,
  Navigation,
  Keyboard,
  Pagination,
  Mousewheel
} from 'swiper/modules';

const modules = [
  FreeMode,
  Keyboard,
  Navigation,
  Pagination,
  Mousewheel ,
];

const props = defineProps<{
  title?: string
  category?: string
  list?: any[]
  centeredSlidesBounds?: boolean
  centerInsufficientSlides?: boolean
  activeSlug?: string | null
}>()

const swiperRef = ref<any | null>(null)
function onSwiper(sw: any) {
  swiperRef.value = sw
  // try centering on first init
  nextTick(() => slideToActiveSlug())
}

function slideToActiveSlug() {
  if (!swiperRef.value) return
  const slug = props.activeSlug || ''
  if (!slug) return
  const list = props.list || []
  const idx = list.findIndex((it: any) => it?.slug === slug)
  if (idx >= 0) {
    swiperRef.value.slideTo(idx, 0)
  }
}

watch(() => [props.activeSlug, (props.list || []).length], () => {
  slideToActiveSlug()
})
</script>

<template>
  <div :class="[
    'overflow-hidden relative',
    'swiper-' + category,
    ]"
  >

    <ClientOnly>

      <div class="my-1 md:my-2">
        <div class="text-[12px] md:text-[18px]">{{ title }}</div>

        <div :class="[
          'swiper-pagination',
          'swiper-pagination-' + category,
        ]"></div>
      </div>

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
          nextEl: '.swiper-button-prev',
          prevEl: '.swiper-button-next',
          disabledClass: 'swiper-button-disabled',
        }"
        :pagination="{
          enabled: true,
          el: '.swiper-pagination-' + category,
          type: 'fraction',
        }"
        :slidesOffsetBefore="0"
        :slidesOffsetAfter="0"
        :keyboard="{
          enabled: true,
        }"
      >

        <SwiperSlide
          v-for="(i, idx) in list"
          :key="idx"
        >
          <Item
            :category="category"
            :i="i"
          />
        </SwiperSlide>

        <button
          class="swiper-button-next"
          v-wave
        >
          <Icon
            name="fa7-solid:chevron-circle-left"
            size="44"
            class="block"
          />
        </button>

        <button
          class="swiper-button-prev"
          v-wave
        >
          <Icon
            name="fa7-solid:chevron-circle-right"
            size="44"
            class="block"
          />
        </button>
      </Swiper>

    </ClientOnly>

  </div>
</template>

<style>
.swiper { @apply overflow-visible static }
.swiper-slide { @apply w-[auto] }

.swiper-pagination { @apply text-[8px] md:text-[12px] leading-none text-white/50 }
.swiper-button-next,
.swiper-button-prev { @apply transition-colors ease-in-out duration-300 cursor-pointer absolute top-[0px] h-[100%] z-10 text-white/40 hover:text-white/80 hover:bg-white/5 hover:backdrop-blur-sm hidden md:block p-4 }
.swiper-button-next { @apply left-[0px] }
.swiper-button-prev { @apply right-[0px] }
.swiper-button-disabled { @apply text-white/5 pointer-events-none }
</style>
