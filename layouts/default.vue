<template>
  <div class="flex-sticky">
    <!-- <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script> -->
    <style type="text/tailwindcss">
      /* @tailwind base;
      @tailwind components;
      @tailwind utilities; */
      @theme {
        --font-montserrat: 'Montserrat', sans-serif;
        /*  */
      }
      body { @apply font-montserrat antialiased text-[12px]/[1.4] md:text-[15px]/[1.5] text-white text-center bg-green-950 bg-[url(https://content.sentimony.com/assets/img/backgrounds/trees-green_v5.jpg?01)] bg-center bg-no-repeat bg-cover bg-fixed; }
      h1, h2, h3, h4, h5, h6, p { @apply mb-[.3rem] md:mb-[.5rem]; }
      h1, h2, h3, h4, h5, h6 { @apply font-normal; }
      h1 { @apply text-[18px] md:text-[32px] my-[.5em]; }
      h2 { @apply text-[1.5em]; }
      h3 { @apply text-[1.17em]; }
      h4 { @apply text-[1em]; }
      h5 { @apply text-[0.83em]; }
      h6 { @apply text-[0.67em]; }
    </style>
    <!-- <BaseBg/> -->
    <div class="flex-sticky__fractal">
      <Fractal />
    </div>
    <div class="flex-sticky__header">
      <header-main />
      <sidebar-menu />
      <sidebar-btn />
      <!-- <AppPlayerDraggable /> -->
    </div>
    <div class="flex-sticky__content">

      <div style="display: flex; flex-direction: column; justify-content: center;">
        <!-- <div :class="showHero ? 'sen-dn' : 'sen-db'"> -->
        <div style="order: 0;">
          <!-- <Hero v-if="isIndex" /> -->
        </div>

        <!-- </div> -->

        <div :class="showReleases || isIndex ? 'opacity-100 h-[inherit]' : 'opacity-0 h-[0px]'" style="order: 1;">
          <SwiperTop
            title="Releases"
            :list="releasesSortedByDate"
            category="releases"
            item="release"
          />
        </div>

        <div :class="showArtists || isIndex ? 'opacity-100 h-[inherit]' : 'opacity-0 h-[0px]'" :style="isIndex ? 'order: 3;' : 'order: 1;'">
          <SwiperTop
            title="Artists"
            :list="artistsSortedByCategoryId"
            category="artists"
            item="artist"
          />
        </div>

        <div :class="showVideos ? 'opacity-100 h-[inherit]' : 'opacity-0 h-[0px]'" style="order: 1;">
          <SwiperTop
            title="Videos"
            :list="videosSortedByDate"
            category="videos"
            item="video"
          />
        </div>

        <div :class="showPlaylists ? 'opacity-100 h-[inherit]' : 'opacity-0 h-[0px]'" style="order: 1;">
          <SwiperTop_copy
            title="Playlists11!"
            :list="playlistsSortedByDate"
            category="playlists"
            item="playlist"
          />
        </div>

        <div style="order: 2;">
          <transition name="fade" mode="out-in">
            <nuxt />
          </transition>
        </div>

      </div>

    </div>
    <div class="flex-sticky__footer">
      <Donate />
      <Footr />
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import sortBy from 'lodash/sortBy'
  // import BaseBg from '~/components/BaseBg.vue'
  import Fractal from '~/components/Fractal.vue'
  import HeaderMain from '~/components/HeaderMain.vue'
  import SidebarMenu from '~/components/SidebarMenu.vue'
  import SidebarBtn from '~/components/SidebarBtn.vue'
  import Hero from '~/components/Hero.vue'
  import Donate from '~/components/Donate.vue'
  import Footr from '~/components/Footr.vue'
  // import AppPlayerDraggable from '../components/AppPlayerDraggable.vue'
  import SwiperTop from '../components/SwiperTop.vue'
  import SwiperTop_copy from '../components/SwiperTop_copy.vue'

  export default {
    components: {
      // BaseBg,
      Fractal,
      HeaderMain,
      SidebarMenu,
      SidebarBtn,
      Hero,
      Donate,
      // AppPlayerDraggable,
      Footr,
      SwiperTop,
      SwiperTop_copy,
    },
    data: () => ({
      releases: [],
      artists: [],
      videos: [],
      playlists: [],
    }),
    mounted() {
      axios
        .get('https://sentimony-db.firebaseio.com/releases.json')
        .then((response) => { this.releases = response.data })
        .catch((error) => { console.log(error) })

      axios
        .get('https://sentimony-db.firebaseio.com/artists.json')
        .then((response) => { this.artists = response.data })
        .catch((error) => { console.log(error) })

      axios
        .get('https://sentimony-db.firebaseio.com/videos.json')
        .then(response => { this.videos = response.data })
        .catch(error => { console.log(error) })

      axios
        .get('https://sentimony-db.firebaseio.com/playlists.json')
        .then(response => { this.playlists = response.data })
        .catch(error => { console.log(error) })
    },
    computed: {
      releasesSortedByDate() {
        return sortBy(this.releases, 'date').reverse()
      },
      artistsSortedByCategoryId() {
        return sortBy(this.artists, 'category_id')
      },
      videosSortedByDate () {
        return sortBy(this.videos, 'date').reverse()
      },
      playlistsSortedByDate () {
        return sortBy(this.playlists, 'date').reverse().reverse()
      },
      isIndex() {
        return ['/'].includes(this.$route.path)
      },
      // isReleases() {
      //   return ['/releases/'].includes(this.$route.path)
      // },
      // isArtists() {
      //   return ['/artists/'].includes(this.$route.path)
      // },
      showReleases() {
        return this.$route.path.startsWith('/release/')
      },
      showArtists() {
        return this.$route.path.startsWith('/artist/')
      },
      showVideos() {
        return this.$route.path.startsWith('/video/')
      },
      showPlaylists() {
        return this.$route.path.startsWith('/playlist/')
      },
    },
  }
</script>

<style lang="scss"></style>
