<template>
  <nuxt-link
    v-ripple
    :to="logolink.url"
    class="header-logolink"
    active-class="is-selected"
    exact
  >
    <img
      class="header-logolink__logo"
      :src="logolink.logoImg"
      :alt="logolink.title + 'Logo SVG'"
    />
    <div class="header-logolink__text">
      <div class="header-logolink__title">{{ logolink.title }}</div>
      <div class="header-logolink__description">{{ logolink.description }}</div>
    </div>
  </nuxt-link>
</template>

<script>
  export default {
    data() {
      return {
        logolink: {
          title: 'Sentimony Records',
          description: 'Psychedelic Music Label',
          logoImg:
            'https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.1.svg?01',
          url: '/'
        }
      }
    }
  }
</script>

<style lang="scss">
  @import '../assets/scss/main-menu-link';

  .header-logolink {
    @extend .main-menu-link;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 232px;
    height: 56px;
    padding: 0;
    line-height: 1.5;

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
      color: rgba(#fff, 0.4);
      letter-spacing: 0.4px;
    }
  }
</style>
