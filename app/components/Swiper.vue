<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/keyboard'
import 'swiper/css/mousewheel'
import { FreeMode, Navigation, Keyboard, Pagination, Mousewheel } from 'swiper/modules'
import type { Swiper as SwiperInstance } from 'swiper/types'

const modules = [FreeMode, Keyboard, Navigation, Pagination, Mousewheel] as const

const props = withDefaults(defineProps<{
  title?: string
  category?: string
  list?: any[]
  centeredSlidesBounds?: boolean
  centerInsufficientSlides?: boolean
  activeSlug?: string | null
  /** якшо true — на старті вирівнюємо зліва і чекаємо першу взаємодію */
  startLeft?: boolean
}>(), {
  title: '',
  category: '',
  list: () => [],
  centeredSlidesBounds: false,
  centerInsufficientSlides: false,
  activeSlug: '',
  startLeft: false,
})

const swiperRef = ref<SwiperInstance | null>(null)

// керуємо опціями у рантаймі
const centered = ref(!props.startLeft)
const slideToClick = ref(!props.startLeft)

function onSwiper(s: SwiperInstance) {
  swiperRef.value = s
  nextTick(() => slideToActiveSlug())
}

function slideToActiveSlug() {
  const s = swiperRef.value
  if (!s) return
  const slug = props.activeSlug || ''
  if (!slug) return
  const idx = (props.list || []).findIndex((it: any) => it?.slug === slug)
  if (idx >= 0) s.slideTo(idx, 0)
}

// вмикаємо центрування лише один раз — на першій взаємодії
function enableCenteringOnce() {
  if (centered.value) return
  const s = swiperRef.value
  if (!s) return

  centered.value = true
  slideToClick.value = true

  // оновити параметри Swiper "на льоту"
  s.params.centeredSlides = true
  s.params.slideToClickedSlide = true
  s.update()

  // якщо це клік по слайду — одразу центруємо клікнутий
  if (s.clickedIndex != null && s.clickedIndex >= 0) {
    s.slideTo(s.clickedIndex, 0)
  } else {
    // для навігаційних кнопок/скролу/клавіатури просто
    // перерендеримо поточний активний з урахуванням center
    s.slideTo(s.activeIndex ?? 0, 0)
  }
}

// коли міняється активний slug або приходить список
watch(() => [props.activeSlug, (props.list || []).length], () => nextTick(slideToActiveSlug))
</script>

<template>
  <div
    class="overflow-hidden"
    :class="['transition-all ease duration-200 delay-200 relative overflow-hidden h-[174px] md:h-[284px]', 'swiper-' + (category || '')]"
  >
    <div class="mt-3 md:mt-5 text-lg md:text-2xl">{{ title }}</div>

    <ClientOnly>
      <div :class="['swiper-pagination mb-3 md:mb-5', 'swiper-pagination-' + (category || '')]" />

      <Swiper
        :modules="modules"
        @swiper="onSwiper"

        :enabled="true"
        :slides-per-view="'auto'"
        :space-between="0"

        :free-mode="{ enabled: true, sticky: true }"

        :centered-slides="centered"
        :slide-to-clicked-slide="slideToClick"
        :centered-slides-bounds="centeredSlidesBounds"
        :center-insufficient-slides="centerInsufficientSlides"

        :mousewheel="{ enabled: true, forceToAxis: true, sensitivity: 3, thresholdDelta: 100 }"
        :keyboard="{ enabled: true }"
        :navigation="{
          enabled: true,
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
          disabledClass: 'swiper-button-disabled',
        }"
        :pagination="{
          enabled: true,
          el: '.swiper-pagination-' + (category || ''),
          type: 'fraction',
        }"
        :speed="300"
        :css-mode="false"

        @click="enableCenteringOnce"
        @touchStart="enableCenteringOnce"
        @keyPress="enableCenteringOnce"
        @wheel.passive="enableCenteringOnce"
      >
        <SwiperSlide v-for="i in list" :key="i.slug">
          <Item :category="category" :i="i" />
        </SwiperSlide>

        <button class="swiper-button-next" v-wave @click="enableCenteringOnce" />
        <button class="swiper-button-prev" v-wave @click="enableCenteringOnce" />
      </Swiper>
    </ClientOnly>
  </div>
</template>

<style lang="scss">
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
