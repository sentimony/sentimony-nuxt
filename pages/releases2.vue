<template>
  <div class="releases">
    <h1>Releases 2</h1>
    <div class="list">
      <!-- <div class="item">
        Release Title Static
      </div> -->
      <div v-if="loading">loading...</div>
      <div v-else v-for="i in releases" :key="i.id" class="item">
        <!-- id: {{ i.id }}<br> -->
        <!-- key: {{ i.key }}<br> -->
        <nuxt-link :to="i.slug">{{ i.title }}</nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      releases () {
        return this.$store.getters.loadedReleases
      }
    },
    head: {
      title: 'Releases 2',
      meta: [
        { name: 'description', content: 'Releases 2 of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/home.jpg' }
      ]
    }
  }
</script>

<style lang="scss">
  @import '../assets/scss/page';
  @import '../assets/scss/item';
  @import '../assets/scss/list';

  .releases {
    @extend .page;
    max-width: 1278px;
    margin: 0 auto;
  }
</style>
