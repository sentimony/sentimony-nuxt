<template>
  <div class="artist">
    <h1>{{ artist.title }}</h1>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  async asyncData({ route }) {
    const { key } = route.params
    const { data } = await axios.get(`artists/${key}.json`)
    return { artist: data }
  },
  head: {
    title: 'Artist',
    meta: [
      { name: 'description', content: 'Artist description' }
    ]
  }
}
</script>

<style lang="scss">
.artist {
}
</style>
