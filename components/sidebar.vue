<template>
  <div class="sidebar" :class="sidebarOpen ? 'is-open' : ''">
    <nuxt-link v-ripple to="/news/" class="mobmenu__link">News</nuxt-link>
    <nuxt-link v-ripple to="/releases/" class="mobmenu__link">Releases</nuxt-link>
    <nuxt-link v-ripple to="/artists/" class="mobmenu__link">Artists</nuxt-link>
    <nuxt-link v-ripple to="/events/" class="mobmenu__link">Events</nuxt-link>
    <nuxt-link v-ripple to="/friends/" class="mobmenu__link">Friends</nuxt-link>
    <nuxt-link v-ripple to="/contacts/" class="mobmenu__link">Contacts</nuxt-link>
  </div>
</template>

<script>
  // import {TweenMax, Power4} from 'gsap'

  export default {
    // name: 'sidebar',
    // mounted () {
    //   TweenMax.set(this.$el, {
    //     x: this.$el.offsetWidth
    //   })
    // },
    computed: {
      sidebarOpen () {
        return this.$store.state.mobmenu.sidebarOpen
      }
    },
    // watch: {
      // sidebarOpen: function (sidebarOpen) {
        // const dX = sidebarOpen ? 0 : this.$el.offsetWidth
        // TweenMax.to(this.$el, 0.6, {
        //   x: dX,
        //   ease: Power4.easeOut
        // })
      // }
    // }
  }
</script>

<style lang="scss">
  .sidebar {
    z-index: 1000;
    position: fixed;
    left: 100%;
    top: 0;
    width: 300px;
    height: 100vh;
    max-width: 90vw;
    background-color: #000;
    transition: transform .1s ease;
  }
  .sidebar.is-open {
    transform: translateX(-100%);
  }

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

</style>
