<template>
  <!-- <div class="menu-social">
    <div class="menu-social__caption">{{ social.follow }}</div>
    <div class="menu-social__list">
      <a v-for="i in social.data" v-if="i.isVisible" class="menu-social__link" :href="i.url" target="_blank" rel="noopener">
        <img class="menu-social__icon" :src="'/assets/img/svg-icons/' + i.icon + '.svg'" :alt="i.title + ' Icon'">
        <span class="menu-social__tooltip">{{ i.title }}</span>
      </a>
    </div>
  </div> -->
</template>

<script>
// import axios from '~/plugins/axios'

// export default {
//   async asyncData() {
//     const { data } = await axios.get('social.json')
//     return { social: data }
//   }
// }
</script>

<style lang="scss">
.menu-social {
  margin: 0 auto 2em;

  &__caption {
  }

  &__list {
    padding-top: 1.2em;
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
  }

  &__link {
    padding: .1em .9em;
    position: relative;
  }

  &__icon {
    width: 20px;
  }

  &__tooltip {
    font-size: .75em;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate3d(-50%,-100%,0);
    transition: opacity .2s ease;
    opacity: 0;
    visibility: hidden;

    .menu-social__link:hover & {
      opacity: 1;
      visibility: visible;
    }
  }
}
</style>
