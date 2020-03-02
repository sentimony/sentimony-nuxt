<!-- <template>
  <div class="mobmenu">
    <nuxt-link v-ripple to="/news/" class="mobmenu__link">News</nuxt-link>
    <nuxt-link v-ripple to="/releases/" class="mobmenu__link">Releases</nuxt-link>
    <nuxt-link v-ripple to="/artists/" class="mobmenu__link">Artists</nuxt-link>
    <nuxt-link v-ripple to="/events/" class="mobmenu__link">Events</nuxt-link>
    <nuxt-link v-ripple to="/friends/" class="mobmenu__link">Friends</nuxt-link>
    <nuxt-link v-ripple to="/contacts/" class="mobmenu__link">Contacts</nuxt-link>
  </div>
</template>

<script>
  export default {
    head: {
      title: 'MobMenu',
      meta: [
        { name: 'description', content: 'MobMenu description' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg' }
      ]
    }
  }
</script>

<style lang="scss">
  @import '../assets/scss/page';
  @import '../assets/scss/main-menu-link';

  .mobmenu {
    @extend .page;

    &__link {
      @extend .main-menu-link;
      display: block;
      // padding: 20px 0;

      &:hover {
        background-color: $colorBgLight;
      }
    }
  }
</style> -->


<template>
  <div>
    <sidebar-menu/>
    <sidebar-toggle/>
  </div>
</template>

<script>
  import SidebarMenu from '~/components/SidebarMenu.vue'
  import SidebarToggle from '~/components/SidebarToggle.vue'

  export default {
    name: 'app',
    components: {
      SidebarMenu,
      SidebarToggle
    }
  }
</script>

<style lang="scss">
</style>
