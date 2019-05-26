<template>
  <div class="playlist-page">

    <div class="page-playlist">
      <SvgTriangle/>
      <div class="page-playlist__wrapper">

      </div>
    </div>

    <div class="content">
      <div class="content__wrapper">

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
  import axios from '~/plugins/axios'

  export default {
    layout: 'release',
    components: {
      SvgTriangle
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
  }
</style>
