<template>
  <div class="hero">
    <div class="hero__wrapper">
      <div class="hero__title">{{ siteTitle }}</div>
      <div class="hero__description">{{ siteDescription }}</div>
    </div>
  </div>
</template>

<script>
  export default {
    data: () => ({
      siteTitle: 'Sentimony Records',
      siteDescription: 'Psychedelic Music Label'
    })
  }
</script>


<style lang="scss">
  @import '../node_modules/coriolan-ui/tools/variables';
  @import '../node_modules/coriolan-ui/mixins/media';

  .hero {
    position: relative;
    background: linear-gradient(to bottom, transparent 0%, rgba(#000,.5) 100%);
    padding: 7.5em 0;

    @include media(S) {
      padding: 8.5em 0;
    }

    @include media(M) {
      padding: 9.5em 0;
    }

    @include media(L) {
      padding: 10.5em 0;
    }

    @include media(XL) {
      padding: 11.5em 0;
    }

    &__wrapper {
      max-width: 777px;
      margin: 0 auto;
      padding: 0 10px;
      box-sizing: border-box;
    }

    &__title {
      font-family: 'Julius Sans One', sans-serif;
      color: #fff;
      margin-bottom: .2em;
      font-weight: 400;
      font-size: 40px;
      letter-spacing: 2px;
      text-transform: uppercase;

      @include media(S) {
        font-size: 55px;
        letter-spacing: 5px;
      }

      @include media(M) {
        font-size: 70px;
        letter-spacing: 8px;
      }

      @include media(L) {
        font-size: 85px;
        letter-spacing: 11px;
      }

      @include media(XL) {
        font-size: 100px;
        letter-spacing: 14px;
      }
    }

    &__description {
      font-family: 'Julius Sans One', sans-serif;
      color: #fff;
      font-weight: 400;
      line-height: 2;
      font-size: 12px;
      letter-spacing: 4px;

      @include media(S) {
        font-size: 14px;
        letter-spacing: 8px;
      }

      @include media(M) {
        font-size: 16px;
        letter-spacing: 12px;
      }

      @include media(L) {
        font-size: 18px;
        letter-spacing: 16px;
      }

      @include media(XL) {
        font-size: 20px;
        letter-spacing: 20px;
      }
    }
  }
</style>
