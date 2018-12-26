<template>
  <section>
    <meta
      v-if="redirect"
      http-equiv="refresh"
      :content="'0; URL=' + release.links.spotify"
    />
    <div class="anim">
      <img
        :src="'https://content.sentimony.com/assets/img/releases/small/' + release.cat_no + '/' + release.slug +'.jpg'"
        :srcset="'https://content.sentimony.com/assets/img/releases/small/' + release.cat_no + '/' + release.slug +'.jpg 1x, https://content.sentimony.com/assets/img/releases/small-retina/' + release.cat_no + '/' + release.slug +'.jpg 2x'"
        :alt="release.title"
      />
    </div>
    <h1>{{ release.title }} on Spotify</h1>
    <div class="text">
      Redirecting . . .
      <span v-if="!redirect">{{ counter }} sec</span>
    </div>
  </section>
</template>


<script>
  import axios from '~/plugins/axios'

  export default {
    layout: 'double-redirect',
    data () {
      return {
        counter: 4,
        redirect: false
      }
    },
    async asyncData({ route }) {
      const { key } = route.params
      const { data } = await axios.get(`releases/${key}.json`)
      return { release: data }
    },
    methods: {
      timeout() {
        setTimeout( ()=> {
           this.redirect = true
        }, 4000)
      },
      interval() {
        setInterval(() => {
          this.counter--
        }, 1000)
      }
    },
    mounted() {
      this.timeout()
      this.interval()
    },
    head () {
      return {
        title: this.release.title + ' on Spotify',
        meta: [
          { name: 'description', content: this.release.tracks_number + ' tracks ' + this.release.style + ' ' + this.release.format + ', ' + this.release.date.split('-')[0] },
          { property: 'og:image', content: 'https://content.sentimony.com/assets/img/releases/og-images/' + this.release.cat_no + '/' + this.release.slug + '.jpg' }
        ]
      }
    }
  }
</script>

<style lang="scss">
</style>
