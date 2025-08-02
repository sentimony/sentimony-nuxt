<template>
  <section>
    <ddos-guard
      :item="release"
      :title="title"
      :link="release.links.youtube | YouTubeFullReleases"
    />
  </section>
</template>

<script>
  import DdosGuard from '@/components/DdosGuard.vue'
  import axios from '@/plugins/axios'

  export default {
    layout: 'ddos-guard',
    components: { DdosGuard },
    data() {
      return {
        title: 'YouTube'
      }
    },
    async asyncData({ route }) {
      const { key } = route.params
      const { data } = await axios.get(`releases/${key}.json`)
      return { release: data }
    },
    filters: {
      YouTubeFullReleases (youtube) {
        let y = youtube.replace('https://youtu.be/', '');
        if (youtube) {
          return 'https://www.youtube.com/watch?v=' + y + '&list=PLp2GaPnw5O3Nhkwv3hkb1imrT6JNURnkU';
        } else {
          return y
        }
      }
    },
    head() {
      return {
        title: this.release.title + ' on ' + this.title,
        meta: [
          { name: 'description', content: this.release.tracks_number + ' tracks ' + this.release.style + ' ' + this.release.format + ', ' + this.release.date.split('-')[0] },
          { property: 'og:image', content: 'https://content.sentimony.com/assets/img/releases/og-images/' + this.release.slug + '.jpg?01' }
        ]
      }
    }
  }
</script>

<style lang="scss"></style>
