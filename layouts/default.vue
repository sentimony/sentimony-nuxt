<template>
  <div class="flex-sticky">
    <!-- <div class="flex-sticky__fractal">
      <Fractal/>
    </div> -->
    <div class="flex-sticky__header">
      <Headr/>
    </div>
    <div class="flex-sticky__content">
      <nuxt/>
    </div>
    <div class="flex-sticky__footer">
      <Donate/>
      <Footr/>
    </div>
  </div>
</template>

<script>
// import Fractal from '~/components/Fractal.vue'
import Headr from '~/components/Headr.vue'
import Donate from '~/components/Donate.vue'
import Footr from '~/components/Footr.vue'

export default {
  components: {
    // Fractal,
    Headr,
    Donate,
    Footr
  }
}
</script>

<style lang="scss">
@import 'https://fonts.googleapis.com/css?family=Montserrat';
@import 'https://fonts.googleapis.com/css?family=Julius+Sans+One';
@import '../node_modules/normalize.css/normalize.css';
@import '../node_modules/coriolan-ui/tools/variables';

html {
  position: relative;
  height: 100%;
}

body {
  margin: 0;
  background-color: #8f0100;
  background-image:  url(https://content.sentimony.com/assets/img/backgrounds/sombrero-red.jpg);
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
  font: 400 15px/1.5 'Montserrat', sans-serif;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  -webkit-text-size-adjust: 100%;
  position: relative;
  height: 100%;
  text-align: center;
  min-width: $XS;
}

h1,
h2,
h3,
h4,
h5,
h6,
p {
  font-weight: 400;
  margin: .5em 0;
}

a {
  display: inline-block;
  color: #fff;
  text-decoration: none;
}

img {
  max-width: 100%;
  display: inline-block;
}

hr {
  border: solid rgba(#000,.3);
  border-width: 1px 0 0;
  margin: 1em 0;
}

#__nuxt {
  height: 100%;
}

.flex-sticky {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;

  // &__fractal {
  // }

  &__header {
  }

  &__content {
    flex: 1;
    // padding: 2em .6em;
    position: relative;
    // background-color: #000;
  }

  &__footer {
  }
}

$selectionColor: rgba(#ffd700,.5);

::selection {
  background: $selectionColor;
}

::-moz-selection {
  background: $selectionColor;
}

img::selection {
  background: transparent;
}

img::-moz-selection {
  background: transparent;
}

body {
  -webkit-tap-highlight-color: transparent;
}
</style>
