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
  <div class="overflow-hidden relative">

    <ClientOnly>

      <div class="my-1 md:my-2">
        <div class="text-[12px] md:text-[18px]">{{ title }}</div>

        <div :class="[
          'swiper-pagination',
          'swiper-pagination-' + category,
        ]"></div>    
      </div>

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
.swiper-button-prev { @apply transition-colors ease-in-out duration-300 cursor-pointer absolute top-[0px] h-[100%] z-10 text-white/50 hover:text-white/100 hover:bg-white/10 hover:backdrop-blur-sm hidden md:block p-4 }

.swiper-button-next { @apply left-[0px] }
.swiper-button-prev { @apply right-[0px] }
.swiper-button-disabled { @apply text-white/10 pointer-events-none }
</style>
