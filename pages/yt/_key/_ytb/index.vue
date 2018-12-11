<template>
  <div class="youtube-page-item">
    <router-link v-ripple :to="'/yt/' + release">Back to Release page</router-link><br>
    <br>
    <h1>{{ track.artist }} - {{ track.title }}</h1>
    <br>
    <iframe
      v-if="track.ytb"
      :src="'https://ytuber.ru/task/done_recalc/' + track.ytb"
      title="frame"
      style="background:#ccc;"
    ></iframe>
  </div>
</template>

<script>
  import axios from '~/plugins/axios'

  export default {
    async asyncData({ route }) {
      const { key, ytb } = route.params
      const { data } = await axios.get(`releases/${key}/tracklist/tracks/${ytb}.json`)
      return {
        track: data,
        release: key
      }
    }
  }
</script>

<style lang="scss">
  .youtube-page-item {
    padding: 2em 0;
    max-width: 400px;
    margin: 0 auto;
    font-size: 12px;
    line-height: 1.2;
    text-align: left;
    font-family: Roboto, Arial, sans-serif;
    font-weight: 400;
  }
</style>
