<template>
  <div class="home">

    <div class="hero">
      <div class="hero__wrapper">
        <div class="hero__title">{{ siteTitle }}</div>
        <div class="hero__description">{{ siteDescription }}</div>
      </div>
    </div>

    <SwiperTop
      title="Releases"
      :list="releasesSortedByDate"
      category="releases"
      item="release"
    />

    <div class="about">
      <div class="about__wrapper">
        <p>
          <img class="about__logo" :src="logoNewUrlv3" :alt="logoNewAltv3"/>
          <!-- <img class="about__logo" :src="logoOldUrl" :alt="logoOldAlt"/> -->
        </p>
        <div class="about__description" v-html="aboutDescription"></div>
        <p>
          <!-- <img class="about__logo" :src="logoNewUrlv1" :alt="logoNewAltv1"/> -->
          <!-- <img class="about__logo" :src="logoNewUrlv2" :alt="logoNewAltv3"/> -->
          <!-- <img class="about__logo" :src="logoNewUrlv3" :alt="logoNewAltv3"/> -->
          <img class="about__logo" :src="logoOldUrl" :alt="logoOldAlt"/>
        </p>
      </div>
    </div>

    <SwiperTop
      title="Artists"
      :list="artistsSortedByCategoryId"
      category="artists"
      item="artist"
    />

    <!-- <SwiperTop
      title="videos"
      :list="videosSortedByDate"
      category="videos"
      item="video"
    /> -->

    <!-- <SwiperTop
      title="playlists"
      :list="playlistsSortedByDate"
      category="playlists"
      item="playlist"
    /> -->

  </div>
</template>

<script>
  import axios from 'axios'
  import sortBy from 'lodash/sortBy'

  import SwiperTop from '~/components/SwiperTop.vue'

  export default {
    components: {
      SwiperTop
    },
    data: () => ({
      logoOldUrl: 'https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo.svg?01',
      logoOldAlt: 'Sentimony Records Logo SVG',
      logoNewUrlv1: 'https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.1.svg?01',
      logoNewAltv1: 'Sentimony Records Logo v3.1 SVG',
      logoNewUrlv2: 'https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.2.svg?01',
      logoNewAltv2: 'Sentimony Records Logo v3.2 SVG',
      logoNewUrlv3: 'https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.3.svg?01',
      logoNewAltv3: 'Sentimony Records Logo v3.3 SVG',
      siteTitle: 'Sentimony Records',
      siteDescription: 'Psychedelic Music Label',
      aboutDescription: "<p>Sentimony Records is an independent psychedelic music label founded in Kyiv, Ukraine, in the autumn of 2006 by the visionary Ihor Orlovskyi, also known by his moniker 🇺🇦 <a href='/artist/irukanji/'>Irukanji</a>.</p><p>The label's main mission is to contribute to the growth of talented psy-minded artists, enriching the global soundscape with unique and exciting musical journeys.</p><p>Over the years, Sentimony Records has focused on its most beloved psychedelic subgenres: <a href='/playlist/dark-prog-zenonesque/'>DarkProg Psytrance</a> and <a href='/playlist/psychill-psybient/'>Trippy Psychill</a>. Through a deep commitment to these styles, the label continues to captivate listeners and inspire the worldwide psychedelic music community.</p>",
      releases: [],
      artists: [],
      // videos: [],
      // playlists: [],
    }),
    mounted () {
      axios.get('https://sentimony-db.firebaseio.com/releases.json')
        .then(response => { this.releases = response.data })
        .catch(error => { console.log(error) })

        axios.get('https://sentimony-db.firebaseio.com/artists.json')
        .then(response => { this.artists = response.data })
        .catch(error => { console.log(error) })

        // axios.get('https://sentimony-db.firebaseio.com/videos.json')
        // .then(response => { this.videos = response.data })
        // .catch(error => { console.log(error) })

        // axios.get('https://sentimony-db.firebaseio.com/playlists.json')
        // .then(response => { this.playlists = response.data })
        // .catch(error => { console.log(error) })

    },
    computed: {
      releasesSortedByDate () {
        return sortBy(this.releases, 'date').reverse()
      },
      artistsSortedByCategoryId () {
        return sortBy(this.artists, 'category_id')
      },
      // videosSortedByDate () {
      //   return sortBy(this.videos, 'date').reverse()
      // },
      // playlistsSortedByDate () {
      //   return sortBy(this.playlists, 'date').reverse().reverse()
      // },
    },
    head: {
      title: 'Home',
      meta: [
        { name: 'description', content: 'Home of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg?01' }
      ]
    }
  }
