<template>
  <div class="footr">

    <FootrMenu />
    <SocialMenu />

    <div class="footr__copyright">
      <div>2006 - {{ new Date().getFullYear() }} © Sentimony Records</div>
      <div>All Rights Reserved</div>
      <div>
        <img class="footr__copyright-logo" src="https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.2.svg?01" alt="Sentimony Records Logo SVG">
      </div>
    </div>

    <div class="footr__powered">
      <div>Design By <router-link to="/artist/apivniuk" v-ripple>Anton Pivniuk</router-link></div>
      <div>Development By <a href="https://github.com/sentimony/sentimony-nuxt" target="_blank" rel="noopener" v-ripple>Ihor Orlovskyi</a></div>
    </div>

  </div>
</template>

<script>
import FootrMenu from '@/components/FootrMenu.vue'
import SocialMenu from '@/components/SocialMenu.vue'

export default {
  components: {
    FootrMenu,
    SocialMenu
  }
}
</script>

<style lang="scss">
.footr {
  padding: 100px .6em;
  background-color: #000;
  // background-color: rgba(#000, .88);
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
