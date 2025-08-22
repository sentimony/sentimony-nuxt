<template>
  <div class="page">

    <h1>Tracks</h1>
    
    <ol style="width: 500px;display: inline-block;text-align: left;">
      <div
        v-for="(i, index) in sortByDate"
        :key="index"
        v-if="i.visible"
      >
        <div v-if="i.title" style="margin-bottom: 20px;">
          <img v-if="i.cover_th" :src="i.cover_th" :alt="i.title" style="width: 20px;margin-right: 6px;vertical-align: text-top;"/>
          <span>{{ i.title }}</span>
        </div>

        <div v-if="i.tracklistCompact" style="margin-bottom: 20px;">
          <li
            v-for="(iii, index) in i.tracklistCompact"
            :key="'b' + index"
            v-if="i.tracklistCompact"
            v-html="iii.p"
          />
        </div>
      </div>
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
      return sortBy(this.releases, 'date').reverse()
    }
  },
  head: {
    title: 'Tracks',
    meta: [
      { name: 'description', content: 'Tracks of Sentimony Records' },
      { property: 'og:image', content: 'https://content.sentimony.com/assets/img/og-images/sentimony/og-releases.jpg?01' }
    ]
  }
}
</script>

<style lang="scss"></style>
