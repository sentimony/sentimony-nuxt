<template>
  <div>
    <h2 class="headline">Rendered From:<span class="render-result">{{renderSource}}</span></h2>
    <h1>{{ release.title }}</h1>
    <img v-if="release.cover" class="item__img"
      :src="'https://content.sentimony.com/assets/img/releases/small/' + release.cat_no + '/' + release.slug + '.jpg'"
      :srcset="'https://content.sentimony.com/assets/img/releases/small/' + release.cat_no + '/' + release.slug + '.jpg 1x, https://content.sentimony.com/assets/img/releases/small-retina/' + release.cat_no + '/' + release.slug + '.jpg 2x'"
      :alt="release.title + ' Small Thumbnail'"
    >
  </div>
</template>

<script>
  import fetch from 'isomorphic-fetch'

  export default {
    async asyncData({ route }) {
      const { key } = route.params
      const response = await fetch('https://sentimony-db.firebaseio.com/releases/' + key + '.json')
      const release = await response.json()
      return {
        release,
        renderSource: process.static ? 'static' : (process.server ? 'server' : 'client')
      }
    }
  }
</script>

<style>
</style>
