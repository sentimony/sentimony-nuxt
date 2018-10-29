<template>
  <div class="flex-sticky">
    <BaseBg/>
    <div class="flex-sticky__fractal">
      <!-- <Fractal :fractal="fractal"/> -->
    </div>
    <div class="flex-sticky__header">
      <!-- <Headr/> -->
    </div>
    <div class="flex-sticky__content">
      <div>Page: {{ pages.title }}</div>
      <div>Route: {{ this.$route.name }}</div>
      <!-- <Hero/> -->
      <!-- <SwiperReleaseList/> -->
      <!-- <About/> -->
      <!-- <SwiperArtistList/> -->
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
  import Hero from '~/components/Hero.vue'
  import SwiperReleaseList from '~/components/SwiperReleaseList.vue'
  import About from '~/components/About.vue'
  import SwiperArtistList from '~/components/SwiperArtistList.vue'
  import Donate from '~/components/Donate.vue'
  import Footr from '~/components/Footr.vue'

  export default {
    // props: [
    //   'fractal'
    // ],
    components: {
      BaseBg,
      Fractal,
      Headr,
      Hero,
      SwiperReleaseList,
      About,
      SwiperArtistList,
      Donate,
      Footr
    },
    // data: () => ({
    //   fractal: true
    // })
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      page () {
        return this.$store.getters.loadedPage
      },
      pages () {
        return this.$store.getters.loadedPages
      }
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
