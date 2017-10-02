<template>
  <div class="artist-page">

    <div class="page-artist">
      <SvgTriangle/>
      <div class="page-artist__wrapper">

        <div class="page-artist__media">
          <div class="page-artist__photo">
            <a v-if="artist.photo" class="page-artist__photo-link" :href="'https://content.sentimony.com/assets/img/artists/large/' + artist.slug + '.jpg'">
              <img class="page-artist__photo-img"
                :src="'https://content.sentimony.com/assets/img/artists/small/' + artist.slug + '.jpg'"
                :srcset="'https://content.sentimony.com/assets/img/artists/medium/' + artist.slug + '.jpg 1x, https://content.sentimony.com/assets/img/artists/medium-retina/' + artist.slug + '.jpg 2x'"
                :alt="artist.title + ' Medium Thumbnail'"
              >
            </a>
            <div v-else class="page-artist__photo-coming">Photo<br>coming soon</div>
          </div>
          <div class="page-artist__info">
            <div v-if="artist.style" class="page-artist__small-info">
              <div class="page-artist__style">{{ artist.style }}</div>
            </div>
            <h1 v-if="artist.title" class="page-artist__title">{{ artist.title }}</h1>
            <div v-if="artist.name" class="page-artist__small-info">Name: {{ artist.name }}</div>
            <div v-if="artist.location" class="page-artist__small-info">Location: {{ artist.location }}</div>
          </div>
        </div>

        <div class="page-artist__player-tabs">
          <vue-tabs>
            <v-tab v-if="artist.youtube_id" title="YouTube" icon="icon-youtube">
              <div class="iframe-holder">
                <div class="iframe-holder__ratio">
                  <iframe
                    class="iframe-holder__iframe"
                    :src="'https://www.youtube.com/embed/videoseries?list=' + artist.youtube_id"
                    :title="artist.title + ' YouTube Iframe'"
                  ></iframe>
                </div>
              </div>
            </v-tab>
            <v-tab v-if="artist.soundcloud_id" title="SoundCloud" icon="icon-soundcloud">
              <iframe
                :src="'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/' + artist.soundcloud_id + '&amp;color=00aabb&amp;hide_related=true&amp;show_comments=true&amp;show_user=false&amp;sharing=false&amp;show_bpm=true'"
                :title="artist.title + ' SoundCloud Iframe'"
                style="width:100%;height:500px;border:none;display:block"
              ></iframe>
            </v-tab>
            <v-tab v-if="artist.facebook" title="Facebook" icon="icon-facebook">
              <!-- TODO: What is appId ??? -->
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
            <v-tab v-if="artist.discogs" title="Discography" icon="icon-discogs">
              <a :href="artist.discogs" target="_blank" rel="noopener" style="display:flex;align-items:center">
                <img src="/assets/img/svg-icons/discogs.svg" style="width:20px;margin-right:.4em">
                <span>Discogs</span>
              </a>
            </v-tab>
          </vue-tabs>
        </div>

      </div>
    </div>

    <!-- <div class="page-artist-content">
      <div class="page-artist-content__wrapper">
        <disqus-comments></disqus-comments>
      </div>
    </div> -->

  </div>
</template>

<script>
import axios from '~/plugins/axios'
import SvgTriangle from '~/components/SvgTriangle.vue'

export default {
  layout: 'artist',
  components: {
    SvgTriangle
  },
  async asyncData({ route }) {
    const { key } = route.params
    const { data } = await axios.get(`artists/${key}.json`)
    return { artist: data }
  },
  head () {
    return {
      title: this.artist.title,
      meta: [
        { name: 'description', content: this.artist.title + ' description' }
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

.page-artist {
  position: relative;
  padding: 0 .6em;

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
    // align-items: flex-start;
    // justify-content: space-between;

    @include media(L) {
      margin-top: 62px;
      margin-bottom: 6em;
      width: auto;
    }
  }

  &__photo {
    background-color: $colorBgBlack;
    box-shadow: $shadow;
    border-radius: 8px;
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
      border-radius: 8px;

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

  &__info {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding-right: 1.1em;
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
    text-transform: capitalize;

    @include media(S) {
      font-size: 2em;
    }
  }

  &__player-tabs {
    min-width: 100%;

    @include media(M) {
      min-width: 560px;
    }

    @include media(XL) {
      min-width: 660px;
    }
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
      width: 100%;
      height: 100%;
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
