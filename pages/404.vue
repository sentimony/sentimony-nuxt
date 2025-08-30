<template>
  <div class="">
    <div class="">

      <div class="" style="position: relative;">
        <SvgTriangle />

        <br>
        <br>
        <br>
        <p>
          <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" fill="#DBE1EC" viewBox="0 0 48 48"><path d="M22 30h4v4h-4zm0-16h4v12h-4zm1.99-10C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z"></path></svg>
        <!-- </p> -->
        <br>
        <br>
        <!-- <p> -->
          {{ errorPageTitle }}

        <!-- </p> -->
        <br>
        <!-- <p> -->
          Please, back to the 
        <!-- </p> -->
        <br>
        <br>
        <!-- <p> -->
          <span class="app-btn">
            <nuxt-link class="app-btn__btn" to="/">
              <img :src="logoImg" alt="Deezer Icon" class="app-btn__btn-img" />
              <span class="app-btn__btn-text">Home Page</span>
            </nuxt-link>
          </span>
        </p>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
        <br>
      </div>

      <!-- <div class="content">
        <div class="content__wrapper" style="text-align: center;">

          <p>
            <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" fill="#DBE1EC" viewBox="0 0 48 48"><path d="M22 30h4v4h-4zm0-16h4v12h-4zm1.99-10C12.94 4 4 12.95 4 24s8.94 20 19.99 20S44 35.05 44 24 35.04 4 23.99 4zM24 40c-8.84 0-16-7.16-16-16S15.16 8 24 8s16 7.16 16 16-7.16 16-16 16z"></path></svg>
          </p>
          <p>
            {{ errorPageTitle }}
          </p>
          <p>
            <a href="/" class="error-link nuxt-link-active">Back to the home page</a>
          </p>


        </div>
      </div> -->

    </div>
  </div>
</template>

<script>
import SvgTriangle from '@/components/SvgTriangle.vue'

export default {
  layout: 'error',
  components: {
    SvgTriangle,
  },
  data: () => ({
    errorPageTitle: 'This page could not be found',
    logoImg: 'https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.1.svg?01',
  }),
  head: {
    title: 'Home',
    meta: [
      { name: 'description', content: 'Home of Sentimony Records' },
      { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg?01' }
    ]
  }
}
</script>

<style lang="scss">
@use '@/assets/scss/coriolanMedia' as media;
@use '@/assets/scss/buttons';

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

      @include media.media(M) {
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
