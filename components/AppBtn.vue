<template>
  <span class="app-btn">

    <router-link v-if="url !== '' && redirect !== 'false'"
      class="app-btn__btn"
      :to="route"
      v-ripple
      target="_blank" rel="noopener"
    >
      <img
        class="app-btn__btn-img"
        :src="icon"
        :alt="title + ' Icon'"
      >
      <span class="app-btn__btn-text" v-html="title"></span>
    </router-link>

    <span v-if="url == '' && redirect !== 'false'"
      class="app-btn__btn is-disabled"
    >
      <img
        class="app-btn__btn-img"
        :src="icon"
        :alt="title + ' Icon'"
      >
      <span class="app-btn__btn-text" v-html="title"></span>
    </span>

    <a v-if="url !== '' && redirect == 'false'"
      :href="url"
      v-ripple
      class="app-btn__btn"
      target="_blank" rel="noopener"
    >
      <img class="app-btn__btn-img"
        :src="icon"
        :alt="title + ' Icon'"
      >
      <span class="app-btn__btn-text" v-html="title"></span>
    </a>

    <span v-if="url == '' && redirect == 'false'"
      class="app-btn__btn is-disabled"
    >
      <img
        class="app-btn__btn-img"
        :src="icon"
        :alt="title + ' Icon'"
      >
      <span class="app-btn__btn-text" v-html="title"></span>
    </span>

    <!-- url: {{ url }}<br> route: {{ route }}<br> title: {{ title }}<br> icon: {{ icon }}<br> redirect: {{ redirect }}<br> -->

  </span>
</template>

<script>
  export default {
    props: {
      'url': String,
      'route': String,
      'title': String,
      'icon': String,
      'redirect': String,
    }
  }
</script>

<style lang="scss">
  @import '../node_modules/coriolan-ui/tools/variables';
  @import '../node_modules/coriolan-ui/mixins/media';
  @import '../assets/scss/variables';
  @import '../assets/scss/buttons';

  .app-btn {
    margin-right: .5em;
    display: inline-block;
    // margin-top: .5em;
    margin-bottom: .5em;

    &__btn {
      @extend .btn;

      &-img {
        @extend .btn__img;
        width: 16px;
        height: 16px;

        @include media(M) {
          width: 18px;
          height: 18px;
        }
      }

      &-text {
        @extend .btn__text;
      }
    }
  }
</style>
