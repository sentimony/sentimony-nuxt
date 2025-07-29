<template>
  <div>
    <div class="header-main">
      <div class="header-main__container">
        <div style="width:232px">
          <HeaderLogolink />
        </div>

        <nav class="header-main__main-menu" v-if="$mq === 'lg'">
          <!-- <nuxt-link to="/news/" class="header-main__main-menu-link" active-class="is-selected">News</nuxt-link> -->
          <nuxt-link v-ripple to="/releases/" class="header-main__main-menu-link" active-class="is-selected">Releases</nuxt-link>
          <nuxt-link v-ripple to="/artists/" class="header-main__main-menu-link" active-class="is-selected">Artists</nuxt-link>
          <nuxt-link v-ripple to="/videos/" class="header-main__main-menu-link" active-class="is-selected">Videos</nuxt-link>
          <nuxt-link v-ripple to="/playlists/" class="header-main__main-menu-link" active-class="is-selected">Playlists</nuxt-link>
          <!-- <nuxt-link to="/events/" class="header-main__main-menu-link" active-class="is-selected">Events</nuxt-link> -->
          <!-- <nuxt-link to="/friends/" class="header-main__main-menu-link" active-class="is-selected">Friends</nuxt-link> -->
          <!-- <nuxt-link to="/contacts/" class="header-main__main-menu-link" active-class="is-selected">Contacts</nuxt-link> -->
        </nav>

        <header-social-menu style="width:232px" v-if="$mq === 'lg'" />
      </div>
    </div>
  </div>
</template>

<script>
  import HeaderLogolink from '~/components/HeaderLogolink.vue'
  import HeaderSocialMenu from '~/components/HeaderSocialMenu.vue'

  export default {
    components: {
      HeaderLogolink,
      HeaderSocialMenu
    }
  }
</script>

<style lang="scss">
  @import '../node_modules/coriolan-ui/tools/variables';
  @import '../node_modules/coriolan-ui/mixins/media';
  // @import '../assets/scss/variables';
  @import '../assets/scss/main-menu-link';

  .header-main {
    position: relative;
    z-index: 700;
    padding: 0 0.6em;

    &__container {
      max-width: 1278px;
      margin: 0 auto;
      height: 75px;
      border-bottom: 1px solid rgba(#fff, 0.3);
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__main-menu {
      // display: none;
      //
      // @include media(M) {
      //   display: flex;
      // }

      &-link {
        @extend .main-menu-link;
        line-height: 16px;
        font-size: 14px;
        padding: 20px 16px;

        @include media(L) {
          font-size: 16px;
          padding: 20px 16px * 1.75;
        }
      }
    }
  }
</style>
