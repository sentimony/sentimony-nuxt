<template>
  <div class="friend">
    <h1>{{ friend.title }}</h1>
    <p>Links:</p>
    <p v-for="i in friend.links">
      <a v-if="i.url" :href="i.url" target="_blank" rel="noopener">{{ i.id }}</a>
    </p>
  </div>
</template>

<script>
  import axios from '~/plugins/axios'
  import moment from 'moment'

  export default {
    async asyncData({ route }) {
      const { key } = route.params
      const { data } = await axios.get(`friends/${key}.json`)
      return { friend: data }
    },
    head () {
      return {
        title: this.friend.title,
        meta: [
          { name: 'description', content: this.friend.title + ' description' },
          { property: 'og:image', content: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/og%2Fog-default.jpg?alt=media&token=85a8d7a3-ab49-4cff-9df9-fd3e2478e780' }
        ]
      }
    }
  }
</script>

<style lang="scss">
  @import '../../assets/scss/page';

  .friend {
    @extend .page;
  }
</style>
