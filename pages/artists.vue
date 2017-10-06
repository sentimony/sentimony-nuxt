<template>
  <div class="artists">
    <h1>Artists</h1>
    <div class="list">
      <div v-for="i in sortByCategoryId" v-if="i.category_id" class="item">
        <router-link :to="'/artist/' + i.slug + '/'" class="item__link">
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
import axios from '~/plugins/axios'
import sortBy from 'lodash/sortBy'

export default {
  head: {
    title: 'Artists',
    meta: [
      { name: 'description', content: 'Artists of Sentimony Records' }
    ]
  },
  async asyncData() {
    const { data } = await axios.get('artists.json')
    return { artists: data }
  },
  computed: {
    sortByCategoryId () {
      return sortBy(this.artists, 'category_id')
    }
  }
}
</script>

<style lang="scss">
@import '../assets/scss/item';
@import '../assets/scss/list';

.artists {
  max-width: 1278px;
  margin: 0 auto;
}
</style>
