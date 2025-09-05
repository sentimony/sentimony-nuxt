<script setup lang="ts">
const mobmenu = useMobmenuStore()
const route = useRoute()

const nav = [
  { title: 'Home', route: '/' },
  // { title: 'News', route: '/news/' },
  { title: 'Releases', route: '/releases/' },
  { title: 'Artists', route: '/artists/' },
  { title: 'Videos', route: '/videos/' },
  { title: 'Playlists', route: '/playlists/' },
  // { title: 'Events', route: '/events/' },
  // { title: 'Friends', route: '/friends/' },
  { title: 'Contacts', route: '/contacts/' },
  // { title: 'Tracks', route: '/tracks/' },
  // { title: 'Sitemap', route: '/sitemap/' },
  // { title: '404', route: '/404/' },
  // { title: 'ddos', route: '/ddos/' },
]
</script>

<template>
  <div class="sidebar0">

    <div 
      class="sidebar1 backdrop-blur-sm" 
      :class="mobmenu.sidebarOpen ? 'is-open' : ''" 
      @click="mobmenu.toggleSidebar"
      v-wave
    />
    
    <div
      class="sidebar2" 
      :class="mobmenu.sidebarOpen ? 'is-open' : ''" 
      @click="mobmenu.toggleSidebar"
    >
      <NuxtLink
        v-for="(i, index) in nav"
        :key="index"
        :to="i.route"
        class="mobmenu__link"
        active-class="isSelected"
        v-wave
      >
        {{ i.title }}
      </NuxtLink>

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
