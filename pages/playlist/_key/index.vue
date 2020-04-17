<template>
  <div class="playlist-page">

    <div class="page-playlist">
      <SvgTriangle/>
      <div class="page-playlist__wrapper">

        <div class="page-playlist__media">

          <app-cover
            :cover="playlist.cover"
            :category="'playlists'"
            :slug="playlist.slug"
            :title="playlist.title"
          />

          <div class="page-playlist__info">

            <h1 v-if="playlist.title" class="page-playlist__title">{{ playlist.title }}</h1>
            <div v-if="playlist.style" class="page-playlist__small-info">
              <!-- <span>{{ playlist.style }} | </span> -->
              <span v-if="playlist.total_time">{{ playlist.total_time }}</span>
            </div>

            <!-- <div class="page-playlist__small-info">Stream it:</div> -->

            <!-- <app-btn :url="playlist.links.spotify" :route="routes.spotify" :title="titles.spotify" :icon="icons.spotify"/>
            <app-btn :url="playlist.links.itunes" :route="routes.apple_music" :title="titles.apple_music" :icon="icons.apple_music"/>
            <app-btn :url="playlist.links.googleplay_music" :route="routes.googleplay_music" :title="titles.googleplay_music" :icon="icons.googleplay"/>
            <app-btn :url="playlist.links.youtube_music" :route="routes.youtube_music" :title="titles.youtube_music" :icon="icons.youtube_music"/>
            <app-btn :url="playlist.links.deezer" :route="routes.deezer" :title="titles.deezer" :icon="icons.deezer"/>
            <app-btn :url="playlist.links.tidal" :route="routes.tidal" :title="titles.tidal" :icon="icons.tidal"/>
            <app-btn :url="playlist.links.napster" :route="routes.napster" :title="titles.napster" :icon="icons.napster"/> -->

          </div>
        </div>

        <div class="page-playlist__player-tabs">

        </div>

      </div>
    </div>

    <div class="content">
      <div class="content__wrapper">

        <div v-if="playlist.info" v-html="playlist.info"/>

        <hr>
        <VueDisqus
          shortname="sentimony"
          :identifier="playlist.slug"
          :url="'https://sentimony.com/playlist/' + playlist.slug"
        />

      </div>
    </div>

  </div>
</template>

<script>
  import SvgTriangle from '~/components/SvgTriangle.vue'
  import AppCover from '~/components/AppCover'
  import AppBtn from '~/components/AppBtn'
  import axios from '~/plugins/axios'

  export default {
    // layout: 'playlist',
    components: {
      SvgTriangle,
      AppCover,
      AppBtn,
    },
    async asyncData({ route }) {
      const { key } = route.params
      const { data } = await axios.get(`playlists/${key}.json`)
      return { playlist: data }
    },
    filters: {
      formatDate: function (date) {
        var moment = require('moment');
        if (date) {
          return moment(String(date)).format('DD MMM YYYY');
        }
      },
      spotifyEmbed (spotify) {
        if (spotify) {
          let s = spotify.replace('https://open.spotify.com/album/', '');
          return 'https://open.spotify.com/embed?uri=spotify:album:' + s + '&theme=white';
        }
      }
    },
    methods: {
      onLoad ({ route }) {
        const { key } = route.params
        console.log(key)
      }
    },
    head () {
      return {
        title: this.playlist.title,
        meta: [
          { name: 'description', content: this.playlist.tracks_number + ' tracks ' + this.playlist.style + ' ' + this.playlist.format + ', ' + this.playlist.date.split('-')[0] },
          { property: 'og:image', content: 'https://content.sentimony.com/assets/img/playlists/og-images/' + this.playlist.cat_no + '/' + this.playlist.slug + '.jpg' }
        ]
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../node_modules/coriolan-ui/tools/variables';
  @import '../../../node_modules/coriolan-ui/mixins/media';
  @import '../../../assets/scss/content';
  @import '../../../assets/scss/page';

  .page-playlist {
    @extend .page;
    position: relative;

    &__wrapper {
      margin: 0 auto;
      max-width: 1278px;
      text-align: left;
      border-top: 1px solid rgba(#fff,.3);
      padding: 1.8em 0 1.8em;
      box-sizing: border-box;
      position: relative;
      z-index: 40;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-direction: column;

      @include media(L) {
        flex-direction: row;
        padding-top: 40px;
      }
    }

    &__media {
      margin-bottom: 1em;
      width: 100%;
      position: relative;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;

      @include media(L) {
        margin-top: 62px;
        margin-bottom: 10em;
        width: auto;
      }
    }

    &__info {
      display: block;
      width: 100%;
      box-sizing: border-box;

      @include media(L) {
        padding-right: 1.1em;
      }
    }

    &__small-info {
      font-size: 10px;
      color: rgba(#fff,.5);
      margin-bottom: .5em;

      @include media(S) {
        font-size: 14px;
      }
    }

    &__catalog-number {
      text-transform: uppercase;
    }

    &__title {
      font-size: 18px;
      line-height: 1.2;
      margin: 0 0 .1em;
      color: #fff;

      @include media(M) {
        font-size: 2em;
      }
    }

    &__player-tabs {
      width: 100%;
      max-width: 540px;
      margin: 0 auto;
    }
  }
</style>
