<template>
  <div class="youtube-page">
    <h1>Sitemap</h1>
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

    <div>Releases</div>
    <ol class="sitemap-link-list">
      <li v-for="(i, index) in releasesSortByDate"
          :key="index"
      >
        <!-- <p :style="{ 'background-image': 'url(' + i.cover_og + '); background-size: cover;' }">{{ i.title }}</p> -->
        <p>
          <img v-if="i.cover_th" :src="i.cover_th" :alt="i.title">
          <!-- <span>[{{ i.cat_no }}]</span> -->
          <router-link v-ripple :to="'/release/' + i.slug + '/'" style="text-decoration: underline;">{{ i.title }}</router-link>
          <router-link v-ripple :to="'/sitemap/' + i.slug + '/'">sitemap >>></router-link>
          <!-- <span>({{ i.date | formatDate }})</span> -->
          <br>
          
          v1
          <span v-for="(ii, index) in i.links" :key="index">
            <span v-if="ii.includes('.diggersfactory.')"><router-link v-ripple :to="'/release/' + i.slug + '/diggersfactory/'">DiggersFactory</router-link></span>
            <span v-if="ii.includes('.bandcamp.')"><router-link v-ripple :to="'/release/' + i.slug + '/bandcamp/'">Bandcamp16</router-link></span>
            <span v-if="ii.includes('.bandcamp.')"><router-link v-ripple :to="'/release/' + i.slug + '/bandcamp24/'">Bandcamp24</router-link></span>
            <span v-if="ii.includes('.beatport.')"><router-link v-ripple :to="'/release/' + i.slug + '/beatport/'">Beatport</router-link></span>
            <span v-if="ii.includes('.junodownload.')"><router-link v-ripple :to="'/release/' + i.slug + '/junodownload/'">JunoDownload</router-link></span>
            <span v-if="ii.includes('.spotify.')"><router-link v-ripple :to="'/release/' + i.slug + '/spotify/'">Spotify</router-link></span>
            <span v-if="ii.includes('.apple.')"><router-link v-ripple :to="'/release/' + i.slug + '/applemusic/'">AppleMusic</router-link></span>
            <span v-if="ii.includes('.amazon.')"><router-link v-ripple :to="'/release/' + i.slug + '/amazonmusic/'">AmazonMusic</router-link></span>
            <span v-if="ii.includes('.deezer.')"><router-link v-ripple :to="'/release/' + i.slug + '/deezer/'">Deezer</router-link></span>
            <span v-if="ii.includes('.tidal.')"><router-link v-ripple :to="'/release/' + i.slug + '/tidal/'">Tidal</router-link></span>
            <span v-if="ii.includes('.qobuz.')"><router-link v-ripple :to="'/release/' + i.slug + '/qobuz/'">Qobuz</router-link></span>
            <span v-if="ii.includes('.napster.')"><router-link v-ripple :to="'/release/' + i.slug + '/napster/'">Napster</router-link></span>
            <span v-if="ii.includes('soundcloud.')"><router-link v-ripple :to="'/release/' + i.slug + '/soundcloud/'">SoundCloud</router-link></span>
            <span v-if="ii.includes('music.youtube.')"><router-link v-ripple :to="'/release/' + i.slug + '/youtubemusic/'">YouTubeMusic</router-link></span>
            <span v-if="ii.includes('youtu.be')"><router-link v-ripple :to="'/release/' + i.slug + '/youtube/'">YouTube</router-link></span>

            <span v-if="ii.includes('sentimony.')"><router-link v-ripple :to="'/release/' + i.slug + '/official/'">Official</router-link></span>
            <span v-if="ii.includes('.apple.')"><router-link v-ripple :to="'/release/' + i.slug + '/itunes/'">Itunes</router-link></span>
            <span v-if="ii.includes('play.google.com/music')"><router-link v-ripple :to="'/release/' + i.slug + '/googleplay/'">GooglePlayMusic</router-link></span>
          </span>
          <br>

          v2
          <span v-for="(iii, index) in i.links_v2" :key="index">
            <span v-if="iii.url.includes('.diggersfactory.')"><router-link v-ripple :to="'/release/' + i.slug + '/diggersfactory/'">DiggersFactory</router-link></span>
            <span v-if="iii.url.includes('.bandcamp.')"><router-link v-ripple :to="'/release/' + i.slug + '/bandcamp/'">Bandcamp16</router-link></span>
            <span v-if="iii.url.includes('-24bit')"><router-link v-ripple :to="'/release/' + i.slug + '/bandcamp24/'">Bandcamp24</router-link></span>
            <span v-if="iii.url.includes('.beatport.')"><router-link v-ripple :to="'/release/' + i.slug + '/beatport/'">Beatport</router-link></span>
            <span v-if="iii.url.includes('.junodownload.')"><router-link v-ripple :to="'/release/' + i.slug + '/junodownload/'">JunoDownload</router-link></span>
            <span v-if="iii.url.includes('.spotify.')"><router-link v-ripple :to="'/release/' + i.slug + '/spotify/'">Spotify</router-link></span>
            <span v-if="iii.url.includes('.apple.')"><router-link v-ripple :to="'/release/' + i.slug + '/applemusic/'">AppleMusic</router-link></span>
            <span v-if="iii.url.includes('.amazon.')"><router-link v-ripple :to="'/release/' + i.slug + '/amazonmusic/'">AmazonMusic</router-link></span>
            <span v-if="iii.url.includes('.deezer.')"><router-link v-ripple :to="'/release/' + i.slug + '/deezer/'">Deezer</router-link></span>
            <span v-if="iii.url.includes('.tidal.')"><router-link v-ripple :to="'/release/' + i.slug + '/tidal/'">Tidal</router-link></span>
            <span v-if="iii.url.includes('.qobuz.')"><router-link v-ripple :to="'/release/' + i.slug + '/qobuz/'">Qobuz</router-link></span>
            <span v-if="iii.url.includes('.napster.')"><router-link v-ripple :to="'/release/' + i.slug + '/napster/'">Napster</router-link></span>
            <span v-if="iii.url.includes('soundcloud.')"><router-link v-ripple :to="'/release/' + i.slug + '/soundcloud/'">SoundCloud</router-link></span>
            <span v-if="iii.url.includes('music.youtube.')"><router-link v-ripple :to="'/release/' + i.slug + '/youtubemusic/'">YouTubeMusic</router-link></span>
            <span v-if="iii.url.includes('youtu.be')"><router-link v-ripple :to="'/release/' + i.slug + '/youtube/'">YouTube</router-link></span>
          </span>
        </p>
      </li>
    </ol>

    <div>Artists</div>

    <ol class="sitemap-link-list">
      <li v-for="(i, index) in artistsSortByCategoryId"
          :key="index"
      >
        <p>
          <img v-if="i.photo_th" :src="i.photo_th" :alt="i.title">
          <router-link v-ripple :to="'/artist/' + i.slug + '/'">{{ i.title }}</router-link>
          <br>
          <span>({{ i.location }})</span>
        </p>
      </li>
    </ol>

    <div>Playlists</div>

    <ol class="sitemap-link-list">
      <li v-for="(i, index) in playlistsSortByDate"
          :key="index"
      >
        <p>
          <img v-if="i.cover_th" :src="i.cover_th" :alt="i.title">
          <router-link v-ripple :to="'/playlist/' + i.slug + '/'">{{ i.title }}</router-link>
          <br>
          
          v1
          <span v-for="(ii, index) in i.links" :key="index">
            <span v-if="ii.includes('.spotify.')"><router-link v-ripple :to="'/playlist/' + i.slug + '/spotify/'">Spotify</router-link></span>
            <span v-if="ii.includes('.apple.')"><router-link v-ripple :to="'/playlist/' + i.slug + '/applemusic/'">AppleMusic</router-link></span>
            <!-- <span v-if="ii.includes('.amazon.')"><router-link v-ripple :to="'/playlist/' + i.slug + '/amazonmusic/'">AmazonMusic</router-link></span> -->
            <span v-if="ii.includes('.deezer.')"><router-link v-ripple :to="'/playlist/' + i.slug + '/deezer/'">Deezer</router-link></span>
            <span v-if="ii.includes('.tidal.')"><router-link v-ripple :to="'/playlist/' + i.slug + '/tidal/'">Tidal</router-link></span>
            <span v-if="ii.includes('.qobuz.')"><router-link v-ripple :to="'/playlist/' + i.slug + '/qobuz/'">Qobuz</router-link></span>
            <span v-if="ii.includes('.napster.')"><router-link v-ripple :to="'/playlist/' + i.slug + '/napster/'">Napster</router-link></span>
            <span v-if="ii.includes('soundcloud.')"><router-link v-ripple :to="'/playlist/' + i.slug + '/soundcloud/'">SoundCloud</router-link></span>
            <span v-if="ii.includes('music.youtube.')"><router-link v-ripple :to="'/playlist/' + i.slug + '/youtubemusic/'">YouTubeMusic</router-link></span>
            <!-- <span v-if="ii.includes('youtu.be')"><router-link v-ripple :to="'/playlist/' + i.slug + '/youtube/'">YouTube</router-link></span> -->
          </span>
        </p>
      </li>
    </ol>

    <div>Videos</div>

    <ol class="sitemap-link-list">
      <li v-for="(i, index) in videosSortByDate"
          :key="index"
      >
        <p>
          <router-link v-ripple :to="'/video/' + i.slug + '/'">{{ i.title }}</router-link>
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
        v-for="(i, index) in releasesSortByDate"
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
    async asyncData({ route }) {
      const [artistsRes, releasesRes, playlistsRes, videosRes] = await Promise.all([
        axios.get(`artists.json`),
        axios.get('releases.json'),
        axios.get('playlists.json'),
        axios.get('videos.json'),
      ]);
      const artists = artistsRes.data
      const releases = releasesRes.data
      const playlists = playlistsRes.data
      const videos = videosRes.data
      return { artists, releases, playlists, videos }
    },
    computed: {
      releasesSortByDate () {
        return sortBy(this.releases, 'date').reverse()
      },
      artistsSortByCategoryId () {
        return sortBy(this.artists, 'category_id')
      },
      playlistsSortByDate () {
        return sortBy(this.playlists, 'date')
      },
      videosSortByDate () {
        return sortBy(this.videos, 'date')
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
      title: 'Sitemap',
      meta: [
        { name: 'description', content: '' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg' }
      ]
    }
  }
</script>

<style lang="scss">
  @import '../../node_modules/coriolan-ui/mixins/clearfix';
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

  .sitemap-link-list a {
    text-decoration: underline;
  }

  .sitemap-link-list p {
    @include clearfix;
  }

  .sitemap-link-list img {
    width: auto;
    height: 56px;
    // display: block;
    float: left;
    margin-right: 10px;
    // margin-bottom: 10px;
  }
</style>
