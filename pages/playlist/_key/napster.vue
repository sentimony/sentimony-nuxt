<template>
  <section>
    <ddos-guard
      :item="playlist"
      :title="title"
      :link="playlist.links.napster"
    />
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
        title: 'Napster'
      }
    },
    async asyncData({ route }) {
      const { key } = route.params
      const { data } = await axios.get(`playlists/${key}.json`)
      return { playlist: data }
    },
    head () {
      return {
        title: this.playlist.title + ' on ' + this.title,
        meta: [
          // { name: 'description', content: this.playlist.tracks_number + ' tracks ' + this.playlist.style + ' ' + this.playlist.format + ', ' + this.playlist.date.split('-')[0] },
          { property: 'og:image', content: 'https://content.sentimony.com/assets/img/playlists/og-images/' + this.playlist.slug + '.jpg' }
        ]
      }
    }
  }
</script>

<style lang="scss">
</style>
