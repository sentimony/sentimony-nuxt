<template>
  <div class="release-page">
    <div class="page-release">
      <SvgTriangle />
      <div class="page-release__wrapper">
        <div class="page-release__media">
          <AppCover
            :cover_th="release.cover_th"
            :cover_xl="release.cover_xl"
            category="releases"
            :title="release.title"
            v-ripple
          />

          <p class="small-info">
            <span v-if="release.cat_no">{{ release.cat_no }}</span>
            <span v-if="release.coming_soon">
              | Coming at {{ release.date | formatDate }}</span
            >
            <span v-else-if="release.date">
              | {{ release.date | formatDate }}</span
            >
          </p>
          <h1 v-if="release.title" class="page-release__title">
            {{ release.title }}
          </h1>
          <p v-if="release.style" class="small-info">
            <span v-if="release.style">{{ release.style }}</span>
            <span v-if="release.total_time"> | {{ release.total_time }}</span>
          </p>

          <p v-if="release.links.diggersfactory_url" class="">
            <br />Purchase VINYL
          </p>
          <!-- <p v-else class="small-info">Download it soon</p> -->
          <AppBtn
            redirect="false"
            v-if="release.links.diggersfactory_url"
            :url="release.links.diggersfactory_url"
            :route="routes.diggersfactory"
            :title="titles.diggersfactory"
            :icon="icons.diggersfactory"
          />

          <p v-if="release.coming_soon !== true" class="small-info">
            <br />Download it
          </p>
          <!-- <p v-else class="small-info"><br>Download it soon</p> -->
          <AppBtn
            redirect="false"
            v-if="
              release.links.bandcamp24_url &&
                release.links.bandcamp24_url !== 'redirect_to_16'
            "
            :url="release.links.bandcamp24_url"
            :route="routes.bandcamp_24"
            :title="titles.bandcamp_24"
            :icon="icons.bandcamp"
          />
          <AppBtn
            redirect="false"
            v-if="
              release.links.bandcamp_url &&
                release.links.bandcamp_url !== 'redirect_to_24'
            "
            :url="release.links.bandcamp_url"
            :route="routes.bandcamp_16"
            :title="titles.bandcamp_16"
            :icon="icons.bandcamp"
          />
          <AppBtn
            redirect="false"
            v-if="release.links.beatport"
            :url="release.links.beatport"
            :route="routes.beatport"
            :title="titles.beatport"
            :icon="icons.beatport"
          />
          <AppBtn
            redirect="false"
            v-if="release.links.junodownload"
            :url="release.links.junodownload"
            :route="routes.junodownload"
            :title="titles.junodownload"
            :icon="icons.junodownload"
          />

          <p v-if="release.coming_soon !== true" class="small-info">
            <br />Stream it
          </p>
          <!-- <p v-else class="small-info"><br>Stream it soon</p> -->
          <AppBtn
            redirect="false"
            v-if="release.links.spotify"
            :url="release.links.spotify"
            :route="routes.spotify"
            :title="titles.spotify"
            :icon="icons.spotify"
          />

          <AppBtn
            redirect="false"
            v-if="release.links.applemusic_url"
            :url="release.links.applemusic_url"
            :route="routes.applemusic"
            :title="titles.apple_music"
            :icon="icons.apple_2"
          />
          <!-- <AppBtn redirect="false" v-if="release.links.itunes" :url="release.links.itunes" :route="routes.itunes" :title="titles.itunes" :icon="icons.apple"/> -->

          <AppBtn
            redirect="false"
            v-if="release.links.youtube_music"
            :url="release.links.youtube_music"
            :route="routes.youtube_music"
            :title="titles.youtube_music"
            :icon="icons.youtube_music_2"
          />
          <AppBtn
            redirect="false"
            v-if="release.links.deezer"
            :url="release.links.deezer"
            :route="routes.deezer"
            :title="titles.deezer"
            :icon="icons.deezer"
          />
          <AppBtn
            redirect="false"
            v-if="release.links.amazon_music"
            :url="release.links.amazon_music"
            :route="routes.amazon_music"
            :title="titles.amazon_music"
            :icon="icons.amazon_music"
          />
          <AppBtn
            redirect="false"
            v-if="release.links.qobuz"
            :url="release.links.qobuz"
            :route="routes.qobuz"
            :title="titles.qobuz"
            :icon="icons.qobuz"
          />
          <AppBtn
            redirect="false"
            v-if="release.links.tidal"
            :url="release.links.tidal"
            :route="routes.tidal"
            :title="titles.tidal"
            :icon="icons.tidal"
          />
          <AppBtn
            redirect="false"
            v-if="release.links.napster"
            :url="release.links.napster"
            :route="routes.napster"
            :title="titles.napster"
            :icon="icons.napster"
          />
          <AppBtn
            redirect="false"
            v-if="release.links.soundcloud_url"
            :url="release.links.soundcloud_url"
            :route="routes.soundcloud"
            :title="titles.soundcloud"
            :icon="icons.soundcloud"
          />
          <AppBtn
            redirect="false"
            v-if="release.links.youtube"
            :url="release.links.youtube | YouTubeFullReleases"
            :route="routes.youtube"
            :title="titles.youtube_full_release"
            :icon="icons.youtube"
          />
          <AppBtn
            redirect="false"
            v-if="release.links.youtube_playlist_id"
            :url="release.links.youtube_playlist_id | YouTubeIndividualTracks"
            :route="titles.youtube_playlist"
            :title="titles.youtube_playlist"
            :icon="icons.youtube"
          />

          <!-- <span class="app-btn" v-if="release.links.youtube_playlist_id">
            <a class="app-btn__btn" :href="release.links.youtube_playlist_id | YouTubeIndividualTracks" target="_blank" rel="noopener">
              <img
                class="app-btn__btn-img"
                :src="icons.youtube"
                :alt="titles.youtube_playlist + ' Icon'"
              >
              <span class="app-btn__btn-text" v-html="titles.youtube_playlist"></span>
            </a>
          </span> -->
        </div>

        <div class="page-release__player-tabs">
          <!-- <AppTabs v-if="release.links.soundcloud_demo_id" style="margin-bottom:20px;">
            <AppTab
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
            </AppTab>
          </AppTabs> -->

          <AppTabs>
            <AppTab :icon="icons.bandcamp" :title="titles.bandcamp">
              <div class="page-release__bandcamp-player">
                <iframe
                  v-if="release.links.bandcamp_id"
                  :class="
                    'page-release__bandcamp-player-iframe tracks-' +
                      release.tracks_number
                  "
                  :src="
                    'https://bandcamp.com/EmbeddedPlayer/album=' +
                      release.links.bandcamp_id +
                      '/size=large/bgcol=ffffff/linkcol=0687f5/artwork=small/transparent=true/'
                  "
                  seamless
                  :title="release.title + ' Bandcamp Iframe'"
                ></iframe>
                <div
                  v-if="!release.links.bandcamp_id"
                  class="page-release__player-coming"
                  v-html="texts.comingMusic"
                />
              </div>
            </AppTab>

            <AppTab
              v-if="release.links.youtube_playlist_id"
              :icon="icons.youtube"
              :title="titles.youtube_playlist"
            >
              <div class="page-release__youtube-player">
                <iframe
                  class="page-release__youtube-player-iframe"
                  :src="
                    'https://www.youtube-nocookie.com/embed/videoseries?list=' +
                      release.links.youtube_playlist_id +
                      '&loop=1'
                  "
                  :title="release.title + 'YouTube video player'"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerpolicy="strict-origin-when-cross-origin"
                  allowfullscreen
                ></iframe>
              </div>
            </AppTab>

            <AppTab
              v-if="release.links.soundcloud_playlist_id"
              :icon="icons.soundcloud"
              :title="titles.soundcloud"
            >
              <div class="page-release__soundcloud-player">
                <iframe
                  :class="
                    'page-release__soundcloud-player-iframe tracks-' +
                      release.tracks_number
                  "
                  scrolling="no"
                  height="450"
                  allow="autoplay"
                  :src="
                    'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/' +
                      release.links.soundcloud_playlist_id +
                      '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=true&show_user=false&show_reposts=true&show_teaser=false'
                  "
                  :title="release.title + ' SoundCloud Iframe'"
                ></iframe>
              </div>
            </AppTab>
          </AppTabs>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="content__wrapper">
        <div v-if="release.information" v-html="release.information" />

        <div v-if="release.tracklistCompact">
          <hr />
          <p>
            <small><b>Tracklist:</b></small>
          </p>
          <p
            v-for="(i, index) in release.tracklistCompact"
            :key="index"
            v-html="i.p"
          ></p>
        </div>

        <div v-if="release.creditsCompact">
          <hr />
          <p>
            <small><b>Credits:</b></small>
          </p>
          <p
            v-for="(i, index) in release.creditsCompact"
            :key="index"
            v-html="i.p"
          ></p>
        </div>

        <div v-if="release.links.discogs || release.links.soundcloud_demo_url">
          <hr />
          <p>
            <small><b>Links:</b></small>
          </p>
        </div>

        <!-- <p v-if="release.links.junodownload">
          <a :href="release.links.junodownload" target="_blank" rel="noopener">JunoDownload</a>
        </p> -->

        <!-- <p v-if="release.links.soundcloud_demo_url">
          <a :href="release.links.soundcloud_demo_url" target="_blank" rel="noopener">SoundCloud (Preview)</a>
        </p> -->

        <p v-if="release.links.beatspace">
          <a :href="release.links.beatspace" target="_blank" rel="noopener"
            >Beatspace</a
          >
        </p>

        <p v-if="release.links.psyshop">
          <a :href="release.links.psyshop" target="_blank" rel="noopener"
            >Psyshop</a
          >
        </p>

        <p v-if="release.links.ektoplazm">
          <a :href="release.links.ektoplazm" target="_blank" rel="noopener"
            >Ektoplazm</a
          >
        </p>

        <!-- <p v-if="release.links.youtube">
          <a :href="release.links.youtube | YouTubeFullReleases" target="_blank" rel="noopener">YouTube [Full Release]</a>
        </p> -->

        <p v-if="release.links.discogs">
          <a :href="release.links.discogs" target="_blank" rel="noopener"
            >Discogs</a
          >
        </p>

        <div v-if="release.relative_releases">
          <hr />

          <p>
            <small><b>Relative Releases:</b></small>
          </p>
          <p
            v-for="(i, index) in releasesSortByDate"
            :key="index"
            v-if="i.visible && release.relative_releases.includes(i.slug)"
          >
            <AppRelativeItem :i="i" category="release" />
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
  import sortBy from 'lodash/sortBy'
  import moment from 'moment'

  import axios from '@/plugins/axios'
  import AppContent from '@/plugins/AppContent'

  import SvgTriangle from '@/components/SvgTriangle'
  import AppCover from '@/components/AppCover'
  import AppBtn from '@/components/AppBtn'
  import AppTabs from '@/components/AppTabs.vue'
  import AppTab from '@/components/AppTab.vue'
  import AppRelativeItem from '@/components/AppRelativeItem.vue'

  export default {
    layout: 'default',
    components: {
      SvgTriangle,
      AppCover,
      AppBtn,
      AppTabs,
      AppTab,
      AppRelativeItem
    },
    data() {
      return {
        routes: AppContent.routes,
        titles: AppContent.titles,
        icons: AppContent.icons,
        texts: AppContent.texts
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
      ])
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
      formatDate: function(date) {
        var moment = require('moment')
        if (date) {
          return moment(String(date)).format('DD MMM YYYY')
        }
      },
      year: function(date) {
        if (date) {
          return moment(String(date)).format('YYYY')
        }
      },
      // SpotifyEmbed (spotify) {
      //   if (spotify) {
      //     let s = spotify.replace('https://open.spotify.com/album/', '');
      //     return 'https://open.spotify.com/embed?uri=spotify:album:' + s + '&theme=white';
      //   }
      // },
      YouTubeFullReleases(youtube) {
        let ytfr = youtube.replace('https://youtu.be/', '')
        if (youtube) {
          return (
            'https://www.youtube.com/watch?v=' +
            ytfr +
            '&list=PLp2GaPnw5O3Nhkwv3hkb1imrT6JNURnkU'
          )
        } else {
          return ytfr
        }
      },
      YouTubeIndividualTracks(youtube_playlist_id) {
        let ytit = youtube_playlist_id.replace('https://youtu.be/', '')
        if (youtube_playlist_id) {
          return 'https://www.youtube.com/playlist?list=' + ytit + '&index=1'
        } else {
          return ytit
        }
      }
    },
    // methods: {
    //   onLoad ({ route }) {
    //     const { key } = route.params
    //     console.log(key)
    //   },
    // },
    // mounted () {
    //   console.log('releases:', this.releases)
    //   console.log('release:', this.release)
    // },
    head() {
      return {
        title: this.release.title,
        meta: [
          {
            name: 'description',
            content:               this.release.format +
              ' with ' +
              this.release.tracks_number +
              ' tracks of ' +
              this.release.style +
              ' | ' +
              this.release.date.split('-')[0]
          },
          {
            property: 'og:image',
            content: this.release.cover_og
              ? this.release.cover_og
              : 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg?01'
          }
        ]
      }
    }
  }
