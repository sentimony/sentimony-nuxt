<template>
  <div class="release">
    <h1>{{ event.title }}</h1>
    <p v-if="event.date"><!-- Date:  -->{{ event.date | formatDate }}</p>
    <p v-if="event.location"><!-- Location:  -->{{ event.location }}</p>
    <hr>
    <p>Artists:</p>
    <p v-for="i in event.lineup">{{ i.musician }}</p>
    <hr>
    <p>Links:</p>
    <p v-for="i in event.links">
      <a v-if="i.url" :href="i.url" target="_blank" rel="noopener">{{ i.id }}</a>
    </p>
  </div>
</template>

<script>
import axios from '~/plugins/axios'
import moment from 'moment'

export default {
  async asyncData({ route }) {
    const { key } = route.params
    const { data } = await axios.get(`events/${key}.json`)
    return { event: data }
  },
  filters: {
    formatDate: function (date) {
      var moment = require('moment');
      if (date) {
        return moment(String(date)).format('DD MMM YYYY');
      }
    }
  },
  head () {
    return {
      title: this.event.title,
      meta: [
        { name: 'description', content: this.event.title + ' description' }
      ]
    }
  }
}
</script>

<style lang="scss">
.event {
}
</style>
