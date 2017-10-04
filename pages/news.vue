<template>
  <div class="news">
    <h1>News</h1>
    <p v-for="i in news">
      <span v-if="i.date">{{ i.date | formatDate }} @ {{ i.title }}</span> | 
      <router-link :to="i.url">Reed More</router-link>
      <hr>
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
      { name: 'description', content: 'News page description' }
    ]
  }
}
</script>

<style lang="scss">
.news {
}
</style>
