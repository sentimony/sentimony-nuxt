<template>
  <div class="menu-social">
    <div class="menu-social__caption">Follow Us:</div>
    <div v-if="loadingStore.loading">Loading...</div>
    <div v-else class="menu-social__list flex-wrap">
      <a 
        class="menu-social__link"
        v-for="(i, index) in social.loadedSocial"
        :key="index"
        v-if="i.isVisibleFootr"
        :href="i.url"
        target="_blank" rel="noopener"
      >
        <img 
          class="menu-social__icon"
          :src="'https://content.sentimony.com/assets/img/svg-icons/' + i.icon + '.svg?01'"
          :alt="i.title + ' Icon'"
        />
        <span class="menu-social__tooltip">{{ i.title }}</span>
      </a>
    </div>
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
  @import '../node_modules/coriolan-ui/tools/variables';
  @import '../node_modules/coriolan-ui/mixins/media';

  .menu-social {
    margin: 0 auto 24px;

    &__caption {
    }

    &__list {
      padding-top: 1.2em;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      // width: 290px;

      @include media(S) {
        width: 100%;
      }
    }

    &__link {
      padding: .1em .9em;
      position: relative;
      // display: block;
    }

    &__icon {
      width: 20px;
      display: inline-block;
      vertical-align: inherit;
    }

    &__tooltip {
      font-size: .75em;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate3d(-50%,-100%,0);
      transition: opacity .2s ease;
      opacity: 0;
      visibility: hidden;
      background-color: rgba(#8a0202, 1);
      padding: 2px 8px;
      border-radius: 4px;
      color: #fff;

      .menu-social__link:hover & {
        opacity: 1;
        visibility: visible;
      }
    }
  }
</style>
