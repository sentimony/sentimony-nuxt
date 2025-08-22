<template>
  <div class="artist-page">

    <div class="page-artist">
      <SvgTriangle/>
      <div class="page-artist__wrapper">

        <div class="page-artist__media">

          <AppCover
            :cover_th="artist.photo_th"
            :cover_xl="artist.photo_xl"
            category="artists"
            :title="artist.title"
            v-ripple
          />

          <p v-if="artist.category == 'musician' && artist.style" class="small-info">Style: <span class="page-artist__style">{{ artist.style }}</span></p>
          <p v-if="artist.category == 'designer'" class="small-info">Visual Artist & Designer</p>
          <h1 v-if="artist.title" class="page-artist__title">{{ artist.title }}</h1>
          <p v-if="artist.name" class="small-info">Name: {{ artist.name }}</p>
          <p v-if="artist.location" class="small-info">Location: {{ artist.location }}</p>

          <p class="small-info">Links:</p>
          <AppBtn redirect="false" v-if="artist.spotify" :url="artist.spotify" route="false" :title="titles.spotify" :icon="icons.spotify"/>
          <AppBtn redirect="false" v-if="artist.soundcloud_url" :url="artist.soundcloud_url" route="false" :title="titles.soundcloud" :icon="icons.soundcloud"/>
          <AppBtn redirect="false" v-if="artist.facebook" :url="artist.facebook" route="false" :title="titles.facebook" :icon="icons.facebook"/>
          <!-- <AppBtn redirect="false" v-if="artist.facebook_personal" :url="artist.facebook_personal" route="false" :title="titles.facebook_personal" :icon="icons.facebook"/> -->
          <AppBtn redirect="false" v-if="artist.instagram" :url="artist.instagram" route="false" :title="titles.instagram" :icon="icons.instagram"/>
          <AppBtn redirect="false" v-if="artist.youtube_url" :url="artist.youtube_url" route="false" :title="titles.youtube" :icon="icons.youtube"/>
          <AppBtn redirect="false" v-if="artist.bandcamp_url" :url="artist.bandcamp_url" route="false" :title="titles.bandcamp" :icon="icons.bandcamp"/>
          <!-- <AppBtn redirect="false" v-if="artist.instagram_personal" :url="artist.instagram_personal" route="false" :title="titles.instagram_personal" :icon="icons.instagram"/> -->
          <!-- <AppBtn redirect="false" v-if="artist.mixcloud" :url="artist.mixcloud" route="false" :title="titles.mixcloud" :icon="icons.mixcloud"/> -->
          <!-- <AppBtn redirect="false" v-if="artist.discogs" :url="artist.discogs" route="false" :title="titles.discogs" :icon="icons.discogs"/> -->
          <AppBtn redirect="false" v-if="artist.website" :url="artist.website" route="false" :title="titles.website" :icon="icons.diggersfactory"/>

        </div>

        <div class="page-artist__player-tabs">

          <AppTabs>

            <AppTab
              v-if="artist.youtube_playlist_id"
              :icon="icons.youtube"
              title="YouTube"
            >
              <div class="iframe-holder">
                <div class="iframe-holder__ratio">
                  <iframe 
                    class="iframe-holder__iframe"
                    :src="'https://www.youtube-nocookie.com/embed/videoseries?list=' + artist.youtube_playlist_id + '&loop=1'"
                    :title="artist.title + 'YouTube video player'"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            </AppTab>

            <!-- <AppTab
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
            </AppTab> -->

            <!-- <AppTab
              v-if="artist.soundcloud_artist_playlist_id"
              :icon="icons.soundcloud"
              title="SoundCloud<br>(Artist)"
            >
              <iframe
                :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/' + artist.soundcloud_artist_playlist_id + '&amp;color=00aabb&amp;hide_related=true&amp;show_comments=true&amp;show_user=false&amp;sharing=false&amp;show_bpm=true'"
                :title="artist.title + ' SoundCloud Iframe'"
                style="width:100%;height:500px;border:none;display:block"
              ></iframe>
            </AppTab> -->

            <AppTab
              v-if="artist.soundcloud_track_id"
              :icon="icons.soundcloud"
              title="SoundCloud"
            >
              <iframe width="100%" height="300" scrolling="no" frameborder="no" allow="autoplay" 
                :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/' + artist.soundcloud_track_id + '&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true'"
              ></iframe>
            </AppTab>

            <AppTab
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
            </AppTab>

          </AppTabs>

        </div>

      </div>
    </div>

    <div class="content">
      <div class="content__wrapper">

        <div
          v-if="artist.information"
          v-html="artist.information"
        />
        <hr v-if="artist.information">

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
              <!-- <div v-if="i.visible && i.artists.includes(artist.slug) && i.title">
                {{ i.title }}
              </div> -->
            </div>
          </div>
          <hr>
        </div>

        <p v-if="artist.category == 'musician'"><small><b>Releases with {{ artist.title }}:</b></small></p>
        <!-- <p v-if="artist.category == 'dj'"><small><b>Releases compiled by {{ artist.title }}:</b></small></p> -->
        <p v-if="artist.category == 'designer'"><small><b>Releases with {{ artist.title }} artwork:</b></small></p>
        <p v-if="artist.category == 'mastering'"><small><b>Releases mastered by {{ artist.title }}:</b></small></p>
        <p
          v-for="(i, index) in releasesSortByDate"
          :key="index"
          v-if="i.visible && i.artists.includes(artist.slug)"
        >

          <AppRelativeItem
            :i="i"
            category="release"
          />

        </p>
        <hr>

        <p v-if="artist.discogs"><small><b>Links:</b></small></p>
        <p v-if="artist.discogs"><a :href="artist.discogs" target="_blank" rel="noopener">Discogs</a></p>
        
      </div>
    </div>

  </div>
