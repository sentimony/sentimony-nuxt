<template>
  <div class="release">
    <h1>{{ release.title }}</h1>
    <div class="release__media">
      <div class="release__row">
        <div class="release__thumb" v-if='release.cover'>
          <a :href="'https://content.sentimony.com/assets/img/releases/large/' + release.cat_no.substr(0,8) + '/' + release.slug + '.jpg'">
            <img class="release__cover" :src="'https://content.sentimony.com/assets/img/releases/medium/' + release.cat_no.substr(0,8) + '/' + release.slug + '.jpg'" :alt="release.title">
          </a>
        </div>
        <p v-if='release.bandcamp_id'>
          <a class="release__btn-bandcamp" :href="release.link_bandcamp" target="_blank">Bandcamp</a>
        </p>
        <p v-if='release.youtube_id'>
          <a class="release__btn-bandcamp" :href="'https://www.youtube.com/watch?v=' + release.youtube_id" target="_blank">Youtube</a>
        </p>
        <div v-if='release.cat_no'>
          Cat#:
          <span>{{ release.cat_no.toUpperCase() }}</span>
        </div>
        <div>
          Released:
          <span v-if='release.date'>{{ release.date | day }}</span>
          <span v-else>Coming Soon</span>
        </div>
        <div v-if='release.style'>
          Style:
          <span v-html='release.style'></span>
        </div>
        <div v-if='release.compiled_by'>
          Compiled By:
          <span v-html='release.compiled_by'></span>
        </div>
        <div v-if='release.artwork_by'>
          Artwork:
          <span v-html='release.artwork_by'></span>
        </div>
        <div v-if='release.mastered_by'>
          Mastering:
          <span v-html='release.mastered_by'></span>
        </div>
      </div>
      <div class="release__row">
        <div class="release__bandcamp-container" v-if='release.bandcamp_id'>
          <iframe class="release__bandcamp-iframe" :src="'https://bandcamp.com/EmbeddedPlayer/album=' + release.bandcamp_id + '/size=large/bgcol=222222/linkcol=1a96bc/artwork=false/transparent=true/'" seamless></iframe>
        </div>
      </div>
    </div>
    <div class="release__content">
      <div class="release__info" v-if='release.info' v-html='release.info'></div>
      <!-- <div>Links:</div> -->
      <div v-if='release.link_ektoplazm'>
        <a :href="release.link_ektoplazm" target="_blank">Ektoplazm</a>
      </div>
      <div v-if='release.link_discogs'>
        <a :href="'https://www.discogs.com/master/view/' + release.link_discogs" target="_blank">Discogs</a>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '../../node_modules/coriolan-ui/mixins/ratio';

.release {
  width: 100%;
  padding: 0 .8em;
  box-sizing: border-box;

  &__media {
    // max-width: 700px;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    text-align: left;
  }

  &__row {
    margin-left: .4em;
    margin-right: .4em;
    &:first-child {
      flex-basis: 40%;
    }
    &:nth-child(2) {
      flex-basis: 60%;
    }
  }

  &__content {
    max-width: 555px;
    text-align: left;
    margin: 0 auto;
  }

  &__thumb {
    // order: 2;
  }

  &__cover {
    width: 100%;
    // opacity: .6;
    display: block;
    margin-bottom: .8em;
  }

  &__bandcamp-container {
    // order: 1;
    flex-basis: 450px;
    padding: .8em;
    background: rgba(#fff,.1);
    border-radius: .6em;
    box-sizing: border-box;
    margin-bottom: 2em;
  }

  &__bandcamp-iframe {
    opacity: .9;
    border: 0;
    width: 100%;
    height: 580px;
    // background: #303030;
    background-image: repeating-linear-gradient(135deg, rgba(#fff,.0), rgba(#fff,.0) 4px, rgba(#fff,.1) 4px, rgba(#fff,.1) 8px);
  }

  &__btn-bandcamp {
    padding: .8em 1.4em;
    background-color: #1a96bc;
    display: inline-block;
    text-transform: uppercase;
    color: #fff;
  }
}
</style>

<script>
import axios from '~plugins/axios'

export default {
  head: {
    title: 'Release',
    meta: [
      { name: 'description', content: 'Release description' }
    ]
  },
  async asyncData({ route }) {
    const { key } = route.params
    const { data } = await axios.get(`releases/${key}.json`)
    return {
      release: data
    }
  },
  filters: {
    day (date) {
      return date.split('T')[0]
    }
  }
}
</script>
