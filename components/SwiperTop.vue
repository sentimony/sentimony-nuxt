<template>
  <div class="swiper-list">
    <div v-if="title" class="title">{{ title }}</div>

    <swiper
      :class="{ 'swiper swiperTop': true, isShown }"
      :options="swiperOption"
    >
      <swiper-slide
        :class="'item ' + rectangle()"
        v-for="(i, index) in list"
        :key="index"
        v-if="i.visible"
      >
        <router-link
          v-if="i.slug"
          :to="'../../' + item + '/' + i.slug + '/'"
          class="item__link"
          active-class="is-selected"
        >
          <div class="item__wrapper">
            <div class="item__cover">
              <img
                v-if="i.cover_th"
                class="item__img swiper-lazy"
                :src="i.cover_th"
                :alt="i.title"
              />
              <img
                v-if="i.photo_th"
                class="item__img swiper-lazy"
                :src="i.photo_th"
                :alt="i.title"
              />
              <div
                v-if="!i.cover_xl && !i.photo_xl"
                class="item__soon"
                v-html="coming()"
              />
            </div>
            <div v-if="i.coming_soon" class="item__status--green">
              Coming Soon
            </div>
            <div v-if="i.new" class="item__status--red">Out Now</div>
          </div>
          <div v-if="i.title" class="item__title">{{ i.title }}</div>
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
  }
</style>
