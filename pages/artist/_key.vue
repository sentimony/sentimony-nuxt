<template>
  <div class="artist">
    <h1>{{ artist.title }}</h1>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  layout: 'artist',
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
.artist {
  border-top: 1px solid rgba(#fff,.3);
}
</style>
