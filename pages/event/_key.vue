<template>
  <div class="release">
    <h1>{{ event.title }}</h1>
    <p v-if="event.date">Date: {{ event.date | formatDate }}</p>
    <p v-for="i in event.lineup">{{ i.musician }}</p>
  </div>
</template>

<script>
import axios from '~/plugins/axios'
import moment from 'moment'

export default {
  head: {
    title: 'Event',
    meta: [
      { name: 'description', content: 'Event description' }
    ]
  },
  async asyncData({ route }) {
    const { key } = route.params
    const { data } = await axios.get(`events/${key}.json`)
    return {
      event: data
    }
  },
  filters: {
    formatDate: function (date) {
      var moment = require('moment');
      if (date) {
        return moment(String(date)).format('DD MMM YYYY');
      }
    }
  }
}
</script>

<style lang="scss">
.event {
}
</style>