</script>

<style lang="scss">
  @import '../node_modules/coriolan-ui/tools/variables';
  @import '../node_modules/coriolan-ui/mixins/media';

  .hero {
    position: relative;
    background: linear-gradient(to bottom, transparent 0%, rgba(#000,.5) 100%);
    padding: 7.5em 0;

    @include media(S) {
      padding: 8.5em 0;
    }

    @include media(M) {
      padding: 9.5em 0;
    }

    @include media(L) {
      padding: 10.5em 0;
    }

    @include media(XL) {
      padding: 11.5em 0;
    }

    &__wrapper {
      max-width: 777px;
      margin: 0 auto;
      padding: 0 10px;
      box-sizing: border-box;
    }

    &__title {
      font-family: 'Julius Sans One', sans-serif;
      color: #fff;
      margin-bottom: .2em;
      font-weight: 400;
      font-size: 40px;
      letter-spacing: 2px;
      text-transform: uppercase;

      @include media(S) {
        font-size: 55px;
        letter-spacing: 5px;
      }

      @include media(M) {
        font-size: 70px;
        letter-spacing: 8px;
      }

      @include media(L) {
        font-size: 85px;
        letter-spacing: 11px;
      }

      @include media(XL) {
        font-size: 100px;
        letter-spacing: 14px;
      }
    }

    &__description {
      font-family: 'Julius Sans One', sans-serif;
      color: #fff;
      font-weight: 400;
      line-height: 2;
      font-size: 12px;
      letter-spacing: 4px;

      @include media(S) {
        font-size: 14px;
        letter-spacing: 8px;
      }

      @include media(M) {
        font-size: 16px;
        letter-spacing: 12px;
      }

      @include media(L) {
        font-size: 18px;
        letter-spacing: 16px;
      }

      @include media(XL) {
        font-size: 20px;
        letter-spacing: 20px;
      }
    }
  }

  .about {
    background-color: rgba(#000,.5);
    position: relative;

    &__description {
      text-align: left;

      & > p {
        text-indent: 20px;
      }
    }

    &__logo {
      display: inline-block;
      width: 60px;
      height: auto;
      margin: 0 10px;
    }

    &__wrapper {
      max-width: 500px;
      margin: 0 auto;
      padding: 3em 10px;
      box-sizing: border-box;

      p {

        a {
          color: #ff595e;
          text-indent: initial;

          &:hover {
            color: red;
          }
        }
      }
    }
  }

  // @import '../node_modules/coriolan-ui/tools/variables';
  // @import '../node_modules/coriolan-ui/mixins/media';

  // .home {
  //   padding-top: 4em;

  //   &__logo {
  //     display: block;
  //     max-width: 130px;
  //     margin: 0 auto;
  //     position: relative;
  //   }

  //   &__title {
  //     margin: .2em 0;
  //     text-transform: uppercase;
  //     letter-spacing: 2px;
  //     font-size: 2em;

  //     @include media(M) {
  //       letter-spacing: 3px;
  //       font-size: 3em;
  //     }
  //   }

  //   &__subtitle {
  //     margin: .4em 0;
  //     text-transform: uppercase;
  //     letter-spacing: 4px;
  //     font-size: .8em;

  //     @include media(M) {
  //       letter-spacing: 16px;
  //       font-size: 1.2em;
  //     }
  //   }
  // }
</style>
