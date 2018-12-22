<template>
  <div>
    <h2 class="headline">Rendered From:<span class="render-result">{{renderSource}}</span></h2>
    <ul>
      <li v-for="i in releases" :key="i.slug">
        <router-link :to="'/release/' + i.slug + '/'">
          {{ i.title }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
  import fetch from 'isomorphic-fetch'

  export default {
    async asyncData() {
      const response = await fetch('https://sentimony-db.firebaseio.com/releases.json')
      const releases = await response.json()
      return {
        releases,
        renderSource: process.static ? 'static' : (process.server ? 'server' : 'client')
      }
    }
  }
</script>

<style>
</style>
