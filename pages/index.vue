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
        <!-- <p>
          <img
            class="about__logo"
            :src="logoOldUrl"
            :alt="logoOldAlt"
          />
        </p> -->
        <p>
          <img
            class="about__logo"
            :src="logoNewUrl"
            :alt="logoNewAlt"
          />
        </p>
        <div class="about__description" v-html="aboutDescription"></div>
      </div>
    </div>

    <SwiperTop
      title="Artists"
      :list="artistsSortedByCategoryId"
      category="artists"
      item="artist"
    />

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
      logoOldUrl: 'https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo.svg',
      logoOldAlt: 'Sentimony Records Logo SVG',
      logoNewUrl: 'https://content.sentimony.com/assets/img/svg-icons/sentimony-records-logo-v3.3.svg',
      logoNewAlt: 'Sentimony Records Logo v3.3 SVG',
      siteTitle: 'Sentimony Records',
      siteDescription: 'Psychedelic Music Label',
      aboutDescription: " <p>Sentimony Records is an independent record label that was founded in the vibrant city of Kyiv, Ukraine during the enchanting autumn of 2006 by the visionary Ihor Orlovskyi, also known by his artistic moniker, <a href='/artist/irukanji/'>Irukanji</a>.</p><p>The label's primary mission is to nurture and contribute to the flourishing of the psychedelic trance and psychill scenes, enriching the global soundscape with its unique and immersive musical offerings.</p><p>In recent years, Sentimony Records has honed its focus on its most cherished genres, delving deeply into the mesmerizing realms of <a href='/playlist/dark-prog-zenonesque/'>DarkProg Psytrance</a>, as well as <a href='/playlist/psychill-psybient/'>Glitched Psychill</a>.</p><p>Through its dedication to these genres, the label continues to captivate listeners and inspire the psychedelic music community worldwide.</p>",
      releases: [],
      artists: [],
    }),
    mounted () {
      axios.get('https://sentimony-db.firebaseio.com/releases.json')
        .then(response => { this.releases = response.data })
        .catch(error => { console.log(error) })

      axios.get('https://sentimony-db.firebaseio.com/artists.json')
        .then(response => { this.artists = response.data })
        .catch(error => { console.log(error) })

    },
    computed: {
      releasesSortedByDate () {
        return sortBy(this.releases, 'date').reverse()
      },
      artistsSortedByCategoryId () {
        return sortBy(this.artists, 'category_id')
      },
    },
    head: {
      title: 'Home',
      meta: [
        { name: 'description', content: 'Home of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg' }
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
