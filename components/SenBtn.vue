<template>
  <span class="sen-btn">

    <router-link v-if="url !== ''"
      class="sen-btn__btn"
      :to="route"
      v-ripple
      target="_blank" rel="noopener"
    >
      <img class="sen-btn__btn-img"
        :src="icon"
        :alt="title + ' Icon'"
      >
      <span class="sen-btn__btn-text">{{ title }}</span>
    </router-link>

    <span v-else
      class="sen-btn__btn is-disabled"
    >
      <img
        class="sen-btn__btn-img"
        :src="icon"
        :alt="title + ' Icon'"
      >
      <span class="sen-btn__btn-text">{{ title }}</span>
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

  .sen-btn {
    margin-right: .7em;

    &__btn {
      @extend .btn;
      margin-top: .5em;

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
