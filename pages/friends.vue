<template>
  <div class="page">
    <h1>Friends</h1>
    <div class="">
      <p class="" v-for="(i, index) in friends" :key="index" v-if="i.visible">
        <router-link v-ripple :to="'/friend/' + i.slug" class="friends__link">{{
          i.title
        }}</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import axios from '@/plugins/axios'

export default {
  async asyncData() {
    const { data } = await axios.get('friends.json')
    return { friends: data }
  },
  head: {
    title: 'Friends',
    meta: [
      { name: 'description', content: 'Friends of Sentimony Records' },
      { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg?01' }
    ]
  }
}
</script>

<style lang="scss">
// @use '@/assets/scss/page';

// .friends {
//   @extend .page;
// }
</style>
