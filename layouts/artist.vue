<template>
  <div class="flex-sticky">
    <!-- <div class="flex-sticky__fractal">
      <Fractal/>
    </div> -->
    <div class="flex-sticky__header">
      <Headr/>
    </div>
    <div class="flex-sticky__content">
      <SwiperArtistList/>
      <nuxt/>
    </div>
    <div class="flex-sticky__footer">
      <Donate/>
      <Footr/>
    </div>
  </div>
</template>

<script>
// import Fractal from '~/components/Fractal.vue'
import Headr from '~/components/Headr.vue'
import SwiperArtistList from '~/components/SwiperArtistList.vue'
import Donate from '~/components/Donate.vue'
import Footr from '~/components/Footr.vue'

export default {
  components: {
    // Fractal,
    Headr,
    SwiperArtistList,
    Donate,
    Footr
  }
}
</script>

<style lang="scss">
@import '../node_modules/normalize.css/normalize.css';
@import '../node_modules/coriolan-ui/tools/variables';
@import '../assets/scss/variables';
@import '../assets/scss/flex-sticky';
@import '../assets/scss/base';
@import '../assets/scss/selection-color';
</style>
