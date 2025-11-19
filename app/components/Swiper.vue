<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/keyboard'
// import 'swiper/css/navigation'
// import 'swiper/css/pagination'
import 'swiper/css/mousewheel'
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import {
  FreeMode,
  Navigation,
  Keyboard,
  Pagination,
  Mousewheel
} from 'swiper/modules'

const modules = [
  FreeMode,
  Keyboard,
  Navigation,
  Pagination,
  Mousewheel,
]

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


// timer
// import { ref, onMounted, onBeforeUnmount } from 'vue'

// const isShown = ref(false)
// let timer: ReturnType<typeof setTimeout> | null = null

// onMounted(() => {
//   timer = setTimeout(() => {
//     isShown.value = true
//   }, 1000)
// })

// onBeforeUnmount(() => {
//   if (timer) clearTimeout(timer)
// })
</script>

<template>
  <div class="overflow-hidden"
    :class="['relative overflow-hidden h-[174px] md:h-[284px] lg:h-[292px] ', 'swiper-' + category]"
  >

      <!-- <div class="my-3 md:my-5"> -->
        <div class="mt-3 md:mt-5 text-lg md:text-2xl">{{ title }}</div>

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
          v-for="i in list"
          :key="i.slug"
        >
          <!-- <div>{{ i.slug }}</div> -->
          <Item
            :category="category"
            :i="i"
          />
        </SwiperSlide>

        <button
          class="swiper-button-next"
          v-wave
        >
          <!-- <Icon
            name="fa7-solid:chevron-circle-left"
            size="44"
            class="block"
          /> -->
        </button>

        <button
          class="swiper-button-prev"
          v-wave
        >
          <!-- <Icon
            name="fa7-solid:chevron-circle-right"
            size="44"
            class="block"
          /> -->
        </button>
      </Swiper>

    </ClientOnly>
  </div>
</template>

<style>
.swiper { @apply overflow-visible static }
.swiper-slide { @apply w-[auto] }

.swiper-pagination { @apply text-xs/3 md:text-sm/4 text-white/50 }

.swiper-button-prev,
.swiper-button-next { @apply transition-colors ease-in-out duration-300 cursor-pointer absolute top-[0px] h-[100%] z-10 text-white/40 hover:text-white/80 hover:bg-white/5 hover:backdrop-blur-sm hidden md:block p-4 }
.swiper-button-prev { @apply left-0 }
.swiper-button-next { @apply right-0 }

.swiper-button-prev svg,
.swiper-button-next svg { @apply size-6 }
.swiper-button-prev svg { @apply rotate-[180deg] }

.swiper-button-disabled { @apply text-white/5 pointer-events-none }
</style>
