<template>
  <div class="menu-social">
    <div class="menu-social__caption">{{ follow }}</div>
    <div v-if="loading">Loading...</div>
    <div v-else class="menu-social__list flex-wrap">
      <a class="menu-social__link"
        v-for="(i, index) in socialStore"
        :key="index"
        v-if="i.isVisibleFootr"
        :href="i.url"
        target="_blank"
        rel="noopener"
      >
        <img class="menu-social__icon"
          :src="'https://content.sentimony.com/assets/img/svg-icons/' + i.icon + '.svg'"
          :alt="i.title + ' Icon'"
        />
        <span class="menu-social__tooltip">{{ i.title }}</span>
      </a>
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        follow: 'Follow Us:'
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

  .menu-social {
    margin: 0 auto 2em;

    &__caption {
    }

    &__list {
      padding-top: 1.2em;
      margin: 0 auto 10px;
      display: flex;
      justify-content: center;
      width: 290px;

      @include media(S) {
        width: 100%;
      }
    }

    &__link {
      padding: .1em .9em;
      position: relative;
    }

    &__icon {
      width: 20px;
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

      .menu-social__link:hover & {
        opacity: 1;
        visibility: visible;
      }
    }
  }
</style>
