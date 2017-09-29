<template>
  <div class="events">
    <h1>Events</h1>
    <div class="events__list">
      <p v-for="i in sortByDate" class="events__item">
        <router-link :to="i.url" class="events__link" v-if="i.date">{{ i.date | formatDate }} @ {{ i.title }}</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from '~/plugins/axios'
import sortBy from 'lodash/sortBy'
import moment from 'moment'

export default {
  async asyncData() {
    const { data } = await axios.get('events.json')
    return { events: data }
  },
  computed: {
    sortByDate () {
      return sortBy(this.events, 'date').reverse()
    }
  },
  filters: {
    year (date) {
      return date.split('-')[0]
    },
    formatDate: function (date) {
      if (date) {
        return moment(String(date)).format('DD MMM YYYY');
      }
    }
  },
  head: {
    title: 'Events',
    meta: [
      { name: 'description', content: 'Events of Sentimony Records' }
    ]
  }
}
</script>

<style lang="scss">
.events {
}
</style>
