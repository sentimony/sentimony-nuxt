<script setup lang="ts">
const logoOldUrl = "https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo.svg?01"
const logoOldAlt = "Sentimony Records Logo SVG"
const logoNewUrlv1 = "https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.1.svg?01"
const logoNewAltv1 = "Sentimony Records Logo v3.1 SVG"
const logoNewUrlv2 = "https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.2.svg?01"
const logoNewAltv2 = "Sentimony Records Logo v3.2 SVG"
const logoNewUrlv3 = "https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.3.svg?01"
const logoNewAltv3 = "Sentimony Records Logo v3.3 SVG"
const aboutDescription = "<p>Sentimony Records is an independent psychedelic music label founded in Kyiv, Ukraine, in the autumn of 2006 by the visionary Ihor Orlovskyi, also known by his moniker 🇺🇦 <a href='/artist/irukanji/'>Irukanji</a>.</p><p>The label's main mission is to contribute to the growth of talented psy-minded artists, enriching the global soundscape with unique and exciting musical journeys.</p><p>Over the years, Sentimony Records has focused on its most beloved psychedelic subgenres: <a href='/playlist/dark-prog-zenonesque/'>DarkProg Psytrance</a> and <a href='/playlist/psychill-psybient/'>Trippy Psychill</a>. Through a deep commitment to these styles, the label continues to captivate listeners and inspire the worldwide psychedelic music community.</p>"

const PageTitle = 'Home';
useSeoMeta({
  title: PageTitle,
  description: PageTitle + ' of Sentimony Records',
  ogImage: '',
});
</script>

<template>
  <div class="index">
    <div class="index__wrapper">
      <p>
        <img class="index__logo" :src="logoNewUrlv3" :alt="logoNewAltv3" />
        <!-- <img class="index__logo" :src="logoOldUrl" :alt="logoOldAlt"/> -->
      </p>
      <div class="index__description" v-html="aboutDescription"></div>
      <p>
        <!-- <img class="index__logo" :src="logoNewUrlv1" :alt="logoNewAltv1"/> -->
        <!-- <img class="index__logo" :src="logoNewUrlv2" :alt="logoNewAltv3"/> -->
        <!-- <img class="index__logo" :src="logoNewUrlv3" :alt="logoNewAltv3"/> -->
        <img class="index__logo" :src="logoOldUrl" :alt="logoOldAlt" />
      </p>
    </div>
  </div>
</template>

<style lang="scss">
.index {
  background-color: rgba(#000, 0.5);
  position: relative;

  &__description {
    text-align: left;

    & > p {
      text-indent: 20px;
    }
  }

  &__logo {
    display: inline-block;
    width: 60px;
    height: auto;
    margin: 0 10px;
  }

  &__wrapper {
    max-width: 500px;
    margin: 0 auto;
    padding: 3em 10px;
    box-sizing: border-box;

    p {
      a {
        // color: #ff595e;
        color: #56b258;
        text-indent: initial;

        &:hover {
          // color: red;
          color: green;
        }
      }
    }
  }
}
</style>
