<template>
  <div class="swiper-release-list">
    <div class="swiper-release-list__wrapper">
      <div v-for="i in releases" class="swiper-release-list__item">
        <nuxt-link class="" :to="'/release/' + i.slug">{{ i.title }}</nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data () {
    return {
      releases: []
    }
  },
  mounted () {
    return axios({
      url: 'https://sentimony-db.firebaseio.com/releases.json'
    })
    .then((res) => {
      this.releases = res.data;
    })
  }
}
</script>

<style lang="scss">
.swiper-release-list {
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
