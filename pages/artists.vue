<template>
  <div class="page">
    <h1>Artists</h1>
    <div class="list">
      <div v-if="loading">Loading...</div>
      <div v-else
        class="item"
        v-for="(i, index) in artistsStore"
        :key="index"
        v-if="i.visible"
      >
        <router-link v-ripple :to="'/artist/' + i.slug + '/'" class="item__link">
          <div class="item__wrapper">
            <div class="item__cover">
              <img v-if="i.photo" class="item__img"
                :src="'https://content.sentimony.com/assets/img/artists/small/' + i.slug + '.jpg'"
                :srcset="'https://content.sentimony.com/assets/img/artists/small/' + i.slug + '.jpg 1x, https://content.sentimony.com/assets/img/artists/small-retina/' + i.slug + '.jpg 2x'"
                :alt="i.title + ' Small Thumbnail'"
              >
              <div v-else class="item__soon" v-html="texts.comingPhoto"/>
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
  import AppContent from '~/plugins/app-content'

  export default {
    data () {
      return {
        texts: AppContent.texts,
      }
    },
    async asyncData() {
      const { data } = await axios.get('artists.json')
      return { artists: data }
    },
    computed: {
      loading() {
        return this.$store.getters.loading
      },
      artistsStore() {
        return this.$store.getters.loadedArtistsSortedByDate
      }
    },
    head: {
      title: 'Artists',
      meta: [
        { name: 'description', content: 'Artists of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg' }
      ]
    }
  }
</script>

<style lang="scss">
</style>
