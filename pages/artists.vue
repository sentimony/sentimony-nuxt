<template>
  <div class="artists">
    <h1>Artists</h1>
    <div class="list">
      <div v-for="i in sortByCategoryId" v-if="i.category_id" class="item">
        <router-link v-ripple :to="'/artist/' + i.slug + '/'" class="item__link">
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
    async asyncData() {
      const { data } = await axios.get('artists.json')
      return { artists: data }
    },
    computed: {
      sortByCategoryId () {
        return sortBy(this.artists, 'category_id')
      }
    },
    head: {
      title: 'Artists',
      meta: [
        { name: 'description', content: 'Artists of Sentimony Records' },
        { property: 'og:image', content: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/og%2Fog-default.jpg?alt=media&token=85a8d7a3-ab49-4cff-9df9-fd3e2478e780' }
      ]
    }
  }
</script>

<style lang="scss">
@import '../assets/scss/page';
@import '../assets/scss/item';
@import '../assets/scss/list';

.artists {
  @extend .page;
  max-width: 1278px;
  margin: 0 auto;
}
</style>