</template>

<script>
import sortBy from 'lodash/sortBy'
import moment from 'moment'

import axios from '@/plugins/axios'
import AppContent from '@/plugins/AppContent'

import SvgTriangle from '@/components/SvgTriangle.vue'
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
    AppRelativeItem,
  },
  data() {
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
  head() {
    return {
      title: this.artist.title,
      meta: [
        { name: 'description', content: this.artist.style + ' ' + this.artist.category + ' from ' + this.artist.location },
        { property: 'og:image', content: this.artist.photo_og ? this.artist.photo_og : 'https://content.sentimony.com/assets/img/artists/og-images/' + this.artist.slug + '.jpg?01' }
      ]
    }
  }
}
</script>

<style lang="scss">
@use '@/assets/scss/coriolanMedia' as media;
@use '@/assets/scss/coriolanRatio' as ratio;
// @use '@/assets/scss/buttons';
// @use '@/assets/scss/content';
// @use '@/assets/scss/page';
// @use '@/assets/scss/v-img-restyle';
@use '@/assets/scss/page';

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

  &__photo {
    background-color: rgba(#000, 0.5);
    box-shadow: 0 2px 10px 0 rgba(#000, 0.5);
    border-radius: 2px;
    min-width: 100px;
    height: 100px;
    overflow: hidden;
    margin-right: 1.4em;
    position: relative;

    @include media.media(M) {
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

      @include media.media(M) {
        width: 190px;
      }
    }

    &-coming {
      padding: 1em 1.2em;
      font-size: 10px;
      color: rgba(#fff,.5);

      @include media.media(M) {
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

    @include media.media(M) {
      font-size: 30px;
    }
  }

  &__player-tabs {
    width: 100%;
    max-width: 540px;
    margin: 0 auto;
  }

  .iframe-holder {
    max-width: 777px;
    margin-left: auto;
    margin-right: auto;

    &__ratio {
      position: relative;
      @include ratio.ratio(100%,16,9);
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
