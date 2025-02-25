<template>
  <div class="tracks">
    <h1>Tracks</h1>
    <ol class="" style="width: 500px; display: inline-block; text-align: left">
      <li class="" style=""
        v-for="(i, index) in sortByDate"
        :key="index"
         v-if="i.visible"
      >
        <div>
          
          <div v-if="i.title" class="" style="margin-bottom: 20px">{{ i.title }}</div>
          
          <div v-if="i.tracklist" class="" style="margin-bottom: 20px">
            <div v-for="(ii, index) in i.tracklist.tracks" :key="'b' + index">
              <div class="">
              {{ index + 1 }}
              {{ ii.artist }} -
              {{ ii.title }}
              </div>
            </div>
          </div>

          <div v-if="i.tracklistCompact" class="" style="margin-bottom: 20px">
            <div v-for="(iii, index) in i.tracklistCompact" :key="'b' + index" v-html="iii.p"/>
          </div>

      </div>
    </li>
    </ol>
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
        return sortBy(this.releases, 'date').reverse().reverse()
      }
    },
    // filters: {
    //   year (date) {
    //     return date.split('-')[0]
    //   }
    // },
    head: {
      title: 'Releases',
      meta: [
        { name: 'description', content: 'Tracks of Sentimony Records' },
        { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-releases.jpg' }
      ]
    }
  }
</script>

<style lang="scss">
  @import '../assets/scss/page';
  // @import '../assets/scss/item';
  // @import '../assets/scss/list';

  .releases {
    @extend .page;
    max-width: 1278px;
    margin: 0 auto;
  }
</style>
