<template>
  <div class="release">
    <h1>{{ release.title }}</h1>
    <div class="release__container">
      <div>
        bandcamp:
        <a :href="release.link_bandcamp" target="_blank">{{ release.link_bandcamp }}</a>
      </div>
      <div>
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

  &__container {
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
