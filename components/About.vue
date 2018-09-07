<template>
  <div class="about">
    <div class="about__wrapper">
      <p><img class="about__logo" src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo.svg" alt="Sentimony Records Logo SVG"></p>
      <p>Sentimony Records is an independent record label started in Kyiv, Ukraine during the autumn 2006 by Ihor Orlovskyi also known as <router-link to="/artist/irukanji/">Irukanji</router-link>.</p>
      <p>{{ aboutDescription }}</p>
    </div>
  </div>
</template>

<script>
  export default {
    data: () => ({
      aboutDescription: "Not limiting itself to one specific genre, the label main mission is to contribute the growth of the psychedelic trance and chillout scenes."
    })
  }
</script>


<style lang="scss">
  // @import '../node_modules/coriolan-ui/tools/variables';
  // @import '../node_modules/coriolan-ui/mixins/media';

  .about {
    background-color: rgba(#000,.5);
    position: relative;

    &__logo {
      display: block;
      width: 60px;
      height: auto;
      margin: 0 auto;
    }

    &__wrapper {
      max-width: 460px;
      margin: 0 auto;
      padding: 5em 10px;
      box-sizing: border-box;

      p {

        a {
          color: #ff595e;

          &:hover {
            color: red;
          }
        }
      }
    }
  }
</style>
