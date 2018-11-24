<template>
  <div class="youtube-page">
    <h1>YouTube</h1>
    <div class="youtube-page__frame-holder">
      <iframe
        class="youtube-page__frame"
        v-if="youtubePlaylistIdAllTracks"
        :src="'https://www.youtube.com/embed/videoseries?list=' + youtubePlaylistIdAllTracks"
        title="YouTube playlist frame'"
      />
    </div>
    <table>
      <tr>
        <th>UPC</th>
        <th>Date</th>
        <th>Cat.No</th>
        <th>Title</th>
      </tr>
      <tr v-for="i in sortByDate" v-if="i.upc">
        <td>{{ i.upc }}</td>
        <td>{{ i.date | formatDate }}</td>
        <td style="text-transform:uppercase;">{{ i.cat_no }}:</td>
        <td><router-link v-ripple :to="'/yt/' + i.slug + '/'">{{ i.title }}</router-link></td>
      </tr>
    </table>
  </div>
</template>

<script>
  import axios from '~/plugins/axios'
  import sortBy from 'lodash/sortBy'

  export default {
    data: () => ({
      youtubePlaylistIdAllTracks: 'PLp2GaPnw5O3PWcqMkLjyj8lMroqjzVpDn'
    }),
    async asyncData() {
      const { data } = await axios.get('releases.json')
      return { releases: data }
    },
    computed: {
      sortByDate () {
        return sortBy(this.releases, 'date').reverse()
      }
    },
    filters: {
      formatDate: function (date) {
        var moment = require('moment');
        if (date) {
          return moment(String(date)).format('YYYY-MM-DD');
        }
      }
    },
    head: {
      title: 'For YouTube',
      meta: [
        { name: 'description', content: '' },
        { property: 'og:image', content: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/og%2Fog-default.jpg?alt=media&token=85a8d7a3-ab49-4cff-9df9-fd3e2478e780' }
      ]
    }
  }
</script>

<style lang="scss">
  @import '../../node_modules/coriolan-ui/mixins/ratio';
  @import '../../assets/scss/iframe-size';

  .youtube-page {
    padding: 2em 0;
    max-width: 600px;
    margin: 0 auto;
    font-size: 14px;
    line-height: 1.4;
    text-align: left;
    font-family: Roboto, Arial, sans-serif;
    font-weight: 400;

    &__frame-holder {
      @include ratio(100%,16,9);
      @extend .sentimony-iframe;
      margin-bottom: 20px;
    }

    &__frame {
      border-radius: 6px;
      border: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 143%;
      height: 143%;
      transform: scale(.7);
      transform-origin: top left;
    }
  }
</style>
