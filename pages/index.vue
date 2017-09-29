<template>
  <div class="home">
    <Hero/>
    <About/>
  </div>
</template>

<script>
import Hero from '~/components/Hero.vue'
import About from '~/components/About.vue'

export default {
  components: {
    Hero,
    About
  },
  head: {
    title: 'Home',
    meta: [
      { name: 'description', content: 'Home of Sentimony Records' }
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
