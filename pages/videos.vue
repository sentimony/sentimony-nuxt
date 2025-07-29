<template>
  <div class="page">

    <h1>{{ pageTitle }}</h1>

    <div class="list">

      <div class="item item--rectangle"
        v-for="(i, index) in videosSortedByDate"
        :key="index"
        v-if="i.visible"
      >
        <router-link v-ripple v-if="i.slug" :to="'/video/' + i.slug + '/'" class="item__link">
          
          <div class="item__wrapper">
            <div class="item__cover">
              <img v-if="i.cover_th" class="item__img"
                :src="i.cover_th"
                :alt="i.title + ' Small Thumbnail'"
              >
              <div v-if="!i.cover_th"
                class="item__soon" v-html="texts.comingCover"
              />
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
    layout: 'default',
    data () {
      return {
        pageTitle: 'Videos',
        texts: AppContent.texts,
      }
    },
    async asyncData() {
      const { data } = await axios.get('videos.json')
      return { videos: data }
    },
    computed: {
      videosSortedByDate () {
        return sortBy(this.videos, 'date').reverse()
      }
    },
    head: {
      title: 'Videos',
      meta: [
        { name: 'description', content: 'Music videos, clips, lives and concerts of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg?01' }
      ]
    }
  }
</script>

<style lang="scss">
</style>
