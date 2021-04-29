<template>
  <div class="page">
    <h1>Playlists</h1>
    <div class="list">
      <div v-for="i in sortByDate" class="item">
        <router-link v-ripple v-if="i.slug" :to="'/playlist/' + i.slug + '/'" class="item__link">
          <div class="item__wrapper">
            <div class="item__cover">
              <img v-if="i.cover" class="item__img"
                :src="'https://content.sentimony.com/assets/img/releases/small/' + i.cat_no + '/' + i.slug + '.jpg'"
                :srcset="'https://content.sentimony.com/assets/img/releases/small/' + i.cat_no + '/' + i.slug + '.jpg 1x, https://content.sentimony.com/assets/img/releases/small-retina/' + i.cat_no + '/' + i.slug + '.jpg 2x'"
                :alt="i.title + ' Small Thumbnail'"
              >
              <div v-else class="item__soon" v-html="texts.comingArtwork"/>
            </div>
            <div v-if="i.coming_soon" class="item__status--green">Coming Soon</div>
            <div v-if="i.new" class="item__status--red">Out Now</div>
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
  import AppContent from '~/plugins/app-content'

  export default {
    data () {
      return {
        texts: AppContent.texts,
      }
    },
    async asyncData() {
      const { data } = await axios.get('playlists.json')
      return { playlists: data }
    },
    computed: {
      sortByDate () {
        return sortBy(this.playlists, 'date').reverse().reverse()
      }
    },
    // filters: {
    //   year (date) {
    //     return date.split('-')[0]
    //   }
    // },
    head: {
      title: 'Playlists',
      meta: [
        { name: 'description', content: 'Playlists of Sentimony Records' },
        { property: 'og:image', content: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/og%2Fog-default.jpg?alt=media&token=85a8d7a3-ab49-4cff-9df9-fd3e2478e780' }
      ]
    }
  }
</script>

<style lang="scss">
</style>
