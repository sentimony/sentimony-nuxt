<template>
  <div class="sidebar0">

    <div 
      class="sidebar1" 
      :class="mobmenu.sidebarOpen ? 'is-open' : ''" 
      @click="mobmenu.toggleSidebar"
    ></div>
    
    <div
      class="sidebar2" 
      :class="mobmenu.sidebarOpen ? 'is-open' : ''" 
      @click="mobmenu.toggleSidebar"
    >
      <nuxt-link v-ripple to="/" class="mobmenu__link" exact>Home</nuxt-link>
      <!-- <nuxt-link v-ripple to="/news/" class="mobmenu__link">News</nuxt-link> -->
      <nuxt-link v-ripple to="/releases/" class="mobmenu__link">Releases</nuxt-link>
      <nuxt-link v-ripple to="/artists/" class="mobmenu__link">Artists</nuxt-link>
      <nuxt-link v-ripple to="/videos/" class="mobmenu__link">Videos</nuxt-link>
      <nuxt-link v-ripple to="/playlists/" class="mobmenu__link">Playlists</nuxt-link>
      <!-- <nuxt-link v-ripple to="/events/" class="mobmenu__link">Events</nuxt-link> -->
      <!-- <nuxt-link v-ripple to="/friends/" class="mobmenu__link">Friends</nuxt-link> -->
      <!-- <nuxt-link v-ripple to="/sitemap/" class="mobmenu__link">Sitemap</nuxt-link> -->
      <!-- <nuxt-link v-ripple to="/tracks/" class="mobmenu__link">Tracks</nuxt-link> -->
      <nuxt-link v-ripple to="/contacts/" class="mobmenu__link">Contacts</nuxt-link>

      <hr style="border-color:#fff;opacity:.3;" />

      <HeaderSocialMenu style="display: flex; justify-content: center;" />
    </div>

  </div>
</template>

<script setup>
  import { useMobmenuStore } from '@/stores/mobmenu.ts'

  const mobmenu = useMobmenuStore()
</script>

<script>
  import HeaderSocialMenu from '@/components/HeaderSocialMenu.vue'

  export default {
    components: {
      HeaderSocialMenu
    },
  }
</script>

<style lang="scss">
  @use '@/assets/scss/page';
  @use '@/assets/scss/main-menu-link';

  .sidebar0 {
    z-index: 1000;
    position: fixed;
    left: 100%;
    top: 0;
    width: 100%;
    height: 100%;
    // max-width: 90vw;
    // background-color: rgba(#000, .5);
    // transition: transform .3s ease;
    // display: flex;
    // flex-wrap: wrap;
    // flex-direction: column;

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
    // max-width: 90vw;
    background-color: rgba(#000, 0.5);
    // transition: transform .3s ease;
    // display: flex;
    // flex-wrap: wrap;
    // flex-direction: column;

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
    @extend .page;

    &__link {
      // @extend .main-menu-link;
      display: block;
      padding: 12px 0;

      &:hover,
      &.nuxt-link-active {
        background-color: rgba(#ccc, 0.4);
      }
    }
  }
</style>
