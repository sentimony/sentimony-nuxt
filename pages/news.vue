<template>
  <div class="page">
    <h1>News</h1>

    <p
      v-for="(i, index) in sortByDate"
      :key="index"
      v-if="!i.coming_soon"
    >
      <small>{{ i.date | formatDate }}</small>
      <br>
      <!-- <img v-if="i.cover_th"
        class="news-img"
        :src="i.cover_th"
        :alt="i.title"
      > -->
      <!-- <br> -->
      <router-link v-ripple :to="'../' + `${i.location ? 'event' : 'release'}` + '/' + i.slug">{{ i.title }}</router-link>
      <!-- {{ i.title }}
      <router-link v-ripple :to="'../' + `${i.location ? 'event' : 'release'}` + '/' + i.slug">
        <small>Reed More</small>
      </router-link> -->
    </p>

    <!-- <ul class="timeline timeline-centered">
      <li class="timeline-item"
        v-for="(i, index) in sortByDate"
        :key="index"
        :class="i.date.includes('-12-31T00:00:00.000Z') ? 'period' : ''"
      >
        <div class="timeline-info" v-if="!i.date.includes('-12-31T00:00:00.000Z')">
          <span>{{ i.date | formatDate }}</span>
        </div>
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <h3 class="timeline-title" v-if="i.date.includes('-12-31T00:00:00.000Z')">{{ i.date | year }}</h3>
          <h3 class="timeline-title" v-if="i.title">{{ i.title }}</h3>
          <p v-if="i.title">Nullam vel sem. Nullam vel sem. Integer ante arcu, accumsan a, consectetuer eget, posuere ut, mauris. Donec orci lectus, aliquam ut, faucibus non, euismod id, nulla. Donec vitae sapien ut libero venenatis faucibus. ullam dictum felis eu pede mollis pretium. Pellentesque ut neque.</p>
          <router-link class="news__btn"
            v-ripple v-if="i.url"
            :to="i.url"
          >Reed More</router-link>
        </div>
      </li>
    </ul> -->

  </div>
</template>

<script>
  import axios from '~/plugins/axios'
  import sortBy from 'lodash/sortBy'
  import moment from 'moment'

  export default {
    async asyncData() {
      const [releasesRes, eventsRes, videosRes] = await Promise.all([
        axios.get('releases.json'),
        axios.get('events.json'),
        axios.get('videos.json')
      ]);
      const news = Object.assign(
        releasesRes.data, 
        eventsRes.data,
        videosRes.data
        )
      return { news }
    },
    computed: {
      sortByDate () {
        return sortBy(this.news, 'date').reverse()
      }
    },
    filters: {
      formatDate: function (date) {
        if (date) {
          return moment(String(date)).format('DD MMM YYYY');
        }
      },
    },
    head: {
      title: 'News',
      meta: [
        { name: 'description', content: 'News of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg' }
      ]
    }
  }
</script>

<style lang="scss">
  // @import '../node_modules/coriolan-ui/tools/variables';
  // @import '../node_modules/coriolan-ui/mixins/media';
  
  // .news {
  //   padding-bottom: 30px;

  //   @include media(M) {
  //     padding-bottom: 60px;
  //   }
  // }

  // .news-img {
  //   height: 120px;
  //   display: block;
  //   margin: 0 auto;
  // }
</style>
