<template>
  <div class="artist-page">

    <div class="page-artist">
      <SvgTriangle/>
      <div class="page-artist__wrapper">

        <div class="page-artist__media">

          <app-cover
            :cover_xl="artist.photo_xl"
            :cover="artist.photo"
            :category="'artists'"
            :slug="artist.slug"
            :title="artist.title"
          />

          <p v-if="artist.category == 'musician' && artist.style" class="small-info">Style: <span class="page-artist__style">{{ artist.style }}</span></p>
          <p v-if="artist.category == 'designer'" class="small-info">Visual Artist & Designer</p>
          <h1 v-if="artist.title" class="page-artist__title">{{ artist.title }}</h1>
          <p v-if="artist.name" class="small-info">Name: {{ artist.name }}</p>
          <p v-if="artist.location" class="small-info">Location: {{ artist.location }}</p>

          <p class="small-info">Artist Links:</p>
          <app-btn v-if="artist.soundcloud_url" :url="artist.soundcloud_url" :route="false" :title="titles.soundcloud" :icon="icons.soundcloud"/>
          <app-btn v-if="artist.spotify" :url="artist.spotify" :route="false" :title="titles.spotify" :icon="icons.spotify"/>
          <app-btn v-if="artist.mixcloud" :url="artist.mixcloud" :route="false" :title="titles.mixcloud" :icon="icons.mixcloud"/>
          <app-btn v-if="artist.facebook" :url="artist.facebook" :route="false" :title="titles.facebook_artist" :icon="icons.facebook"/>
          <app-btn v-if="artist.facebook_personal" :url="artist.facebook_personal" :route="false" :title="titles.facebook_personal" :icon="icons.facebook"/>
          <app-btn v-if="artist.instagram" :url="artist.instagram" :route="false" :title="titles.instagram" :icon="icons.instagram"/>
          <app-btn v-if="artist.bandcamp_url" :url="artist.bandcamp_url" :route="false" :title="titles.bandcamp" :icon="icons.bandcamp"/>
          <app-btn v-if="artist.youtube_url" :url="artist.youtube_url" :route="false" :title="titles.youtube" :icon="icons.youtube"/>
          <!-- <app-btn v-if="artist.discogs" :url="artist.discogs" :route="false" :title="titles.discogs" :icon="icons.discogs"/> -->

        </div>

        <div class="page-artist__player-tabs">

          <app-tabs>
            <app-tab
              v-if="artist.youtube_playlist_id"
              :icon="icons.youtube"
              title="YouTube"
            >
              <div class="iframe-holder">
                <div class="iframe-holder__ratio">
                  <iframe
                    class="iframe-holder__iframe"
                    :src="'https://www.youtube.com/embed/videoseries?loop=1&list=' + artist.youtube_playlist_id"
                    :title="artist.title + ' YouTube Iframe'"
                  ></iframe>
                </div>
              </div>
            </app-tab>
            <app-tab
              v-if="artist.soundcloud_label_playlist_id"
              :icon="icons.soundcloud"
              title="SoundCloud<br>(Label)"
            >
              <div class="playlist-release__soundcloud-player">
                <iframe
                  class="playlist-release__soundcloud-player-iframe"
                  scrolling="no"
                  height="450"
                  allow="autoplay"
                  :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/' + artist.soundcloud_label_playlist_id + '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=true&show_user=false&show_reposts=true&show_teaser=false'"
                  :title="artist.title + ' SoundCloud Iframe'"
                ></iframe>
              </div>
            </app-tab>
            <app-tab
              v-if="artist.soundcloud_artist_playlist_id"
              :icon="icons.youtube"
              title="SoundCloud<br>(Artist)"
            >
              <iframe
                :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/' + artist.soundcloud_artist_playlist_id + '&amp;color=00aabb&amp;hide_related=true&amp;show_comments=true&amp;show_user=false&amp;sharing=false&amp;show_bpm=true'"
                :title="artist.title + ' SoundCloud Iframe'"
                style="width:100%;height:500px;border:none;display:block"
              ></iframe>
            </app-tab>
            <app-tab
              v-if="artist.facebook"
              :icon="icons.facebook"
              title="Facebook"
            >
              <iframe
                v-if="$mq === 'sm'"
                class="facebook-widget facebook-widget--size-sm"
                :src="'https://www.facebook.com/plugins/page.php?href=' + artist.facebook + '%2F&tabs&width=287&height=214&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=197035617008842'"
                :title="artist.title + ' Facebook Mobile Iframe'"
                scrolling="no"
                frameborder="0"
                allowTransparency="true"
              ></iframe>
              <iframe
                v-if="$mq === 'md' || $mq === 'lg'"
                class="facebook-widget facebook-widget--size-md"
                :src="'https://www.facebook.com/plugins/page.php?href=' + artist.facebook + '%2F&tabs&width=500&height=214&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=197035617008842'"
                :title="artist.title + ' Facebook Desktop Iframe'"
                scrolling="no"
                frameborder="0"
                allowTransparency="true"
              ></iframe>
            </app-tab>
          </app-tabs>

        </div>

      </div>
    </div>

    <div class="content">
      <div class="content__wrapper">

        <div v-if="artist.category == 'designer'">
          <p>Gallery:</p>
          <div class="d-flex flex-wrap" style="margin:0 -3px;">
            <div v-for="(i, index) in releasesSortByDate"
                :key="index"
                style="width:25%;height:auto;padding:3px;box-sizing:border-box;"
                v-if="i.visible && i.artists.includes(artist.slug)"
            >
              <img v-img:group
                v-if="i.visible && i.artists.includes(artist.slug) && i.cover_xl"
                style="width:100%;height:auto;"
                :src="i.cover_xl"
              >
              <img v-img:group
                v-if="i.visible && i.artists.includes(artist.slug) && i.cover"
                :src="'https://content.sentimony.com/assets/img/releases/large/' + i.slug + '.jpg'"
                :srcset="'https://content.sentimony.com/assets/img//releases/medium/' + i.slug +'.jpg 1x, https://content.sentimony.com/assets/img//releases/medium-retina/' + i.slug +'.jpg 2x'"
                :alt="i.title"
                style="width:100%;height:auto;"
              />
              <!-- <div v-if="i.visible && i.artists.includes(artist.slug) && i.title">
                {{ i.title }}
              </div> -->
            </div>
          </div>
          <hr>
        </div>

        <p>Releases:</p>
        <p
          v-for="(i, index) in releasesSortByDate"
          :key="index"
          v-if="i.visible && i.artists.includes(artist.slug)"
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
        <!-- <p v-else>Coming soon</p> -->
        <hr>

        <p v-if="artist.discogs">Links:</p>
        <!-- <p v-if="artist.soundcloud_url"><a :href="artist.soundcloud_url" target="_blank" rel="noopener">SoundCloud</a></p> -->
        <p v-if="artist.discogs"><a :href="artist.discogs" target="_blank" rel="noopener">Discogs</a></p>
        <hr v-if="artist.discogs">

        <VueDisqus
          shortname="sentimony"
          :identifier="artist.slug"
          :url="'https://sentimony.com/artist/' + artist.slug"
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

  import SvgTriangle from '~/components/SvgTriangle.vue'
  import AppCover from '~/components/AppCover'
  import AppBtn from '~/components/AppBtn'
  import AppTabs from '~/components/AppTabs.vue'
  import AppTab from '~/components/AppTab.vue'

  export default {
    layout: 'artist',
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
    //   const { data } = await axios.get(`artists/${key}.json`)
    //   return { artist: data }
    // },
    async asyncData({ route }) {
      const { key } = route.params
      const [artistRes, releasesRes] = await Promise.all([
        axios.get(`artists/${key}.json`),
        axios.get('releases.json')
      ]);
      const artist = artistRes.data
      const releases = releasesRes.data
      return { artist, releases }
    },
    computed: {
      releasesSortByDate() {
        var releases = sortBy(this.releases, 'date').reverse()
        return releases
      }
    },
    filters: {
      year: function (date) {
        if (date) {
          return moment(String(date)).format('YYYY');
        }
      }
    },
    head () {
      return {
        title: this.artist.title,
        meta: [
          { name: 'description', content: this.artist.title + ' description' },
          { property: 'og:image', content: this.artist.photo_og ? this.artist.photo_og : 'https://content.sentimony.com/assets/img/artists/og-images/' + this.artist.slug + '.jpg' }
        ]
      }
    }
  }
