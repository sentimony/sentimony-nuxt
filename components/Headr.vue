<template>
  <div class="headr">
    <div class="headr__container">

      <nuxt-link v-ripple to="/" class="logolink" active-class="is-selected" exact>
        <img class="logolink__logo" src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo.svg" :alt="siteTitle + 'Logo SVG'">
        <div class="logolink__text">
          <div class="logolink__title">{{ siteTitle }}</div>
          <div class="logolink__description">{{ siteDescription }}</div>
        </div>
      </nuxt-link>

      <nav class="headr__main-menu">
        <!-- <nuxt-link to="/news/" class="headr__main-menu-link" active-class="is-selected">News</nuxt-link> -->
        <nuxt-link v-ripple to="/releases/" class="headr__main-menu-link" active-class="is-selected">Releases</nuxt-link>
        <nuxt-link v-ripple to="/artists/" class="headr__main-menu-link" active-class="is-selected">Artists</nuxt-link>
        <!-- <nuxt-link to="/events/" class="headr__main-menu-link" active-class="is-selected">Events</nuxt-link> -->
        <!-- <nuxt-link to="/friends/" class="headr__main-menu-link" active-class="is-selected">Friends</nuxt-link> -->
        <!-- <nuxt-link to="/contacts/" class="headr__main-menu-link" active-class="is-selected">Contacts</nuxt-link> -->
      </nav>

      <nav class="headr__social-menu">
        <a v-ripple v-for="i in social.data" v-if="i.isVisibleHeadr" class="headr__social-menu-link" :href="i.url" target="_blank" rel="noopener">
          <img class="headr__social-menu-link-img" :src="'https://content.sentimony.com/assets/img/svg-icons/' + i.icon + '.svg'" :alt="i.title + ' Icon'">
          <span class="headr__social-menu-link-tooltip">{{ i.title }}</span>
        </a>
      </nav>

      <nuxt-link v-ripple to="/mobmenu/" class="headr__mob-menu-button">
        <img class="headr__mob-menu-button-img" src="https://content.sentimony.com/assets/img/svg-icons/menu.svg">
      </nuxt-link>

    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        siteTitle: 'Sentimony Records',
        siteDescription: 'Psychedelic Music Label',
        social: []
      }
    },
    mounted () {
      return axios({
        url: 'https://sentimony-db.firebaseio.com/social.json'
      })
      .then((res) => {
        this.social = res.data;
      })
    }
  }
</script>

<style lang="scss">
  @import '../node_modules/coriolan-ui/tools/variables';
  @import '../node_modules/coriolan-ui/mixins/media';
  @import '../assets/scss/variables';
  @import '../assets/scss/main-menu-link';

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
        @extend .main-menu-link;
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
        @extend .main-menu-link;
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
      @extend .main-menu-link;
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

  .logolink {
    @extend .main-menu-link;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 232px;
    height: 54px;
    padding: 0;

    &__logo {
      width: 40px;
      display: block;
      margin-right: 12px;
    }

    &__text {
      text-align: left;
    }

    &__title {
      color: #fff;
    }

    &__description {
      font-size: 12px;
      color: rgba(#fff,.4);
      letter-spacing: .4px;
    }
  }
</style>
