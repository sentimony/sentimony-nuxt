<template>
  <div class="footr">

    <MenuMain/>
    <MenuSocial/>

    <div class="footr__copyright">
      <div>2006 - {{ new Date().getFullYear() }} © Sentimony Records</div>
      <div>All Rights Reserved</div>
      <div>
        <img class="footr__copyright-logo" src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.2.svg?01" alt="Sentimony Records Logo SVG">
      </div>
    </div>

    <div class="footr__powered">
      <div>Design by <a href="https://www.facebook.com/apivniuk" target="_blank" rel="noopener">Anton Pivniuk</a></div>
      <div>Development by <a href="https://github.com/sentimony/sentimony-nuxt" target="_blank" rel="noopener">Ihor Orlovskyi</a></div>
    </div>

  </div>
</template>

<script>
  import MenuMain from '@/components/MenuMain.vue'
  import MenuSocial from '@/components/MenuSocial.vue'

  export default {
    components: {
      MenuMain,
      MenuSocial
    }
  }
</script>

<style lang="scss">
  .footr {
    padding: 100px .6em;
    background-color: #000;
    font-size: 12px;
    color: rgba(#fff,.5);
    position: relative;

    &__copyright {
      margin: 0 auto 2em;

      &-logo {
        display: block;
        margin: .5em auto 0;
        max-width: 30px;
        height: auto;
      }
    }

    &__powered {
      margin: 0 auto 2em;
      font-size: 10px;
    }
  }
</style>
