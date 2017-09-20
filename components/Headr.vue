<template>
  <header class="headr">
    <div class="headr__container">

      <LogoLink/>

      <nav class="headr__main-menu">
        <nuxt-link to="/news/" class="headr__main-menu-link" active-class="is-selected">News</nuxt-link>
        <nuxt-link to="/releases/" class="headr__main-menu-link" active-class="is-selected">Releases</nuxt-link>
        <nuxt-link to="/artists/" class="headr__main-menu-link" active-class="is-selected">Artists</nuxt-link>
        <nuxt-link to="/events/" class="headr__main-menu-link" active-class="is-selected">Events</nuxt-link>
        <nuxt-link to="/friends/" class="headr__main-menu-link" active-class="is-selected">Friends</nuxt-link>
        <nuxt-link to="/contacts/" class="headr__main-menu-link" active-class="is-selected">Contacts</nuxt-link>
      </nav>

      <nav class="headr__social-menu">
        <a class="headr__social-menu-link" href="https://sentimony.bandcamp.com" target="_blank" rel="noopener">
          <img class="headr__social-menu-link-img" src="https://sentimony.com/assets/img/svg-icons/bandcamp.svg" alt="Bandcamp Icon">
          <span class="headr__social-menu-link-tooltip">bandcamp</span>
        </a>
        <a class="headr__social-menu-link" href="https://www.facebook.com/sentimony.records" target="_blank" rel="noopener">
          <img class="headr__social-menu-link-img" src="https://sentimony.com/assets/img/svg-icons/facebook.svg" alt="Facebook Icon">
          <span class="headr__social-menu-link-tooltip">facebook</span>
        </a>
        <a class="headr__social-menu-link" href="https://www.youtube.com/c/SentimonyRecordsOfficial" target="_blank" rel="noopener">
          <img class="headr__social-menu-link-img" src="https://sentimony.com/assets/img/svg-icons/youtube.svg" alt="YouTube Icon">
          <span class="headr__social-menu-link-tooltip">youtube</span>
        </a>
      </nav>

      <nuxt-link to="/releases/" class="headr__mob-menu-button">
        <img class="headr__mob-menu-button-img" src="/assets/img/svg-icons/menu.svg">
      </nuxt-link>

    </div>
  </header>
</template>

<script>
import LogoLink from '~/components/LogoLink.vue'

export default {
  components: {
    LogoLink
  }
}
</script>

<style lang="scss">
@import '../node_modules/coriolan-ui/tools/variables';
@import '../node_modules/coriolan-ui/mixins/media';

$colorBgLight: rgba(#ccc,.4);

.headr {
  position: relative;
  z-index: 1000;
  padding: 0 .6em;

  &__container {
    max-width: 1278px;
    margin: 0 auto;
    height: 75px;
    border-bottom: 1px solid rgba(#fff,.3);
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__main-menu {
    display: none;

    @include media(M) {
      display: flex;
    }

    &-link {
      padding: .938em .938em*1.5;
      font-size: 16px;
      color: #fff;
      border-radius: 6px;
      transition: background-color .2s ease-in-out;
      margin-left: .2em;

      &:first-child {
        margin-left: 0;
      }

      &.is-selected,
      &:hover {
        background-color: $colorBgLight;
      }
    }
  }

  &__social-menu {
    display: none;

    @include media(S) {
      display: flex;
    }

    @include media(M) {
      justify-content: flex-end;
      width: 232px;
    }

    &-link {
      @extend .headr__main-menu-link;
      font-size: 16px;
      color: #fff;
      padding: .938em;
      box-sizing: border-box;

      &-img {
        display: block;
        width: auto;
        height: 24px;
        margin: 0 auto;
      }

      &-tooltip {
        display: none;
      }
    }
  }

  &__mob-menu-button {
    @extend .headr__main-menu-link;
    display: block;
    padding: 1.063em;
    margin-left: 0;

    @include media(M) {
      display: none;
    }

    &-img {
      display: block;
      width: auto;
      height: 20px;
      margin: 0 auto;
    }
  }
}
</style>