</script>

<style lang="scss">
  @import '../../node_modules/coriolan-ui/tools/variables';
  @import '../../node_modules/coriolan-ui/mixins/media';
  @import '../../node_modules/coriolan-ui/mixins/ratio';
  @import '../../assets/scss/variables';
  // @import '../../assets/scss/buttons';
  // @import '../../assets/scss/vue-tabs-restyle';
  // @import '../../assets/scss/content';
  // @import '../../assets/scss/page';
  // @import '../../assets/scss/v-img-restyle';
  @import '../../assets/scss/page';

  .page-artist {
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

    &__photo {
      background-color: $colorBgBlack;
      box-shadow: $shadow;
      border-radius: 2px;
      min-width: 100px;
      height: 100px;
      overflow: hidden;
      margin-right: 1.4em;
      position: relative;

      @include media(M) {
        min-width: 190px;
        height: 190px;
      }

      &-link {
      }

      &-img {
        // position: absolute;
        // top: 50%;
        // left: 50%;
        // transform: translate3d(-50%,-50%,0);
        display: block;
        width: 100px;
        height: auto;
        border-radius: 2px;

        @include media(M) {
          width: 190px;
        }
      }

      &-coming {
        padding: 1em 1.2em;
        font-size: 10px;
        color: rgba(#fff,.5);

        @include media(M) {
          font-size: 14px;
        }
      }
    }

    &__style {
      display: inline-block;
      text-transform: capitalize;
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
    }

    .iframe-holder {
      max-width: 777px;
      margin-left: auto;
      margin-right: auto;

      &__ratio {
        position: relative;
        @include ratio(100%,16,9);
      }

      &__iframe {
        border: 0;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        left: 0;
        width: 143%;
        height: 143%;
        transform: scale(.7);
        transform-origin: top left;
      }
    }
  }
</style>
