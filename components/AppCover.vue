<template>
  <div class="app-cover">
    <img v-if="cover"
      class="app-cover__bg"
      :src="'https://content.sentimony.com/assets/img/' + category + '/small/' + '/' + slug + '.jpg'"
      :srcset="'https://content.sentimony.com/assets/img/' + category + '/small/' + '/' + slug + '.jpg 1x, https://content.sentimony.com/assets/img/' + category + '/small-retina/' + '/' + slug + '.jpg 2x'"
      :alt="title + ' Small Thumbnail'"
    >
    <img v-img v-if="cover"
      class="app-cover__img"
      :src="'https://content.sentimony.com/assets/img/' + category + '/large/' + '/' + slug +'.jpg'"
      :srcset="'https://content.sentimony.com/assets/img/' + category + '/medium/' + '/' + slug +'.jpg 1x, https://content.sentimony.com/assets/img/' + category + '/medium-retina/' + '/' + slug +'.jpg 2x'"
      :alt="title"
    >
    <div v-if="!cover"
      class="app-cover__coming">
      Artwork<br>
      in<br>
      progress
    </div>
  </div>
</template>

<script>
  export default {
    props: ['cover', 'category', 'slug', 'title']
  }
</script>

<style lang="scss">
  @import '../node_modules/coriolan-ui/tools/variables';
  @import '../node_modules/coriolan-ui/mixins/media';
  @import '../assets/scss/variables';
  @import '../assets/scss/v-img-restyle';

  .app-cover {
    min-width: 100px;
    height: 100px;
    border-radius: 2px;
    overflow: hidden;
    margin-right: 1.4em;
    background-color: $colorBgBlack;
    display: flex;
    align-items: stretch;
    box-shadow: $shadow;
    position: relative;

    @include media(M) {
      min-width: 190px;
      height: 190px;
    }

    &__bg {
      position: absolute;
      width: 100%;
      height: auto;
    }

    &__img {
      display: block;
      width: 100%;
      max-width: 100px;
      box-shadow: $shadow;
      position: relative;

      @include media(M) {
        max-width: 190px;
      }
    }

    &__coming {
      padding: 1em 1.2em;
      font-size: 10px;
      color: rgba(#fff,.5);

      @include media(M) {
        font-size: 14px;
      }
    }
  }
</style>
