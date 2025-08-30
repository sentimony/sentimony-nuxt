<template>
  <div class="flex-sticky">
    <!-- <BaseBg /> -->
    <div class="flex-sticky__fractal">
      <Fractal />
    </div>
    <div class="flex-sticky__header">
      <HeaderMenu />
      <SidebarMenu />
      <SidebarBtn />
      <!-- <AppPlayerDraggable /> -->
    </div>
    <div class="flex-sticky__content">

      <div style="display: flex; flex-direction: column; justify-content: center;">
        <!-- <div :class="showHero ? 'sen-dn' : 'sen-db'"> -->
        <div style="order: 0;">
          <Hero v-if="isIndex" />
        </div>

        <!-- </div> -->

        <div :class="showReleases || isIndex ? 'sen-o1' : 'sen-o0'" style="order: 1;">
          <SwiperTop
            title="Releases"
            :list="releasesSortedByDate"
            category="releases"
            item="release"
          />
        </div>

        <div :class="showArtists || isIndex ? 'sen-o1' : 'sen-o0'" :style="isIndex ? 'order: 3;' : 'order: 1;'">
          <SwiperTop
            title="Artists"
            :list="artistsSortedByCategoryId"
            category="artists"
            item="artist"
          />
        </div>

        <div :class="showVideos  ? 'sen-o1' : 'sen-o0'" style="order: 1;">
          <SwiperTop
            title="Videos"
            :list="videosSortedByDate"
            category="videos"
            item="video"
          />
        </div>

        <div :class="showPlaylists ? 'sen-o1' : 'sen-o0'" style="order: 1;">
          <SwiperTop
            title="Playlists"
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
      <CallToAction />
      <Footr />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import sortBy from 'lodash/sortBy'
// import BaseBg from '@/components/BaseBg.vue'
import Fractal from '@/components/Fractal.vue'
import HeaderMenu from '@/components/HeaderMenu.vue'
import SidebarMenu from '@/components/SidebarMenu.vue'
import SidebarBtn from '@/components/SidebarBtn.vue'
import Hero from '@/components/Hero.vue'
import CallToAction from '@/components/CallToAction.vue'
import Footr from '@/components/Footr.vue'
// import AppPlayerDraggable from '@/components/AppPlayerDraggable.vue'
import SwiperTop from '@/components/SwiperTop.vue'

export default {
  components: {
    // BaseBg,
    Fractal,
    HeaderMenu,
    SidebarMenu,
    SidebarBtn,
    Hero,
    CallToAction,
    // AppPlayerDraggable,
    Footr,
    SwiperTop
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
    // isVideos() {
    //   return ['/videos/'].includes(this.$route.path)
    // },
    // isPlaylists() {
    //   return ['/playlists/'].includes(this.$route.path)
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
