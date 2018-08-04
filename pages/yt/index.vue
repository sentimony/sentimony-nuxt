<template>
  <div class="youtubes">
    <h1>YouTube</h1>
    <div>
      <div v-for="i in sortByDate" v-if="!i.coming_soon">
        <span>{{ i.upc }} | </span>
        <router-link v-ripple :to="'/yt/' + i.slug + '/'">
          <span style="text-transform:uppercase;">{{ i.cat_no }}:</span>
          {{ i.title }}
          <!-- <span v-if="i.format == 'EP'">{{ i.format }}</span> -->
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from '~/plugins/axios'
  import sortBy from 'lodash/sortBy'

  export default {
    async asyncData() {
      const { data } = await axios.get('releases.json')
      return { releases: data }
    },
    computed: {
      sortByDate () {
        return sortBy(this.releases, 'date').reverse()
      }
    },
    head: {
      title: 'For YouTube',
      meta: [
        { name: 'description', content: 'For YouTube of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/home.jpg' }
      ]
    }
  }
</script>

<style lang="scss">
  .youtubes {
    padding: 2em 0;
    max-width: 500px;
    margin: 0 auto;
    font-size: 14px;
    line-height: 1.4;
    text-align: left;
    font-family: Roboto, Arial, sans-serif;
    font-weight: 400;
  }
</style>
