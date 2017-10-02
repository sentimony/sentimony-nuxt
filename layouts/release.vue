<template>
  <div class="flex-sticky">
    <BaseBg/>
    <div class="flex-sticky__fractal">
      <Fractal/>
    </div>
    <div class="flex-sticky__header">
      <Headr/>
    </div>
    <div class="flex-sticky__content">
      <SwiperReleaseList/>
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
import SwiperReleaseList from '~/components/SwiperReleaseList.vue'
import Donate from '~/components/Donate.vue'
import Footr from '~/components/Footr.vue'

export default {
  components: {
    BaseBg,
    Fractal,
    Headr,
    SwiperReleaseList,
    Donate,
    Footr
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
