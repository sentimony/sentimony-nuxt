<template>
  <div class="releases">
    <h1>Pages</h1>
    <div class="list">
      <!-- <div class="item">
        Release Title Static
      </div> -->
      <div v-if="loading">loading...</div>
      <div v-else v-for="i in pages" :key="i.id" class="item">
        <!-- id: {{ i.id }}<br>
        key: {{ i.key }}<br>
        title:  -->
        {{ i.title }}
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
      pages () {
        return this.$store.getters.loadedPages
      }
    },
    head: {
      title: 'Pages',
      meta: [
        { name: 'description', content: 'Pages of Sentimony Records' },
        { property: 'og:image', content: 'https://firebasestorage.googleapis.com/v0/b/sentimony-db.appspot.com/o/og%2Fog-default.jpg?alt=media&token=85a8d7a3-ab49-4cff-9df9-fd3e2478e780' }
      ]
    }
  }
</script>

<style lang="scss">
</style>
