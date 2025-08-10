<template>
  <div class="swiper-list">
    <style type="text/tailwindcss">
      .swiper-wrapper {
        @apply flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px];
      }
      /* .swiperTop .swiper-container {
        @apply overflow-visible;
      } */
    </style>
    <div v-if="title" class="title">{{ title }}</div>

    <swiper
      :class="{ 'swiper swiperTop': true, isShown }"
      :options="swiperOption"
    >
      <swiper-slide
        :class="'item w-[76px] md:w-[180px] ' + rectangle()"
        v-for="(i, index) in list"
        :key="index"
        v-if="i.visible"
      >
        <router-link
          v-ripple
          class="item__link block group"
          active-class="is-selected"
          v-if="i.slug"
          :to="'../../' + item + '/' + i.slug + '/'"
        >
          <div class="item__cover relative mb-[4px] flex items-center justify-center w-[70px] md:w-[140px] h-[70px] md:h-[140px] mx-auto rounded-[2px] transition-[background-color] duration-200 ease-in-out group-hover:bg-white/30">
            <div class="w-[60px] md:w-[120px] h-[60px] md:h-[120px] shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] text-left rounded-[2px] bg-black/50">
              <img
                v-if="i.cover_th"
                class="item__img swiper-lazy block rounded-[2px] swiper-lazy"
                :src="i.cover_th"
                :alt="i.title + ' Small Thumbnail'"
              />
              <img
                v-if="i.photo_th"
                class="item__img swiper-lazy block rounded-[2px] swiper-lazy"
                :src="i.photo_th"
                :alt="i.title + ' Small Thumbnail'"
              />
              <div
                v-if="!i.cover_xl && !i.photo_xl"
                class="item__soon text-[7px]/[1.25] md:text-[10px]/[1.5] py-[0.3em] px-[0.5em] md:py-[0.6em] md:px-[1em] text-white/50"
                v-html="coming()"
              />
            </div>
            <div v-if="i.coming_soon" class="item__status--green text-[7px] md:text-[10px] absolute top-[-5px] md:top-[0] right-[-5px] md:right-[0] bg-green-600 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] px-[.8em] py-[.2em]">Coming Soon</div>
            <div v-if="i.new" class="item__status--red text-[7px] md:text-[10px] absolute top-[-5px] md:top-[0] right-[-5px] md:right-[0] bg-red-600 shadow-[0_2px_10px_0_rgba(0,0,0,0.5)] px-[.8em] py-[.2em]">Out Now</div>
          </div>
          <div class="item__title text-[8px] md:text-[12px] mb-[.5rem] px-[2px]">{{ i.title }}</div>
        </router-link>
      </swiper-slide>
      <!-- <div class="swiper-pagination" slot="pagination"></div> -->
      <div class="swiper-button-next" slot="button-next"></div>
      <div class="swiper-button-prev" slot="button-prev"></div>
      <!-- <div class="swiper-scrollbar" slot="scrollbar"></div> -->
    </swiper>
  </div>
</template>

<script>
  import AppContent from '~/plugins/app-content'

  export default {
    props: ['title', 'list', 'category', 'item'],
    data() {
      return {
        isShown: false,
        texts: AppContent.texts,
        swiperOption: {
          lazy: true,
          // scrollbar: {
          //   el: '.swiper-scrollbar',
          //   hide: true
          // },
          mousewheelControl: true,
          mousewheelForceToAxis: true,
          freeMode: true,
          slidesPerView: 'auto',
          speed: 350,
          // slidesPerGroup: 4,
          slideToClickedSlide: true,
          centeredSlides: true,
          //  pagination: {
          //   el: '.swiper-pagination',
          //   clickable: true
          // },
          navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev'
          }
        }
      }
    },
    mounted() {
      setTimeout(() => {
        this.isShown = true
      }, 1000)
    },
    methods: {
      coming(category) {
        return this.category == 'artists' ? this.texts.comingPhoto : this.texts.comingCover
      },
      rectangle(category) {
        return this.category == 'videos' ? 'item--rectangle' : ''
      }
    }
  }
</script>

<style lang="scss">
  .swiperTop {
    opacity: 0;
    // filter: blur(4px);
    // backdrop-filter: blur(2px);
    transition: opacity 0.4s ease;

    &.isShown {
      opacity: 1;
      // filter: blur(0px);
    }

    // & .swiper-wrapper {
    //   @apply flex flex-wrap justify-center w-full pb-[30px] md:pb-[60px];
    // }
  }

  // .swiper-container {
  //   overflow: visible;
  // }
</style>
