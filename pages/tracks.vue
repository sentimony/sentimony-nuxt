<template>
  <div class="tracks">
    <h1>Tracks</h1>
    <ol class="" style="width: 500px; display: inline-block; text-align: left">
      <li
        class=""
        style=""
        v-for="(i, index) in sortByDate"
        :key="index"
        v-if="i.visible"
      >
        <div>
          <div v-if="i.title" class="" style="margin-bottom: 20px">
            {{ i.title }}
          </div>

          <div v-if="i.tracklistCompact" class="" style="margin-bottom: 20px">
            <div
              v-for="(iii, index) in i.tracklistCompact"
              :key="'b' + index"
              v-html="iii.p"
            />
          </div>
        </div>
      </li>
    </ol>
  </div>
</template>

<script>
  import axios from '@/plugins/axios'
  import sortBy from 'lodash/sortBy'

  export default {
    async asyncData() {
      const { data } = await axios.get('releases.json')
      return { releases: data }
    },
    computed: {
      sortByDate() {
        return sortBy(this.releases, 'date').reverse().reverse()
      }
    },
    head: {
      title: 'Tracks',
      meta: [
        { name: 'description', content: 'Tracks of Sentimony Records' },
        {
          property: 'og:image',
          content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-releases.jpg?01'
        }
      ]
    }
  }
</script>

<style lang="scss">
  @use '@/assets/scss/page';
  // @use '@/assets/scss/item';
  // @use '@/assets/scss/list';

  .tracks {
    @extend .page;
    max-width: 1278px;
    margin: 0 auto;
  }
</style>
