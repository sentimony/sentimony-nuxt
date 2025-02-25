<template>
  <section>
    <div v-if="release.links.bandcamp24_url.includes('redirect_to_16')">
      <ddos-guard
        :item="release"
        :title="title"
        :link="release.links.bandcamp_url"
      />
    </div>
    <div v-if="release.links.bandcamp24_url.includes('.bandcamp.') || release.links.bandcamp24_url == ''">
      <ddos-guard
        :item="release"
        :title="title"
        :link="release.links.bandcamp24_url"
      />
    </div>
  </section>
</template>

<script>
  import DdosGuard from '~/components/DdosGuard.vue'
  import axios from '~/plugins/axios'

  export default {
    layout: 'ddos-guard',
    components: { DdosGuard },
    data () {
      return {
        title: 'Bandcamp'
      }
    },
    async asyncData({ route }) {
      const { key } = route.params
      const { data } = await axios.get(`releases/${key}.json`)
      return { release: data }
    },
    head () {
      return {
        title: this.release.title + ' on ' + this.title,
        meta: [
          { name: 'description', content: this.release.tracks_number + ' tracks ' + this.release.style + ' ' + this.release.format + ', ' + this.release.date.split('-')[0] },
          { property: 'og:image', content: 'https://content.sentimony.com/assets/img/releases/og-images/' + this.release.slug + '.jpg' }
        ]
      }
    }
  }
</script>

<style lang="scss">
</style>