</script>

<style lang="scss">
  @use '@/assets/scss/coriolanMedia' as media;
  @use '@/assets/scss/coriolanRatio' as ratio;
  @use '@/assets/scss/content';
  @use '@/assets/scss/page';
  @use '@/assets/scss/iframe-size';
  @use '@/assets/scss/v-img-restyle';

  .page-release {
    @extend .page;
    position: relative;

    &__wrapper {
      margin: 0 auto;
      max-width: 1278px;
      text-align: left;
      border-top: 1px solid rgba(#fff, 0.3);
      padding: 1.8em 0 1.8em;
      box-sizing: border-box;
      position: relative;
      z-index: 40;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-direction: column;

      @include media.media(L) {
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

      @include media.media(L) {
        margin-top: 62px;
        margin-bottom: 10em;
        // width: auto;
      }
    }

    &__title {
      font-size: 18px;
      line-height: 1.2;
      margin: 0 0 0.1em;
      color: #fff;

      @include media.media(M) {
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
        color: rgba(#fff, 0.5);
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
      @include ratio.ratio(100%, 16, 9);
      @extend .sentimony-iframe;

      &-iframe {
        border-radius: 6px;
        border: none;
        position: absolute;
        top: 0;
        left: 0;
        width: 143%;
        height: 143%;
        transform: scale(0.7);
        transform-origin: top left;
      }
    }

    &__soundcloud-player {
      // @include ratio.ratio(100%,16,9);
      @extend .sentimony-iframe;
    }

    &__spotify-player-iframe {
      @extend .sentimony-iframe;
    }
  }
</style>
