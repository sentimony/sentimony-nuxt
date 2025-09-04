<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/css';
// import 'swiper/css/free-mode'; 
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
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

defineProps<{
  title?: string
  category?: string
  list?: any[]
}>()
</script>

<template>
  <div class="h-[164px] md:h-[260px] overflow-hidden">

    <div class="mt-[.4em] mb-[.3  em] md:mt-[.6em] md:mb-[.5em]">
      <div class="text-[12px] md:text-[18px]">{{ title }}</div>

      <div :class="[
        'swiper-pagination',
        'swiper-pagination-' + category,
      ]"></div>
    </div>

    <ClientOnly>

      <Swiper
        :mousewheel="{ 
          enabled: true,
          forceToAxis: true,
          sensitivity: 3,
        }"
        :slides-per-view="'auto'"
        :space-between="0"
        :free-mode="{ 
          enabled: true,
          sticky: true,
        }"
        :modules="modules"
        :speed="300"
        :slideToClickedSlide="true"
        :centeredSlides="true"
        :centeredSlidesBounds="false"
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
        :coverflowEffect="{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }"
        :slidesOffsetBefore="0"
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

        <Icon 
          name="fa7-solid:chevron-circle-left" 
          size="44"
          class="swiper-button-next"
        />
        <Icon 
          name="fa7-solid:chevron-circle-right" 
          size="44" 
          class="swiper-button-prev"
        />

      </Swiper>
    </ClientOnly>

  </div>
</template>

<style>
.swiper { @apply overflow-visible }
.swiper-slide { @apply w-[76px] md:w-[180px] }

.swiper-pagination { @apply text-[8px] md:text-[12px] leading-none text-white/50 }

.swiper-button-next { @apply transition-[color] ease-in-out duration-300 cursor-pointer absolute top-[48px] left-[6px] size-[44px] z-10 text-white/50 hover:text-white/100 hidden md:inline-block }
.swiper-button-prev { @apply transition-[color] ease-in-out duration-300 cursor-pointer absolute top-[48px] right-[6px] size-[44px] z-10 text-white/50 hover:text-white/100 hidden md:inline-block }
.swiper-button-disabled { @apply text-white/10 pointer-events-none }
</style>
