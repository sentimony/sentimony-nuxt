<template>
  <div class="event">
    <h1>{{ event.title }}</h1>
    <p v-if="event.date"><!-- Date:  -->{{ event.date | formatDate }}</p>
    <p v-if="event.location"><!-- Location:  -->{{ event.location }}</p>
    <hr>
    <p>Artists:</p>
    <p
      v-for="(i, index) in event.lineup"
      :key="index"
      v-html="i.musician"
    />
    <hr>
    <p>Links:</p>
    <p
      v-for="(i, index) in event.links"
      :key="index"
    >
      <a v-if="i.url" :href="i.url" target="_blank" rel="noopener">{{ i.id }}</a>
    </p>

    <div class="content">
      <div class="content__wrapper">


        
      </div>
    </div>
  </div>

</template>

<script>
import axios from '@/plugins/axios'
import moment from 'moment'

export default {
  layout: 'default',
  components: {
  },
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
  head() {
    return {
      title: this.event.title,
      meta: [
        { name: 'description', content: this.event.title + ' description' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg?01' }
      ]
    }
  }
}
</script>

<style lang="scss">
@use '@/assets/scss/page';
@use '@/assets/scss/content';

.event {
  @extend .page;
}
</style>
