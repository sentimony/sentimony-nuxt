<template>
  <div class="friend">
    <h1>{{ friend.title }}</h1>
    <p>Links:</p>
    <p
      v-for="(i, index) in friend.links"
      :key="index"
    >
      <a v-if="i.url" :href="i.url" target="_blank" rel="noopener">{{ i.id }}</a>
    </p>
  </div>
</template>

<script>
import axios from '@/plugins/axios'
import moment from 'moment'

export default {
  async asyncData({ route }) {
    const { key } = route.params
    const { data } = await axios.get(`friends/${key}.json`)
    return { friend: data }
  },
  head() {
    return {
      title: this.friend.title,
      meta: [
        { name: 'description', content: this.friend.title + ' description' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg?01' }
      ]
    }
  }
}
</script>

<style lang="scss">
@use '@/assets/scss/page';

.friend {
  @extend .page;
}
</style>
