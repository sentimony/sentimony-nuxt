<template>
  <div class="release">
    <h1>{{ release.title }}</h1>
    <div class="release__media">
      <div class="release__row">
        <div class="release__thumb" v-if='release.cover_medium'>
          <img class="release__cover" :src="release.cover_medium" :alt="release.title">
        </div>
        <p v-if='release.link_bandcamp'>
          <a class="release__btn-bandcamp" :href="release.link_bandcamp + '?action=download'" target="_blank">Donate</a>
        </p>
        <div v-if='release.date'>
          Release Date:
          {{ release.date | day }}
        </div>
        <br>
        <div v-if='release.link_ektoplazm'>
          <a :href="release.link_ektoplazm" target="_blank">Ektoplazm</a>
        </div>
        <div v-if='release.link_discogs'>
          <a :href="release.link_discogs" target="_blank">Discogs</a>
        </div>
      </div>
      <div class="release__row">
        <div class="release__bandcamp-container" v-if='release.bandcamp_id'>
          <iframe class="release__bandcamp-iframe" :src="'https://bandcamp.com/EmbeddedPlayer/album=' + release.bandcamp_id + '/size=large/bgcol=222222/linkcol=1a96bc/artwork=false/transparent=true/'" seamless></iframe>
        </div>
      </div>
    </div>
    <div class="release__content">
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
    max-width: 777px;
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
  async data({ route }) {
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
