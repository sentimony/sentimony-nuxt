<template>
  <div class="hero">
    <div class="hero__wrapper">
      <div class="hero__title">
        <div class="julius-sans-one-regular" v-html="siteTitle" />
        <div class="julius-sans-one-regular" v-html="siteSubTitle" />
        <!-- <div class="courier-prime-regular" v-html="siteSubTitle" />
        <div class="lekton-regular" v-html="siteSubTitle" /> -->
      </div>
      <div class="hero__description" v-html="siteDescription" />
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      title: String
    },
    data: () => ({
      siteTitle: 'Sentimony',
      siteSubTitle: 'Records',
      siteDescription: 'Psychedelic Music Label'
    })
  }
</script>

<style lang="scss">
  @use '@/assets/scss/coriolanMedia' as media;

  .hero {
    position: relative;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(#000, 0.5) 100%
    );
    padding: 7.5em 0;

    @include media.media(S) {
      padding: 8.5em 0;
    }

    @include media.media(M) {
      padding: 9.5em 0;
    }

    @include media.media(L) {
      padding: 10.5em 0;
    }

    @include media.media(XL) {
      padding: 11.5em 0;
    }

    &__wrapper {
      max-width: 777px;
      margin: 0 auto;
      padding: 0 10px;
      box-sizing: border-box;
    }

    &__title {
      // font-family: 'Julius Sans One', sans-serif;
      color: #fff;
      margin-bottom: 0.2em;
      // font-weight: 400;
      font-size: 40px;
      letter-spacing: 2px;
      text-transform: uppercase;

      .julius-sans-one-regular {
        font-family: 'Julius Sans One', sans-serif;
        font-weight: 400;
        font-style: normal;
      }

      // .courier-prime-regular {
      //   font-family: 'Courier Prime', monospace;
      //   font-weight: 400;
      //   font-style: normal;
      // }

      // .lekton-regular {
      //   font-family: 'Lekton', monospace;
      //   font-weight: 400;
      //   font-style: normal;
      // }

      @include media.media(S) {
        font-size: 55px;
        letter-spacing: 5px;
      }

      @include media.media(M) {
        font-size: 70px;
        letter-spacing: 8px;
      }

      @include media.media(L) {
        font-size: 85px;
        letter-spacing: 11px;
      }

      @include media.media(XL) {
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

      @include media.media(S) {
        font-size: 14px;
        letter-spacing: 8px;
      }

      @include media.media(M) {
        font-size: 16px;
        letter-spacing: 12px;
      }

      @include media.media(L) {
        font-size: 18px;
        letter-spacing: 16px;
      }

      @include media.media(XL) {
        font-size: 20px;
        letter-spacing: 20px;
      }
    }
  }
</style>
