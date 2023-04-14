<template>
  <div class="release-page">

    <div class="page-release">
      <SvgTriangle/>
      <div class="page-release__wrapper">

        <div class="page-release__media">

          <app-cover
            :cover_th="release.cover_th"
            :cover_xl="release.cover_xl"
            :cover="release.cover"
            :category="'releases'"
            :slug="release.slug"
            :title="release.title"
          />

          <p class="small-info">
            <span v-if="release.cat_no">{{ release.cat_no }}</span>
            <span v-if="release.coming_soon"> | Coming at {{ release.date | formatDate }}</span>
            <span v-else-if="release.date"> | {{ release.date | formatDate }}</span>
          </p>
          <h1 v-if="release.title" class="page-release__title">{{ release.title }}</h1>
          <p v-if="release.style" class="small-info">
            <span v-if="release.style">{{ release.style }}</span>
            <span v-if="release.total_time"> | {{ release.total_time }}</span>
          </p>

          <p v-if="release.coming_soon !== true" class="small-info">Downloat it:</p>
          <p v-else class="small-info">Downloat it soon:</p>
          <app-btn :url="release.links.bandcamp24_url" :route="routes.bandcamp_24" :title="titles.bandcamp_24" :icon="icons.bandcamp"/>
          <app-btn :url="release.links.bandcamp_url" :route="routes.bandcamp_16" :title="titles.bandcamp_16" :icon="icons.bandcamp"/>
          <app-btn :url="release.links.beatport" :route="routes.beatport" :title="titles.beatport" :icon="icons.beatport"/>
          <app-btn :url="release.links.junodownload" :route="routes.junodownload" :title="titles.junodownload" :icon="icons.junodownload"/>
          <!-- <app-btn :url="release.links.googleplay_market" :route="routes.googleplay_market" :title="titles.googleplay_market" :icon="icons.googleplay"/> -->
          <!-- <app-btn :url="release.links.itunes" :route="routes.itunes" :title="titles.itunes" :icon="icons.apple"/> -->

          <p v-if="release.coming_soon !== true" class="small-info">Stream it:</p>
          <p v-else class="small-info">Stream it soon:</p>
          <app-btn :url="release.links.spotify" :route="routes.spotify" :title="titles.spotify" :icon="icons.spotify"/>
          <app-btn :url="release.links.itunes" :route="routes.itunes" :title="titles.apple_music" :icon="icons.apple"/>
          <app-btn :url="release.links.youtube_music" :route="routes.youtube_music" :title="titles.youtube_music" :icon="icons.youtube_music"/>
          <!-- <app-btn :url="release.links.googleplay_music" :route="routes.googleplay_music" :title="titles.googleplay_music" :icon="icons.googleplay"/> -->
          <app-btn :url="release.links.deezer" :route="routes.deezer" :title="titles.deezer" :icon="icons.deezer"/>
          <app-btn :url="release.links.tidal" :route="routes.tidal" :title="titles.tidal" :icon="icons.tidal"/>
          <app-btn :url="release.links.napster" :route="routes.napster" :title="titles.napster" :icon="icons.napster"/>
          <app-btn :url="release.links.soundcloud_url" :route="routes.soundcloud" :title="titles.soundcloud" :icon="icons.soundcloud"/>
          <app-btn :url="release.links.youtube | YouTubeFullReleases" :route="routes.youtube" :title="titles.youtube_full" :icon="icons.youtube"/>
        </div>

        <div class="page-release__player-tabs">

          <!-- <app-tabs v-if="release.links.soundcloud_demo_id" style="margin-bottom:20px;">
            <app-tab
              :icon="icons.soundcloud"
              title="SoundCloud<br>(Preview)"
            >
              <div class="page-release__soundcloud-player">
                <iframe
                  width="100%"
                  height="166"
                  scrolling="no"
                  frameborder="no"
                  allow="autoplay"
                  :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + release.links.soundcloud_demo_id + '&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true'"
                ></iframe>
              </div>
            </app-tab>
          </app-tabs> -->

          <app-tabs>
            <app-tab
              :icon="icons.bandcamp"
              :title="titles.bandcamp"
            >
              <div class="page-release__bandcamp-player">
                <iframe
                  v-if="release.links.bandcamp_id"
                  :class="'page-release__bandcamp-player-iframe tracks-' + release.tracks_number"
                  :src="'https://bandcamp.com/EmbeddedPlayer/album=' + release.links.bandcamp_id + '/size=large/bgcol=ffffff/linkcol=0687f5/artwork=small/transparent=true/'"
                  seamless
                  :title="release.title + ' Bandcamp Iframe'"
                ></iframe>
                <div v-if="!release.links.bandcamp_id" class="page-release__player-coming">
                  Music<br>
                  is<br>
                  coming
                </div>
              </div>
            </app-tab>

            <app-tab
              v-if="release.links.soundcloud_playlist_id"
              :icon="icons.soundcloud"
              :title="titles.soundcloud"
            >
              <div class="page-release__soundcloud-player">
                <iframe
                  :class="'page-release__soundcloud-player-iframe tracks-' + release.tracks_number"
                  scrolling="no"
                  height="450"
                  allow="autoplay"
                  :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/' + release.links.soundcloud_playlist_id + '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=true&show_user=false&show_reposts=true&show_teaser=false'"
                  :title="release.title + ' SoundCloud Iframe'"
                ></iframe>
              </div>
            </app-tab>

            <app-tab
              v-if="release.links.youtube_playlist_id"
              :icon="icons.youtube"
              :title="titles.youtube_track"
            >
              <div class="page-release__youtube-player">
                <iframe
                  class="page-release__youtube-player-iframe"
                  :src="'https://www.youtube.com/embed/videoseries?loop=1&list=' + release.links.youtube_playlist_id"
                  :title="release.title + ' YouTube Iframe'"
                ></iframe>
              </div>
            </app-tab>
          </app-tabs>

        </div>

      </div>
    </div>

    <div class="content">
      <div class="content__wrapper">

        <!-- TODO: Delete this div, when info migrate to information -->
        <!-- <div v-if="release.info">
          <p
            v-for="(i, index) in release.info"
            :key="index"
            v-html="i.p"
          />
        </div> -->

        <div
          v-if="release.information"
          v-html="release.information"
        />

        <!-- TODO: Delete this div, when tracklist migrate to tracklistCompact -->
        <div v-if="!release.tracklistCompact">
          <div v-if="release.tracklist">
            <hr>
            <p>Tracklist:</p>
            <p
              v-for="(i, index) in release.tracklist.tracks"
              :key="index"
            >
              <span v-if="i.number">{{ i.number }} </span>
              <span v-if="i.artist">{{ i.artist }}</span>
              <span v-if="i.title"> - {{ i.title }}</span>
              <span v-if="i.bpm"> | {{ i.bpm }}bpm</span>
              <span v-if="i.note"> {{ i.note }}</span>

              <br v-if="i.credits">
              <span v-if="i.credits" class="sen-fs11 sen-ml18 sen-db">{{ i.credits }}</span>
            </p>
            <p v-if="release.tracklist.note" v-html="release.tracklist.note"></p>
          </div>
        </div>

        <div v-if="release.tracklistCompact">
          <hr>
          <p><small><b>Tracklist:</b></small></p>
          <p
            v-for="(i, index) in release.tracklistCompact"
            :key="index"
            v-html="i.p"
          ></p>
        </div>

        <!-- TODO: Delete this div, when tracklist migrate to creditsCompact -->
        <div v-if="!release.creditsCompact">
          <div v-if="release.credits.artwork_by || release.credits.written_and_produced_by || release.credits.mastered_by || release.credits.compiled_by">
            <hr>
            <p>Credits:</p>
            <p v-if="release.credits.written_and_produced_by" v-html="'Written & Produced By ' + release.credits.written_and_produced_by"></p>
            <p v-if="release.credits.tracks_by" v-html="release.credits.tracks_by"></p>
            <!-- <p v-if="release.credits.vocal_by" v-html="'Vocal By ' + release.credits.vocal_by"></p> -->
            <p v-if="release.credits.compiled_by" v-html="'Compiled By ' + release.credits.compiled_by"></p>
            <p v-if="release.credits.artwork_by" v-html="'Artwork By ' + release.credits.artwork_by"></p>
            <p v-if="release.credits.mastered_by" v-html="'Mastered By ' + release.credits.mastered_by"></p>
            <p v-if="release.credits.mixed_and_mastered_by" v-html="'Mixed & Mastered By ' + release.credits.mixed_and_mastered_by"></p>
            <p v-if="release.credits.mixed_by" v-html="'Mixed By ' + release.credits.mixed_by"></p>
          </div>
        </div>

        <div v-if="release.creditsCompact">
          <hr>
          <p><small><b>Credits:</b></small></p>
          <p
            v-for="(i, index) in release.creditsCompact"
            :key="index"
            v-html="i.p"
          ></p>
        </div>

        <div v-if="release.links.discogs || release.links.soundcloud_demo_url">
          <hr>
          <p><small><b>Links:</b></small></p>
        </div>

        <!-- <p v-if="release.links.junodownload">
          <a :href="release.links.junodownload" target="_blank" rel="noopener">JunoDownload</a>
        </p> -->

        <!-- <p v-if="release.links.soundcloud_demo_url">
          <a :href="release.links.soundcloud_demo_url" target="_blank" rel="noopener">SoundCloud (Preview)</a>
        </p> -->

        <p v-if="release.links.beatspace">
          <a :href="release.links.beatspace" target="_blank" rel="noopener">Beatspace</a>
        </p>

        <p v-if="release.links.psyshop">
          <a :href="release.links.psyshop" target="_blank" rel="noopener">Psyshop</a>
        </p>

        <p v-if="release.links.ektoplazm">
          <a :href="release.links.ektoplazm" target="_blank" rel="noopener">Ektoplazm</a>
        </p>

        <!-- <p v-if="release.links.youtube">
          <a :href="release.links.youtube | YouTubeFullReleases" target="_blank" rel="noopener">YouTube [Full Release]</a>
        </p> -->

        <p v-if="release.links.discogs">
          <a :href="release.links.discogs" target="_blank" rel="noopener">Discogs</a>
        </p>

        <div v-if="release.relative_releases">
          <hr>
          <p><small><b>Relative Releases:</b></small></p>

          <!-- <p>{{ release.relative_releases }}</p> -->

          <p
            v-for="(i, index) in releasesSortByDate"
            :key="index"
            v-if="i.visible && release.relative_releases.includes(i.slug)"
          >
            <span v-if="i.cover_xl">
              <img style="width:11px;height:auto;"
                :src="i.cover_xl"
                :alt="i.title"
              >
              |
            </span>
            <span v-if="!i.cover_xl && i.cover">
              <img style="width:11px;height:auto;"
                :src="'https://content.sentimony.com/assets/img/releases/micro/' + i.slug + '.jpg'"
                :srcset="'https://content.sentimony.com/assets/img/releases/micro/' + i.slug + '.jpg 1x, https://content.sentimony.com/assets/img/releases/micro-retina/' + i.slug + '.jpg 2x'"
                :alt="i.title"
              >
              |
            </span>
            {{ i.title }}
            |
            {{ i.date | year }}
            |
            <router-link v-ripple :to="'../../release/' + i.slug + '/'">Reed More</router-link>
          </p>
        </div>

        <hr>
        <VueDisqus
          shortname="sentimony"
          :identifier="release.slug"
          :url="'https://sentimony.com/release/' + release.slug"
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
    layout: 'release',
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
    //   const { data } = await axios.get(`releases/${key}.json`)
    //   return { release: data }
    // },
    async asyncData({ route }) {
      const { key } = route.params
      const [releaseRes, releasesRes] = await Promise.all([
        axios.get(`releases/${key}.json`),
        axios.get('releases.json')
      ]);
      const release = releaseRes.data
      const releases = releasesRes.data
      return { release, releases }
    },
    computed: {
      releasesSortByDate() {
        var releases = sortBy(this.releases, 'date').reverse()
        return releases
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
      YouTubeFullReleases (youtube) {
        let y = youtube.replace('https://youtu.be/', '');
        if (youtube) {
          return 'https://www.youtube.com/watch?v=' + y + '&list=PLp2GaPnw5O3Nhkwv3hkb1imrT6JNURnkU';
        } else {
          return y
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
        title: this.release.title,
        meta: [
          { name: 'description', content: this.release.format + ' with ' + this.release.tracks_number + ' tracks of ' + this.release.style + ' | ' + this.release.date.split('-')[0] },
          { property: 'og:image', content: this.release.cover_og ? this.release.cover_og : 'https://content.sentimony.com/assets/img/releases/og-images/' +  this.release.slug + '.jpg' }
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

  .page-release {
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

    &__bandcamp-player {
      @extend .sentimony-iframe;
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

    &__soundcloud-player {
      // @include ratio(100%,16,9);
      @extend .sentimony-iframe;
    }

    &__spotify-player-iframe {
      @extend .sentimony-iframe;
    }
  }
</style>
