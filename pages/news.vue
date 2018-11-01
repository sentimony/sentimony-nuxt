<template>
  <div class="news">
    <h1>News</h1>
    <p v-for="i in news">
      <span v-if="i.date">{{ i.date | formatDate }} @ {{ i.title }}</span> |
      <router-link v-ripple :to="i.url">Reed More</router-link>
    </p>
  </div>
</template>

<script>
  import axios from '~/plugins/axios'
  import sortBy from 'lodash/sortBy'
  import moment from 'moment'

  export default {
    async asyncData() {
      const { data } = await axios.get('news.json')
      return { news: data }
    },
    filters: {
      formatDate: function (date) {
        if (date) {
          return moment(String(date)).format('DD MMM YYYY');
        }
      }
    },
    head: {
      title: 'News',
      meta: [
        { name: 'description', content: 'News of Sentimony Records' },
        { property: 'og:image', content: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/og%2Fog-default.jpg?alt=media&token=85a8d7a3-ab49-4cff-9df9-fd3e2478e780' }
      ]
    }
  }
</script>

<style lang="scss">
  @import '../assets/scss/page';

  .news {
    @extend .page;
  }
</style>
