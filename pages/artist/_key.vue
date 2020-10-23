<template>
  <div class="artist-page">

    <div class="page-artist">
      <SvgTriangle/>
      <div class="page-artist__wrapper">

        <div class="page-artist__media">
          <app-cover
            :cover="artist.photo"
            :category="'artists'"
            :slug="artist.slug"
            :title="artist.title"
          />

          <p v-if="artist.style" class="page-artist__small-info">
            <span class="page-artist__style">{{ artist.style }}</span>
          </p>
          <h1 v-if="artist.title" class="page-artist__title">{{ artist.title }}</h1>
          <p v-if="artist.name" class="page-artist__small-info">Name: {{ artist.name }}</p>
          <p v-if="artist.location" class="page-artist__small-info">Location: {{ artist.location }}</p>
        </div>

        <div class="page-artist__player-tabs">
          <vue-tabs>
            <v-tab v-if="artist.youtube_id" title="YouTube" icon="page__tab__icon--youtube">
              <div class="iframe-holder">
                <div class="iframe-holder__ratio">
                  <iframe
                    class="iframe-holder__iframe"
                    :src="'https://www.youtube.com/embed/videoseries?loop=1&list=' + artist.youtube_id"
                    :title="artist.title + ' YouTube Iframe'"
                  ></iframe>
                </div>
              </div>
            </v-tab>
            <v-tab v-if="artist.soundcloud_id" title="SoundCloud" icon="page__tab__icon--soundcloud">
              <iframe
                :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/' + artist.soundcloud_id + '&amp;color=00aabb&amp;hide_related=true&amp;show_comments=true&amp;show_user=false&amp;sharing=false&amp;show_bpm=true'"
                :title="artist.title + ' SoundCloud Iframe'"
                style="width:100%;height:500px;border:none;display:block"
              ></iframe>
            </v-tab>
            <v-tab v-if="artist.facebook" title="Facebook" icon="page__tab__icon--facebook">
              <iframe
                class="facebook-widget facebook-widget--size-s"
                :src="'https://www.facebook.com/plugins/page.php?href=' + artist.facebook + '%2F&tabs&width=287&height=214&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=197035617008842'"
                :title="artist.title + ' Facebook Mobile Iframe'"
                scrolling="no"
                frameborder="0"
                allowTransparency="true"
              ></iframe>
              <iframe
                class="facebook-widget facebook-widget--size-m"
                :src="'https://www.facebook.com/plugins/page.php?href=' + artist.facebook + '%2F&tabs&width=500&height=214&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=197035617008842'"
                :title="artist.title + ' Facebook Desktop Iframe'"
                scrolling="no"
                frameborder="0"
                allowTransparency="true"
              ></iframe>
            </v-tab>
            <!-- <v-tab v-if="artist.discogs" title="Discography" icon="page__tab__icon--discogs">
              <a :href="artist.discogs" target="_blank" rel="noopener" style="display:flex;align-items:center">
                <img src="https://content.sentimony.com/assets/img/svg-icons/discogs.svg" style="width:20px;margin-right:.4em">
                <span>Discogs</span>
              </a>
            </v-tab> -->
          </vue-tabs>
        </div>

      </div>
    </div>

    <div class="content">
      <div class="content__wrapper">

        <p>Releases:</p>
        <p
          v-for="(i, index) in releasesSortByDate"
          :key="index"
          v-if="i.visible && i.artists.includes(artist.slug)"
        >
          <span v-if="i.cover">
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
          <router-link v-ripple :to="'../../release/' + i.slug">Reed More</router-link>
        </p>
        <hr>

        <p v-if="artist.discogs">Links:</p>
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
  import SvgTriangle from '~/components/SvgTriangle.vue'
  import AppCover from '~/components/AppCover'
  import axios from '~/plugins/axios'
  import sortBy from 'lodash/sortBy'
  import moment from 'moment'

  export default {
    layout: 'artist',
    components: {
      SvgTriangle,
      AppCover
    },
    async asyncData({ route }) {
      const { key } = route.params
      const { data } = await axios.get(`artists/${key}.json`)
      return { artist: data }
    },
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
          { property: 'og:image', content: 'https://content.sentimony.com/assets/img/artists/og-images/' + this.artist.slug + '.jpg' }
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
  @import '../../assets/scss/buttons';
  @import '../../assets/scss/vue-tabs-restyle';
  @import '../../assets/scss/content';
  @import '../../assets/scss/page';
  @import '../../assets/scss/v-img-restyle';
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
        margin-bottom: 6em;
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

    &__small-info {
      font-size: 10px;
      color: rgba(#fff,.5);

      @include media(S) {
        font-size: 14px;
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

  .facebook-widget {
    border: none;
    overflow: hidden;
    margin: 0 auto;
    height: 214px;

    &--size-s {
      display: block;
      width: 287px;

      @include media(M) {
        display: none;
      }
    }

    &--size-m {
      display: none;
      width: 500px;

      @include media(M) {
        display: block;
      }
    }
  }
</style>
