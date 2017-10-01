<template>
  <div class="swiper-artist-list">
    <div class="swiper-artist-list__wrapper">
      <div v-for="i in artists" class="swiper-artist-list__item">
        <nuxt-link class="" :to="'/artist/' + i.slug">{{ i.title }}</nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      artists: []
    }
  },
  mounted () {
    return axios({
      url: 'https://sentimony-db.firebaseio.com/artists.json'
    })
    .then((res) => {
      this.artists = res.data;
    })
  }
}
</script>

<style lang="scss">
.swiper-artist-list {
  width: 100%;
  overflow-x: scroll;

  &__wrapper {
    padding: 20px 0;
    display: flex;
  }

  &__item {
    padding: 20px;
    max-width: 80px;
  }
}
</style>
