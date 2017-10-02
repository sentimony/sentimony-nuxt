<template>
  <div class="swiper-artist-list">
    <div class="title">Artists</div>
    <div class="list">
      <div v-for="i in artists" class="item">
        <router-link :to="'/artist/' + i.slug + '/'" class="item__link" active-class="is-selected">
          <div class="item__wrapper">
            <div class="item__cover">
              <img v-if="i.photo" class="item__img"
                :src="'https://content.sentimony.com/assets/img/artists/small/' + i.slug + '.jpg'"
                :srcset="'https://content.sentimony.com/assets/img/artists/small/' + i.slug + '.jpg 1x, https://content.sentimony.com/assets/img/artists/small-retina/' + i.slug + '.jpg 2x'"
                :alt="i.title + ' Small Thumbnail'"
              >
              <div v-else class="item__soon">Photo<br>coming soon</div>
            </div>
          </div>
          <div class="item__title">{{ i.title }}</div>
        </router-link>
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
@import '../node_modules/coriolan-ui/tools/variables';
@import '../node_modules/coriolan-ui/mixins/media';
@import '../assets/scss/item';
@import '../assets/scss/title';
@import '../assets/scss/list';
</style>
