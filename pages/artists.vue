<template>
  <div class="artists">
    <h1>Artists</h1>
    <div class="events__list">
      <p v-for="i in artists" class="events__item">
        <router-link :to="'/artist/' + i.slug" class="events__link">{{ i.title }}</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  head: {
    title: 'Artists',
    meta: [
      { name: 'description', content: 'Artists of Sentimony Records' }
    ]
  },
  async asyncData() {
    const { data } = await axios.get('artists.json')
    return { artists: data }
  }
}
</script>

<style lang="scss">
.artists {
}
</style>
