<template>
  <div class="friends">
    <h1>Friends</h1>
    <div class="friends__list">
      <p v-for="i in friends" class="friends__item">
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
        { property: 'og:image', content: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/og%2Fog-default.jpg?alt=media&token=85a8d7a3-ab49-4cff-9df9-fd3e2478e780' }
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
