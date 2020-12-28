<template>
  <div class="swiper-list">
    <div v-if="title" class="title">{{ title }}</div>

    <swiper class="swiper" :options="swiperOption">
      <swiper-slide
        class="item"
        v-for="(i, index) in list"
        :key="index"
        v-if="i.visible"
      >
        <router-link v-if="i.slug" :to="'../../' + item + '/' + i.slug + '/'" class="item__link" active-class="is-selected">
          <div class="item__wrapper">
            <div class="item__cover">
              <div v-if="i.cover || i.photo_xl || i.photo" class="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
              <img v-if="i.photo_xl" class="item__img swiper-lazy"
                :src="i.photo_xl"
                :alt="i.title"
              >
              <img v-if="i.cover || !i.photo_xl && i.photo" class="item__img swiper-lazy"
                :src="'https://content.sentimony.com/assets/img/' + category + '/small/' + i.slug + '.jpg'"
                :srcset="'https://content.sentimony.com/assets/img/' + category + '/small/' + i.slug + '.jpg 1x, https://content.sentimony.com/assets/img/' + category + '/small-retina/' + i.slug + '.jpg 2x'"
                :alt="i.title + ' Small Thumbnail'"
              >
              <div v-if="i.cover || !i.photo_xl && !i.photo"
                class="item__soon"
                v-html="coming()"
              />
            </div>
            <div v-if="i.coming_soon" class="item__status--green">Coming Soon</div>
            <div v-if="i.new" class="item__status--red">Out Now</div>
          </div>
          <div v-if="i.title" class="item__title">{{ i.title }}</div>
        </router-link>
      </swiper-slide>
      <!-- <div class="swiper-pagination" slot="pagination"></div> -->

      <div v-if="loading">Loading...</div>
      <div v-else v-swiper:mySwiper="swiperOption">
        <div class="swiper-wrapper">
          <div class="swiper-slide item"
            v-for="(i, index) in releasesStore"
            :key="index"
          >
            <router-link v-if="i.slug" :to="'/release/' + i.slug + '/'" class="item__link" active-class="is-selected">
              <div class="item__wrapper">
                <div class="item__cover">
                  <div v-if="i.cover" class="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
                  <img v-if="i.cover" class="item__img swiper-lazy"
                    :src="'https://content.sentimony.com/assets/img/releases/small/' + i.slug + '.jpg'"
                    :srcset="'https://content.sentimony.com/assets/img/releases/small/' + i.slug + '.jpg 1x, https://content.sentimony.com/assets/img/releases/small-retina/' + i.slug + '.jpg 2x'"
                    :alt="i.title + ' Small Thumbnail'"
                  >
                  <div v-else class="item__soon">
                    Artwork
                    <br>
                    in<br>
                    progress
                  </div>
                </div>
                <div v-if="i.coming_soon" class="item__status--green">Coming Soon</div>
                <div v-if="i.new" class="item__status--red">Out Now</div>
              </div>
              <div class="item__title">{{ i.title }}</div>
            </router-link>
          </div>
        </div>
        <div class="swiper-button-prev" slot="button-prev"></div>
        <div class="swiper-button-next" slot="button-next"></div>
        <div class="swiper-button-prev" slot="button-prev"></div>
        <!-- <div class="swiper-scrollbar" slot="scrollbar"></div> -->
      </div>
    </swiper>
  </div>
</template>

<script>
  // import axios from 'axios'
  // import sortBy from 'lodash/sortBy'

  import AppContent from '~/plugins/app-content'

  export default {
    props: ['title', 'list', 'category', 'item'],
    data() {
      return {
        // releases: [],
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
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      releasesStore () {
        return this.$store.getters.loadedReleasesSortedByDate
      }
    },
    // mounted () {
    //   return axios({
    //     url: 'https://sentimony-db.firebaseio.com/releases.json'
    //   })
    //   .then((res) => {
    //     this.releases = res.data;
    //   })
    // },
    // computed: {
    //   sortByDate () {
    //     return sortBy(this.releases, 'date').reverse()
    //   }
    // }
    methods : {
      coming(category) {
        return this.category == 'artists' ? this.texts.comingPhoto : this.texts.comingArtwork
      }
    }
  }
</script>

<style lang="scss">
</style>
