<template>
  <div class="headr-social-menu">
    <div v-if="loadingStore.loading" style="width: 232px;">Loading...</div>
    <nav v-else class="headr-social-menu__container">
      <a 
        class="headr-social-menu__link" 
        v-ripple 
        v-for="(i, index) in social.loadedSocial" 
        :key="index" 
        v-if="i.isVisibleHeadr" 
        :href="i.url" 
        target="_blank" rel="noopener"
      >
        <img 
          class="headr-social-menu__link__img" 
          :src="'https://content.sentimony.com/assets/img/svg-icons/' + i.icon + '.svg?01'" 
          :alt="i.title + ' Icon'"
        />
        <div class="headr-social-menu__link__tooltip headr-social-menu__link__tooltip--bottom" v-html="i.title"/>
      </a>
    </nav>
  </div>
</template>

<script setup>
  import { onMounted } from '@nuxtjs/composition-api'
  import { useLoadingStore } from '../pinia/loading.ts'
  import { useSocialStore } from '../pinia/social.ts'

  const loadingStore = useLoadingStore()
  const social = useSocialStore()

  onMounted(() => {
    social.loadSocial()
  })
</script>

<style lang="scss">
  // @import '../node_modules/coriolan-ui/tools/variables';
  // @import '../node_modules/coriolan-ui/mixins/media';
  // @import '../assets/scss/variables';
  @import '../assets/scss/main-menu-link';

  .headr-social-menu {
    // width: 232px;
    // display: none;
    //
    // @include media(M) {
    //   display: block;
    // }

    &__container {
      display: flex;
      justify-content: flex-end;
      width: 232px;
    }

    &__link {
      @extend .main-menu-link;
      color: #fff;
      padding: 0;
      box-sizing: border-box;
      position: relative;
      min-width: 56px;
      height: 56px;
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
        // height: 30px;
        opacity: 1;
      }

      &__tooltip {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        opacity: .75;
        transition: opacity .2s ease,
                    font-size .2s ease,
                    letter-spacing .2s ease;

        // &--top {
        //   font-size: 9px;
        //   top: 0;
        //   width: 90px;
        // }

        &--bottom {
          letter-spacing: -4px;
          font-size: 8px;
          bottom: 2px;
          opacity: 0;
        }
      }

      &:hover &__tooltip {
        // opacity: 1;

        // &--top {
        //   font-size: 8px;
        // }

        &--bottom {
          opacity: 1;
          letter-spacing: 0px;
          font-size: 8px;
        }
      }
    }
  }
</style>
