<template>
  <div class="youtube-page">
    <h1>YouTube Page</h1>
    <!-- <div class="youtube-page__frame-holder">
      <iframe
        class="youtube-page__frame"
        v-if="youtubeFrames.allTracks"
        :src="'https://www.youtube.com/embed/videoseries?loop=1&list=' + youtubeFrames.allTracks"
        title="YouTube playlist frame'"
      />
    </div> -->
    <!-- <div class="youtube-page__frame-holder">
      <iframe
        class="youtube-page__frame"
        v-if="youtubeFrames.needToWatch"
        :src="'https://www.youtube.com/embed/videoseries?loop=1&list=' + youtubeFrames.needToWatch"
        title="YouTube playlist frame'"
      />
    </div> -->
    <ol>
      <li v-for="(i, index) in sortByDate"
          :key="index"
      >
        <p>
          <span>[{{ i.cat_no }}]</span>
          <router-link v-ripple :to="'/release/' + i.slug + '/'" style="text-decoration: underline;">{{ i.title }}</router-link>
          <span>({{ i.date | formatDate }})</span>
          <br>
          v1
          <span v-for="(ii, index) in i.links" :key="index">
            <span v-if="ii.includes('.qobuz.')">
              <router-link v-ripple :to="'/release/' + i.slug + '/applemusic/'" style="text-decoration: underline;">
                Apple Music
            </router-link>
            </span>
            <span v-if="ii.includes('.qobuz.')">
              <router-link v-ripple :to="'/release/' + i.slug + '/amazonmusic/'" style="text-decoration: underline;">
                Amazon Music
            </router-link>
            </span>
            <span v-if="ii.includes('.qobuz.')">
              <router-link v-ripple :to="'/release/' + i.slug + '/qobuz/'" style="text-decoration: underline;">
                Qobuz
            </router-link>
            </span>

            <!-- {{ ii.includes('.qobuz.') }}, 
            {{ ii.qobuz }}, 
            <router-link v-if="ii.spotify" :to="'/release/' + i.slug + '/spotify/'" style="text-decoration: underline;">Spotify</router-link>
            <router-link v-if="ii.applemusic_url" :to="'/release/' + i.slug + '/applemusic/'" style="text-decoration: underline;">Apple Music</router-link> -->
          </span>
          <br>
          v2
          <span v-for="(iii, index) in i.links_v2" :key="index">
            <span v-if="iii.url.includes('.apple.')">
              <router-link v-ripple :to="'/release/' + i.slug + '/applemusic/'" style="text-decoration: underline;">
                Apple Music
            </router-link>
          </span>
          <span v-if="iii.url.includes('.amazon.')">
            <router-link v-ripple :to="'/release/' + i.slug + '/amazonmusic/'" style="text-decoration: underline;">
                Amazon Music
            </router-link>
          </span>
          <span v-if="iii.url.includes('.qobuz.')">
            <router-link v-ripple :to="'/release/' + i.slug + '/qobuz/'" style="text-decoration: underline;">
                Qobuz
            </router-link>
          </span>
          <!-- <router-link v-ripple :to="'/release/' + i.slug + '/' + iii.route + '/'" style="text-decoration: underline;">
              <span v-if="iii.route == 'applemusic'">Apple Music</span>
              <span v-if="iii.route == 'amazonmusic'">Amazon Music</span>
              <span v-if="iii.route == 'qobuz'">Qobuz</span>
            </router-link> |  -->
          </span>
        </p>
      </li>
    </ol>

    <!-- <table>
      <tr>
        <th>UPC</th>
        <th>Cat.No</th>
        <th>Title</th>
        <th>Date</th>
        <th>YouTube Full Release</th>
        <th>UPC</th>
        <th>JunoDownload</th>
      </tr>
      <tr
        v-for="(i, index) in sortByDate"
        :key="index"
      >
        <td>{{ i.upc }}</td>
        <td style="text-transform:uppercase;">{{ i.cat_no }}:</td>
        <td><router-link v-ripple :to="'/sitemap/' + i.slug + '/'">{{ i.title }}</router-link></td>
        <td>{{ i.date | formatDate }}</td>
        <td>{{ i.links.youtube }}</td>
        <td>{{ i.upc }}</td>
        <td><router-link :to="'/release/' + i.slug + '/'">official link >>></router-link></td>
      </tr>
    </table> -->

  </div>
</template>

<script>
  import axios from '~/plugins/axios'
  import sortBy from 'lodash/sortBy'

  export default {
    data: () => ({
      youtubeFrames: {
        allTracks: 'PLp2GaPnw5O3PWcqMkLjyj8lMroqjzVpDn',
        needToWatch: 'PLKQBsIU26jOcIbXUbaDuSAUjUWHs4iwOH'
      }
    }),
    async asyncData() {
      const { data } = await axios.get('releases.json')
      return { releases: data }
    },
    computed: {
      sortByDate () {
        return sortBy(this.releases, 'date')
        // return sortBy(this.releases, 'date').reverse()
      }
    },
    filters: {
      formatDate: function (date) {
        var moment = require('moment');
        if (date) {
          return moment(String(date)).format('YYYY');
          // return moment(String(date)).format('YYYY-MM-DD');
        }
      }
    },
    head: {
      title: 'YouTube Page',
      meta: [
        { name: 'description', content: '' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg' }
      ]
    }
  }
</script>

<style lang="scss">
  @import '../../node_modules/coriolan-ui/mixins/ratio';
  @import '../../assets/scss/iframe-size';

  .youtube-page {
    padding: 2em 0;
    max-width: 800px;
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

    table {
      width: 100%;
    }
  }
</style>
