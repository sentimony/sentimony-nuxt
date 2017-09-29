<template>
  <div class="friends">
    <h1>Friends</h1>
    <div class="friends__list">
      <p v-for="i in friends" class="friends__item">
        <span class="friends__title">{{ i.title }}</span>
        <a v-if="i.site" :href="i.site" class="friends__site"><span class="icon-public"></span></a>
        <a v-if="i.bandcamp" :href="i.bandcamp" class="friends__link"><span class="icon-bandcamp"></span></a>
        <a v-if="i.facebook" :href="i.facebook" class="friends__link"><span class="icon-facebook"></span></a>
        <a v-if="i.soundcloud" :href="i.soundcloud" class="friends__link"><span class="icon-soundcloud"></span></a>
      </p>
    </div>
  </div>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  async asyncData() {
    const { data } = await axios.get('friends.json')
    return { friends: data }
  },
  head: {
    title: 'Friends',
    meta: [
      { name: 'description', content: 'Friends page description' }
    ]
  }
}
</script>

<style lang="scss">
.friends {
}
</style>
