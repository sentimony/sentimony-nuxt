<template>
  <div class="playlist-page">

    <div class="page-playlist">
      <SvgTriangle/>
      <div class="page-playlist__wrapper">

        <div class="page-playlist__media">
          <app-cover
            :cover_th="playlist.cover_th"
            :cover_xl="playlist.cover_xl"
            :category="'playlists'"
            :slug="playlist.slug"
            :title="playlist.title"
            v-ripple
          />

          <p v-if="playlist.style" class="small-info">
            <span>{{ playlist.style }}</span>
          </p>
          <h1 v-if="playlist.title" class="page-playlist__title">{{ playlist.title }}</h1>

          <p class="small-info">Stream it:</p>
          <app-btn redirect="false" v-if="playlist.links.spotify" :url="playlist.links.spotify" :route="routes.spotify" :title="titles.spotify" :icon="icons.spotify"/>
          <app-btn redirect="false" v-if="playlist.links.apple_music" :url="playlist.links.apple_music" :route="routes.applemusic" :title="titles.apple_music" :icon="icons.apple"/>
          <app-btn redirect="false" v-if="playlist.links.youtube_music" :url="playlist.links.youtube_music" :route="routes.youtube_music" :title="titles.youtube_music" :icon="icons.youtube_music"/>
          <!-- <app-btn redirect="false" v-if="playlist.links.googleplay_music" :url="playlist.links.googleplay_music" :route="routes.googleplaymusic" :title="titles.googleplay_music" :icon="icons.googleplay"/> -->
          <app-btn redirect="false" v-if="playlist.links.youtube" :url="playlist.links.youtube" :route="routes.youtube" :title="titles.youtube_playlist" :icon="icons.youtube"/>
          <!-- <app-btn redirect="false" v-if="playlist.links.deezer" :url="playlist.links.deezer" :route="routes.deezer" :title="titles.deezer" :icon="icons.deezer"/> -->
          <!-- <app-btn redirect="false" v-if="playlist.links.tidal" :url="playlist.links.tidal" :route="routes.tidal" :title="titles.tidal" :icon="icons.tidal"/> -->
          <!-- <app-btn redirect="false" v-if="playlist.links.napster" :url="playlist.links.napster" :route="routes.napster" :title="titles.napster" :icon="icons.napster"/> -->
          <app-btn redirect="false" v-if="playlist.links.soundcloud_url" :url="playlist.links.soundcloud_url" :route="routes.soundcloud" :title="titles.soundcloud" :icon="icons.soundcloud"/>
        </div>

        <div class="page-playlist__player-tabs">

          <IframeTabs
            v-if="playlist.links.youtube || playlist.links.soundcloud_playlist_id"
            :one="[
              playlist.links.youtube,
              playlist.links.soundcloud_playlist_id
            ]"
          />

          <!-- <br>

          <app-tabs>

            <app-tab 
              v-if="playlist.links.soundcloud_playlist_id"
              title="SoundCloud"
              :icon="icons.soundcloud"
            >
              <div class="page-playlist__soundcloud-player">
                <iframe
                  class="page-playlist__soundcloud-player-iframe"
                  scrolling="no"
                  height="450"
                  allow="autoplay"
                  :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/' + playlist.links.soundcloud_playlist_id + '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=true&show_user=false&show_reposts=true&show_teaser=false'"
                  :title="playlist.title + ' SoundCloud Iframe'"
                ></iframe>
              </div>
            </app-tab>
            
            <app-tab
              v-if="playlist.links.youtube"
              :icon="icons.youtube"
              title="YouTube"
            >
              <div class="page-playlist__youtube-player">
                <iframe 
                  class="page-playlist__youtube-player-iframe"
                  :src="playlist.links.youtube | YouTubeEmbed"
                  :title="playlist.title + 'YouTube video player'"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                ></iframe>
              </div>
            </app-tab>
          </app-tabs> -->

        </div>

      </div>
    </div>

    <div class="content">
      <div class="content__wrapper">

        <div v-if="playlist.info" v-html="playlist.info"/>

        <hr>

        <p>Releases:</p>
        <p
          v-for="(i, index) in releasesSortByDate"
          :key="index"
          v-if="i.visible && i.at_playlists.includes(playlist.slug) && !i.coming_soon"
        >

          <AppRelativeItem
            :i="i"
            category="release"
          />

        </p>

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
  import sortBy from 'lodash/sortBy'
  import moment from 'moment'

  import axios from '~/plugins/axios'
  import AppContent from '~/plugins/app-content'

  // import SwiperTop from '~/components/SwiperTop.vue'
  import IframeTabs from '~/components/IframeTabs.vue'
  import SvgTriangle from '~/components/SvgTriangle.vue'
  import AppCover from '~/components/AppCover'
  import AppBtn from '~/components/AppBtn'
  import AppTabs from '~/components/AppTabs.vue'
  import AppTab from '~/components/AppTab.vue'
  import AppRelativeItem from '~/components/AppRelativeItem.vue'

  export default {
    layout: 'playlist',
    components: {
      // SwiperTop,
      IframeTabs,
      SvgTriangle,
      AppCover,
      AppBtn,
      AppTabs,
      AppTab,
      AppRelativeItem,
    },
    data () {
      return {
        routes: AppContent.routes,
        titles: AppContent.titles,
        icons: AppContent.icons,
      }
    },
    async asyncData({ route }) {
      const { key } = route.params
      const [playlistRes, releasesRes] = await Promise.all([
        axios.get(`playlists/${key}.json`),
        axios.get('releases.json')
      ]);
      const playlist = playlistRes.data
      const releases = releasesRes.data
      return { playlist, releases }
    },
    computed: {
      releasesSortByDate() {
        var releases = sortBy(this.releases, 'date').reverse()
        return releases
      }
    },
    filters: {
      YouTubeEmbed (youtube) {
        if (youtube) {
          let y = youtube.replace('https://www.youtube.com/playlist?list=', '');
          return 'https://www.youtube-nocookie.com/embed/videoseries?list=' + y + '&loop=1';
        }
      },
      year: function (date) {
        if (date) {
          return moment(String(date)).format('YYYY');
        }
      }
    },
    head () {
      return {
        title: this.playlist.title,
        meta: [
          { name: 'description', content: this.playlist.style + ', ' + this.playlist.date.split('-')[0] },
          { property: 'og:image', content: 'https://content.sentimony.com/assets/img/playlists/og-images/' + this.playlist.slug + '.jpg' }
        ]
      }
    }
  }
</script>

<style lang="scss">
  @import '../../../node_modules/coriolan-ui/tools/variables';
  @import '../../../node_modules/coriolan-ui/mixins/media';
  @import '../../../node_modules/coriolan-ui/mixins/ratio';
  @import '../../../assets/scss/vue-tabs-restyle';
  @import '../../../assets/scss/content';
  @import '../../../assets/scss/page';
  @import '../../../assets/scss/iframe-size';
  @import '../../../assets/scss/v-img-restyle';

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

      @include media(L) {
        margin-top: 62px;
        margin-bottom: 10em;
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
