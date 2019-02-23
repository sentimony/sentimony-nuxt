<template>
  <no-ssr>
    <div v-if="loading">Loading...</div>
    <nav v-else class="headr-social-menu">
      <a class="headr-social-menu__link"
        v-for="i in socialStore"
        :key="i.title"
        v-if="i.isVisibleHeadr"
        :href="i.url"
        v-ripple
        target="_blank"
        rel="noopener"
      >
        <div class="headr-social-menu__link__tooltip headr-social-menu__link__tooltip--top"
          v-if="i.title == 'Bandcamp'"
          v-html="free"
        />
        <img class="headr-social-menu__link__img"
          :src="'https://content.sentimony.com/assets/img/svg-icons/' + i.icon + '.svg'" :alt="i.title + ' Icon'"
        />
        <div class="headr-social-menu__link__tooltip headr-social-menu__link__tooltip--bottom"
          v-html="i.title"
        />
      </a>
    </nav>
  </no-ssr>
</template>

<script>
  export default {
    data() {
      return {
        free: 'FREE or Donate'
      }
    },
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      socialStore () {
        return this.$store.getters.loadedSocial
      }
    }
  }
</script>

<style lang="scss">
  @import '../node_modules/coriolan-ui/tools/variables';
  @import '../node_modules/coriolan-ui/mixins/media';
  @import '../assets/scss/variables';
  @import '../assets/scss/main-menu-link';

  .headr-social-menu {
    display: none;

    @include media(M) {
      display: flex;
    }

    @include media(M) {
      justify-content: flex-end;
      // width: 232px;
    }

    &__link {
      @extend .main-menu-link;
      color: #fff;
      padding: 16px 0;
      box-sizing: border-box;
      position: relative;
      min-width: 70px;
      height: 58px;
      display: flex;
      align-items: center;

      &__img {
        display: block;
        width: auto;
        height: 24px;
        margin: 0 auto;
        opacity: .5;
        transition: opacity .2s ease-in-out,
                    height .2s ease-in-out;
      }

      &:hover &__img {
        height: 30px;
        opacity: 1;
      }

      &__tooltip {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        opacity: .75;
        transition: opacity .2s ease-in-out,
                    font-size .2s ease-in-out;

        &--top {
          font-size: 9px;
          top: 0;
          width: 90px;
        }

        &--bottom {
          font-size: 0px;
          bottom: 0;
        }
      }

      &:hover &__tooltip {
        opacity: 1;

        &--top {
          font-size: 8px;
        }

        &--bottom {
          font-size: 10px;
        }
      }
    }
  }
</style>
