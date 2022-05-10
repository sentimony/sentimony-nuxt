<template>
  <div class="video-page">

    <div class="page-video">
      <SvgTriangle/>
      <div class="page-video__wrapper">

        <div class="page-video__media">

          <app-cover
            :cover_th="video.cover_th"
            :cover_xl="video.cover_xl"
            :category="'videos'"
            :slug="video.slug"
            :title="video.title"
          />

          <p class="small-info">
            <span v-if="video.coming_soon">Coming at {{ video.date | formatDate }}</span>
            <span v-else-if="video.date">{{ video.date | formatDate }}</span>
          </p>
          <h1 v-if="video.title" class="page-video__title">{{ video.title }}</h1>

        </div>

        <div class="page-video__player-tabs">

          <app-tabs>
            <app-tab
              v-if="video.links.youtube"
              :icon="icons.youtube"
              title="YouTube"
            >
              <div class="page-video__youtube-player">
                <iframe
                  class="page-video__youtube-player-iframe"
                  :src="video.links.youtube | YouTubeVideoID"
                  :title="video.title + ' YouTube Iframe'"
                ></iframe>
              </div>
            </app-tab>
          </app-tabs>

        </div>

      </div>
    </div>

    <div class="content">
      <div class="content__wrapper">

        <div
          v-if="video.information"
          v-html="video.information"
        />

        <div v-if="video.credits">
          <hr>
          <p>Credits:</p>
          <div v-html="video.credits"/>
        </div>

        <hr>
        <VueDisqus
          shortname="sentimony"
          :identifier="video.slug"
          :url="'https://sentimony.com/video/' + video.slug"
        />

      </div>
    </div>

  </div>
</template>

<script>
  import sortBy from 'lodash/sortBy'
  import moment from 'moment'

  import axios from '~/plugins/axios'
  import AppContent from '~/plugins/app-content'

  import SvgTriangle from '~/components/SvgTriangle'
  import AppCover from '~/components/AppCover'
  import AppBtn from '~/components/AppBtn'
  import AppTabs from '~/components/AppTabs.vue'
  import AppTab from '~/components/AppTab.vue'

  export default {
    layout: 'video',
    components: {
      SvgTriangle,
      AppCover,
      AppBtn,
      AppTabs,
      AppTab,
    },
    data () {
      return {
        routes: AppContent.routes,
        titles: AppContent.titles,
        icons: AppContent.icons,
      }
    },
    // async asyncData({ route }) {
    //   const { key } = route.params
    //   const { data } = await axios.get(`videos/${key}.json`)
    //   return { video: data }
    // },
    async asyncData({ route }) {
      const { key } = route.params
      const [videoRes, videosRes] = await Promise.all([
        axios.get(`videos/${key}.json`),
        axios.get('videos.json')
      ]);
      const video = videoRes.data
      const videos = videosRes.data
      return { video, videos }
    },
    computed: {
      videosSortByDate() {
        var videos = sortBy(this.videos, 'date').reverse()
        return videos
      }
    },
    filters: {
      formatDate: function (date) {
        var moment = require('moment');
        if (date) {
          return moment(String(date)).format('DD MMM YYYY');
        }
      },
      year: function (date) {
        if (date) {
          return moment(String(date)).format('YYYY');
        }
      },
      // SpotifyEmbed (spotify) {
      //   if (spotify) {
      //     let s = spotify.replace('https://open.spotify.com/album/', '');
      //     return 'https://open.spotify.com/embed?uri=spotify:album:' + s + '&theme=white';
      //   }
      // },
      // YouTubeFullReleases (youtube) {
      //   if (youtube) {
      //     let y = youtube.replace('https://youtu.be/', '');
      //     return 'https://www.youtube.com/watch?v=' + y + '&list=PLp2GaPnw5O3Nhkwv3hkb1imrT6JNURnkU';
      //   }
      // },
      YouTubeVideoID (youtube) {
        if (youtube) {
          let y = youtube.replace('https://youtu.be/', '');
          return 'https://www.youtube.com/embed/' + y;
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
        title: this.video.title,
        meta: [
          { name: 'description', content: '' },
          { property: 'og:image', content: '' }
        ]
      }
    }
  }
</script>

<style lang="scss">
  @import '../../node_modules/coriolan-ui/tools/variables';
  @import '../../node_modules/coriolan-ui/mixins/media';
  @import '../../node_modules/coriolan-ui/mixins/ratio';
  @import '../../assets/scss/vue-tabs-restyle';
  @import '../../assets/scss/content';
  @import '../../assets/scss/page';
  @import '../../assets/scss/iframe-size';
  @import '../../assets/scss/v-img-restyle';

  .page-video {
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
      // display: flex;
      // align-items: flex-start;
      // justify-content: space-between;

      @include media(L) {
        margin-top: 62px;
        margin-bottom: 10em;
        // width: auto;
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
        font-size: 30px;
      }
    }

    &__player-tabs {
      width: 100%;
      max-width: 540px;
      margin: 0 auto;
    }

    &__player {
      &-coming {
        padding: 1em 1.2em;
        font-size: 14px;
        color: rgba(#fff,.5);
      }

      &-iframe {
        margin: 0 auto;
        max-width: 540px;
      }
    }

    &__youtube-player {
      @include ratio(100%,16,9);
      @extend .sentimony-iframe;

      &-iframe {
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
  }
</style>
