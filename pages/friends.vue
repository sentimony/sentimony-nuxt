<template>
  <div class="friends">
    <h1>Friends</h1>
    <div class="friends__list">
      <p class="friends__item"
        v-for="(i, index) in friends"
        :key="index"
      >
        <router-link v-ripple :to="'/friend/' + i.slug" class="friends__link" v-if="i.title">{{ i.title }}</router-link>
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
        { name: 'description', content: 'Friends of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-default.jpg' }
      ]
    }
  }
</script>

<style lang="scss">
  @import '../assets/scss/page';

  .friends {
    @extend .page;
  }
</style>
