<template>
  <ul>
    <li v-for="i in releases" :key="i.slug">
      <router-link :to="'/release/' + i.slug + '/'">
        {{ i.title }}
      </router-link>
    </li>
  </ul>
</template>

<script>
  import fetch from 'isomorphic-fetch'

  export default {
    async asyncData() {
      const response = await fetch('https://sentimony-db.firebaseio.com/releases.json')
      const releases = await response.json()
      return { releases }
    }
  }
</script>

<style>

</style>
