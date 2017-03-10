<template>
  <div class="release">
    <h1>{{ release.title }}</h1>
    <div class="release__content">
      <div class="release__bandcamp-container" v-if='release.bandcampId'>
        <iframe class="release__iframe-bandcamp" :src="'https://bandcamp.com/EmbeddedPlayer/album=' + release.bandcampId + '/size=large/bgcol=222222/linkcol=4ec5ec/artwork=small/transparent=true/'" seamless></iframe>
      </div>
      <div v-if='release.link_bandcamp'>
        bandcamp:
        <a :href="release.link_bandcamp" target="_blank">{{ release.link_bandcamp }}</a>
      </div>
      <div v-if='release.link_ektoplazm'>
        ektoplazm:
        <a :href="release.link_ektoplazm" target="_blank">{{ release.link_ektoplazm }}</a>
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

  &__bandcamp-container {
    width: 100%;
    padding: 16px;
    background: rgba(#fff,.1);
    border-radius: 8px;
    box-sizing: border-box;
    margin-bottom: 2em;
  }

  &__iframe-bandcamp {
    border: 0;
    width: 100%;
    height: 580px;
    // background: #303030;
    background-image: repeating-linear-gradient(135deg, rgba(#fff,.0), rgba(#fff,.0) 4px, rgba(#fff,.1) 4px, rgba(#fff,.1) 8px);
  }

  &__content {
    max-width: 555px;
    text-align: left;
    margin: 0 auto;
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
  }
}
</script>
