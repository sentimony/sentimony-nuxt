<template>
  <div class="page">

    <h1>Releases</h1>

    <div class="list">
      <div class="item"
        v-for="(i, index) in sortByDate"
        :key="index"
        v-if="i.visible"
      >
        <router-link v-ripple v-if="i.slug" :to="'/release/' + i.slug + '/'" class="item__link">
          <div class="item__wrapper">
            <div class="item__cover">
              <img v-if="i.cover_th" class="item__img"
                :src="i.cover_th"
                :alt="i.title + ' Small Thumbnail'"
              >
              <img v-if="!i.cover_th && i.cover" class="item__img"
                :src="'https://content.sentimony.com/assets/img/releases/small/' + i.slug + '.jpg'"
                :srcset="'https://content.sentimony.com/assets/img/releases/small/' + i.slug + '.jpg 1x, https://content.sentimony.com/assets/img/releases/small-retina/' + i.slug + '.jpg 2x'"
                :alt="i.title + ' Small Thumbnail'"
              >
              <div v-if="!i.cover_th && !i.cover"
                class="item__soon" v-html="texts.comingCover"
              />
            </div>
            <div v-if="i.coming_soon" class="item__status--green">Coming Soon</div>
            <div v-if="i.new" class="item__status--red">Out Now</div>
          </div>
          <div class="item__title">
            {{ i.title }}
            <!-- <small>{{ i.format }}</small> -->
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
    // layout: 'release',
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
      sortByDate () {
        return sortBy(this.releases, 'date').reverse()
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
