<script setup>
import { useMobmenuStore } from '@/stores/mobmenu.ts'

const mobmenu = useMobmenuStore()
</script>

<template>
  <div class="sidebar0">

    <div 
      class="sidebar1" 
      :class="mobmenu.sidebarOpen ? 'is-open' : ''" 
      @click="mobmenu.toggleSidebar"
    />
    
    <div
      class="sidebar2" 
      :class="mobmenu.sidebarOpen ? 'is-open' : ''" 
      @click="mobmenu.toggleSidebar"
    >
      <!-- <nuxt-link
        v-for="(i, index) in menu"
        :key="index"
        v-if="i.visibleSidebar"
        v-ripple
        :to="i.route"
        class="mobmenu__link"
        active-class="isSelected"
        :class="{ 'isSelected': isSelected(i) }"
        exact
        v-html="i.title"
      /> -->
      
      <div>link1</div>
      <div>link2</div>
      <!-- <div>{{ useMobmenuStore() }}</div> -->

      <hr style="border-color:#fff;opacity:.3;" />

      <!-- <HeaderSocialMenu style="display: flex; justify-content: center;" /> -->
    </div>


  </div>
</template>

<!-- <script>
import HeaderSocialMenu from '@/components/HeaderSocialMenu.vue'
import AppContent from '@/plugins/AppContent';

export default {
  components: {
    HeaderSocialMenu
  },
  data: () => ({
    menu: AppContent.menu,
  }),
  methods: {
    isSelected(i) { return i.match(this.$route.path) }
  }
}
</script> -->

<style lang="scss">
// @use '@/assets/scss/page';
// @use '@/assets/scss/main-menu-link';

.sidebar0 {
  z-index: 1000;
  position: fixed;
  left: 100%;
  top: 0;
  width: 100%;
  height: 100%;

  &.is-open {
    transform: translateX(-100%);
  }
}

.sidebar1 {
  z-index: 1000;
  position: fixed;
  left: 100%;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(#000, 0.5);

  &.is-open {
    transform: translateX(-100%);
  }
}

.sidebar2 {
  z-index: 1000;
  position: fixed;
  left: 100%;
  top: 0;
  width: 300px;
  height: 100vh;
  max-width: 90vw;
  background-color: #000;
  transition: transform 0.3s ease;
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;

  &.is-open {
    transform: translateX(-100%);
  }
}

.mobmenu {
  // @extend .page;

  &__link {
    display: block;
    padding: 12px 0;

    &:hover,
    &.isSelected {
      background-color: rgba(#ccc, 0.4);
    }
  }
}
</style>
