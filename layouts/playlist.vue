<template>
  <div class="flex-sticky">
    <!-- <BaseBg/> -->
    <!-- <div class="flex-sticky__fractal">
      <Fractal/>
    </div> -->
    <div class="flex-sticky__header">
      <header-main/>
      <sidebar-menu/>
      <sidebar-btn/>
    </div>
    <div class="flex-sticky__content">
      <SwiperTop
        title="Playlists"
        :list="playlistsSortedByDate"
        category="playlists"
        item="playlist"
      />
      <nuxt/>
    </div>
    <div class="flex-sticky__footer">
      <Donate/>
      <Footr/>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import sortBy from 'lodash/sortBy'

  // import BaseBg from '~/components/BaseBg.vue'
  // import Fractal from '~/components/Fractal.vue'
  import HeaderMain from '~/components/HeaderMain.vue'
  import SidebarMenu from '~/components/SidebarMenu.vue'
  import SidebarBtn from '~/components/SidebarBtn.vue'
  import SwiperTop from '~/components/SwiperTop.vue'
  import Donate from '~/components/Donate.vue'
  import Footr from '~/components/Footr.vue'

  export default {
    components: {
      // BaseBg,
      // Fractal,
      HeaderMain,
      SidebarMenu,
      SidebarBtn,
      SwiperTop,
      Donate,
      Footr
    },
    data() {
      return {
        playlists: [],
      }
    },
    mounted () {
      axios.get('https://sentimony-db.firebaseio.com/playlists.json')
        .then(response => { this.playlists = response.data })
        .catch(error => { console.log(error) })
    },
    computed: {
      playlistsSortedByDate () {
        return sortBy(this.playlists, 'date')
      }
    }
  }
</script>

<style lang="scss">
</style>
