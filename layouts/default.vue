<template>
  <div class="flex-sticky">
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
      <transition name="fade" mode="out-in">
        <nuxt />
      </transition>
    </div>
    <div class="flex-sticky__footer">
      <Donate />
      <Footr />
    </div>
  </div>
</template>

<script>
  // import BaseBg from '~/components/BaseBg.vue'
  import Fractal from '~/components/Fractal.vue'
  import HeaderMain from '~/components/HeaderMain.vue'
  import SidebarMenu from '~/components/SidebarMenu.vue'
  import SidebarBtn from '~/components/SidebarBtn.vue'
  import Donate from '~/components/Donate.vue'
  import Footr from '~/components/Footr.vue'
  // import AppPlayerDraggable from '../components/AppPlayerDraggable.vue'

  export default {
    components: {
      // BaseBg,
      Fractal,
      HeaderMain,
      SidebarMenu,
      SidebarBtn,
      Donate,
      // AppPlayerDraggable,
      Footr
    }
  }
</script>

<style lang="scss"></style>
