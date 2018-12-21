<template>
  <h1>{{ release.title }}</h1>
  <!-- <h1>1</h1> -->
</template>

<script>
  import fetch from 'isomorphic-fetch'

  export default {
    async asyncData({ route }) {
      const { key } = route.params
      const response = await fetch('https://sentimony-db.firebaseio.com/releases/' + key + '.json')
      const release = await response.json()
      return { release }
    }
  }
</script>

<style lang="scss">
</style>
