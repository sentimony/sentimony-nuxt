<template>
  <div class="flex-sticky">
    <div class="flex-sticky__fractal">
      <Fractal/>
    </div>
    <div class="flex-sticky__header">
      <HeaderMenu/>
    </div>
    <div class="flex-sticky__content">
      <nuxt/>
    </div>
    <div class="flex-sticky__footer">
      <FooterBlock/>
    </div>
  </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Montserrat');
@import '../node_modules/normalize.css/normalize.css';
$text-color: #c3c3c3;
$link-color: darken($text-color, 15%);
$link-color-hover: lighten($link-color, 30%);

body {
  margin: 0;
  font: 400 15px/1.5 'Montserrat', sans-serif;
  text-align: center;
  background-color: #111;
  color: $text-color;
}

a {
  color: $link-color;
  text-decoration: none;
  outline: 0;
  transition: color .2s ease-in-out;

  &:hover,
  &:focus {
      color: $link-color-hover;
  }
}

p {
  margin: 0 0 .8em;
}

img {
  max-width: 100%;
}

html {
  height: 100%;
}

body {
  height: 100%;
}

#__nuxt {
  height: 100%;
}

.flex-sticky {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 975px;
  margin: 0 auto;

  &__fractal {
  }

  &__header {
  }

  &__content {
    flex: 1;
    padding: 2em .6em;
    position: relative;
    // background-color: #000;
  }

  &__footer {
  }
}

// selection color
$selection-color: #8e44ad;

::selection {
  background: $selection-color;
}

::-moz-selection {
  background: $selection-color;
}

img::selection {
  background: transparent;
}

img::-moz-selection {
  background: transparent;
}

body {
  -webkit-tap-highlight-color: $selection-color;
}
</style>

<script>
import Fractal from '~components/Fractal.vue'
import HeaderMenu from '~components/HeaderMenu.vue'
import FooterBlock from '~components/FooterBlock.vue'

export default {
  components: {
    Fractal,
    HeaderMenu,
    FooterBlock
  }
}
</script>
