<template>
  <div class="page">
    <h1>Releases</h1>
    <div class="list">
      <div v-if="loading">Loading...</div>
      <div v-else
        class="item"
        v-for="(i, index) in releasesStore"
        :key="index"
        v-if="i.visible"
      >
        <router-link v-ripple v-if="i.slug" :to="'/release/' + i.slug" class="item__link">
          <div class="item__wrapper">
            <div class="item__cover">
              <img v-if="i.cover" class="item__img"
                :src="'https://content.sentimony.com/assets/img/releases/small/' + i.slug + '.jpg'"
                :srcset="'https://content.sentimony.com/assets/img/releases/small/' + i.slug + '.jpg 1x, https://content.sentimony.com/assets/img/releases/small-retina/' + i.slug + '.jpg 2x'"
                :alt="i.title + ' Small Thumbnail'"
              >
              <div v-else class="item__soon" v-html="texts.comingArtwork"/>
            </div>
            <div v-if="i.coming_soon" class="item__status--green">Coming Soon</div>
            <div v-if="i.new" class="item__status--red">Out Now</div>
          </div>
          <div class="item__title">
            {{ i.title }}
            </div>
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
      const { data } = await axios.get('releases.json')
      return { releases: data }
    },
    computed: {
      loading() {
        return this.$store.getters.loading
      },
      releasesStore() {
        return this.$store.getters.loadedReleasesSortedByDate
      }
    },
    head: {
      title: 'Releases',
      meta: [
        { name: 'description', content: 'Releases of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-releases.jpg' }
      ]
    }
  }
</script>

<style lang="scss">
</style>
