<template>
  <div class="flex-sticky">
    <BaseBg/>
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
  import BaseBg from '~/components/BaseBg.vue'
  import Fractal from '~/components/Fractal.vue'
  import Headr from '~/components/Headr.vue'
  import SwiperArtistList from '~/components/SwiperArtistList.vue'
  import Donate from '~/components/Donate.vue'
  import Footr from '~/components/Footr.vue'

  export default {
    components: {
      BaseBg,
      Fractal,
      Headr,
      SwiperArtistList,
      Donate,
      Footr
    },
    head: {
      link: [
        { rel: 'shortcut icon', href: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/favi%2Ffavicon-32-site.png?alt=media&token=a060a2ba-68f7-4b4e-b0e4-e04dd2cf7de3' }
      ]
    }
  }
</script>

<style lang="scss">
  @import '../node_modules/coriolan-ui/tools/variables';
  @import '../assets/scss/variables';
  @import '../assets/scss/flex-sticky';
  @import '../assets/scss/base';
  @import '../assets/scss/selection-color';
</style>
