<template>
  <div class="app-cover">
    <img
      v-img
      v-if="cover_th"
      class="app-cover__bg"
      :src="cover_th"
      :alt="title + ' Thumbnail'"
    />

    <img
      v-img
      v-if="cover_xl"
      class="app-cover__img"
      :src="cover_xl"
      :alt="title"
    />

    <div
      v-if="!cover_th && !cover_xl"
      class="app-cover__coming"
      v-html="coming()"
    />
  </div>
</template>

<script>
  import AppContent from '@/plugins/AppContent'

  export default {
    props: {
      cover_th: String,
      cover_xl: String,
      category: String,
      title: String
    },
    data() {
      return {
        texts: AppContent.texts
      }
    },
    methods: {
      coming(category) {
        return this.category == 'artists'
          ? this.texts.comingPhoto
          : this.texts.comingCover
      }
    }
  }
</script>

<style lang="scss">
  @use '@/assets/scss/coriolanMedia' as media;
  @use '@/assets/scss/v-img-restyle';

  .app-cover {
    // min-width: 100px;
    // max-width: 100px;
    width: 100px;
    height: 100px;
    border-radius: 2px;
    overflow: hidden;
    margin-right: 1.4em;
    margin-bottom: 0.5em;
    background-color: rgba(#000, 0.5);
    box-shadow: 0 2px 10px 0 rgba(#000, 0.5);
    position: relative;
    float: left;

    @include media.media(M) {
      // min-width: 190px;
      // max-width: 190px;
      width: 190px;
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
      box-shadow: 0 2px 10px 0 rgba(#000, 0.5);
      position: relative;

      @include media.media(M) {
        max-width: 190px;
      }
    }

    &__coming {
      padding: 1em 1.2em;
      font-size: 10px;
      color: rgba(#fff, 0.5);

      @include media.media(M) {
        font-size: 14px;
      }
    }
  }
</style>
