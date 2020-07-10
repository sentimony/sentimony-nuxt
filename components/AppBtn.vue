<template>
  <span class="app-btn">

    <router-link v-if="url !== ''"
      class="app-btn__btn"
      :to="route"
      v-ripple
      target="_blank" rel="noopener"
    >
      <img class="app-btn__btn-img"
        :src="icon"
        :alt="title + ' Icon'"
      >
      <span class="app-btn__btn-text">{{ title }}</span>
    </router-link>

    <span v-else
      class="app-btn__btn is-disabled"
    >
      <img
        class="app-btn__btn-img"
        :src="icon"
        :alt="title + ' Icon'"
      >
      <span class="app-btn__btn-text">{{ title }}</span>
    </span>

  </span>
</template>

<script>
  export default {
    props: ['url', 'route', 'title', 'icon']
  }
</script>

<style lang="scss">
  @import '../node_modules/coriolan-ui/tools/variables';
  @import '../node_modules/coriolan-ui/mixins/media';
  @import '../assets/scss/variables';
  @import '../assets/scss/buttons';

  .app-btn {
    margin-right: .7em;
    display: inline-block;
    // margin-top: .5em;
    margin-bottom: .5em;

    &__btn {
      @extend .btn;

      &-img {
        @extend .btn__img;
        height: 18px;
      }

      &-text {
        @extend .btn__text;
      }
    }
  }
</style>
