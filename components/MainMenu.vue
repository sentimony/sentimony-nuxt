<template>
  <header class="main-menu">
    <nav class="main-menu__list">

      <LogoLink/>

      <nav>
        <nuxt-link class="main-menu__link" to='/releases'>Releases</nuxt-link>
        <!-- <nuxt-link class="main-menu__link" to='/artists'>Artists</nuxt-link> -->
        <!-- <nuxt-link class="main-menu__link" to='/events'>Events</nuxt-link> -->
      </nav>
      <nav>
        <a class="main-menu__link main-menu__link--soc" href="https://sentimony.bandcamp.com" target="_blank">Bandcamp</a>
        <a class="main-menu__link main-menu__link--soc" href="https://www.facebook.com/sentimony.records" target="_blank">Facebook</a>
        <a class="main-menu__link main-menu__link--soc" href="https://www.youtube.com/channel/UCMvuVxLPE5VBjw0YH1uE4ig" target="_blank">YouTube</a>
      </nav>
    </nav>
  </header>
</template>

<style lang="scss">
.main-menu {
  position: relative;
  z-index: 100;
  max-width: 1270px;
  margin: 0 auto;

  &__list {
    // max-width: 975px;
    // margin: 0 auto;
    height: 75px;
    border-bottom: 1px solid rgba(#fff,.3);
    box-sizing: border-box;
    display: flex;
    // flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
  }

  &__link {
    // font-weight: 600;
    // text-transform: uppercase;
    font-size: 16px;
    padding: 1.2em 1.6em;
    // height: 50px;
    // padding-left: 1.5em;
    // padding-right: 1.5em;
    transition: background-color .2s ease-in-out,
                color .2s ease-in-out;

    // &:first-child {
    //   padding-left: 0;
    // }

    // &:last-child {
    //   padding-right: 0;
    // }

    &:hover,
    &.nuxt-link-active {
      background-color: rgba(#fff,.1);
    }

    &--logo {
      padding: .4em .8em;
    }

    &--soc {
      padding: 1.4em .8em;
      font-size: 12px;
    }
  }
}
</style>


<script>
import LogoLink from '~components/LogoLink.vue'

export default {
  components: {
    LogoLink
  }
}
</script>
