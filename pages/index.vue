<template>
  <div class="home">
    <img class="home__logo" src="/svg-icons/sentimony-records-logo.svg">
    <h1 class="home__title">Sentimony Records</h1>
    <p class="home__subtitle">Psychill Music Label</p>
  </div>
</template>

<script>
export default {
  head: {
    title: 'About',
    meta: [
      { name: 'description', content: 'About page description' }
    ]
  }
}
</script>

<style lang="scss">
@import '../node_modules/coriolan-ui/tools/variables';
@import '../node_modules/coriolan-ui/mixins/media';

.home {
  padding-top: 4em;

  &__logo {
    display: block;
    max-width: 130px;
    margin: 0 auto;
    position: relative;
  }

  &__title {
    margin: .2em 0;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-size: 2em;

    @include media(M) {
      letter-spacing: 3px;
      font-size: 3em;
    }
  }

  &__subtitle {
    margin: .4em 0;
    text-transform: uppercase;
    letter-spacing: 4px;
    font-size: .8em;

    @include media(M) {
      letter-spacing: 16px;
      font-size: 1.2em;
    }
  }
}
</style>
