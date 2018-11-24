<template>
  <div class="youtube-page-item">

    <router-link v-ripple to="/yt">Back to YT page</router-link><br>
    <br>
    <iframe
      v-if="release.links.youtube_playlist_id"
      :src="'https://www.youtube.com/embed/videoseries?list=' + release.links.youtube_playlist_id"
      :title="release.title + ' YouTube Iframe'"
    ></iframe>
    <br>
    Bandcamp (FREE DOWNLOAD or donate): http://bit.ly/{{ release.cat_no }}-bandcamp<br>
    iTunes: http://bit.ly/{{ release.cat_no }}-itunes<br>
    GooglePlay: http://bit.ly/{{ release.cat_no }}-google<br>
    Beatport: http://bit.ly/{{ release.cat_no }}-beatport<br>
    Spotify: http://bit.ly/{{ release.cat_no }}-spotify<br>
    Official release page: http://bit.ly/{{ release.cat_no }}<br>
    <br>
    <span style="text-transform:uppercase;">{{ release.cat_no }}: </span>
    <span>{{ release.title }}</span>
    (Sentimony Records, {{ release.date | formatDate }})<br>
    <br>
    <span v-for="i in release.tracklist.tracks">
      <!-- <span>{{ i.cue_time }} ► </span> -->
      <span>{{ i.number }}. </span>
      <span>{{ i.artist }} - </span>
      <span>{{ i.title }} | </span>
      <span>{{ i.bpm }}bpm</span><br>
    </span>
    <span v-if="release.tracklist.note" v-html="release.tracklist.note"></span>
    <br v-if="release.tracklist.note">
    <br>

    <span v-if="release.credits.written_and_prodused_by" v-html="'Written & Prodused By ' + release.credits.written_and_prodused_by"></span>
    <br v-if="release.credits.written_and_prodused_by">
    <span v-if="release.credits.compiled_by" v-html="'Compiled By ' + release.credits.compiled_by"></span>
    <br v-if="release.credits.compiled_by">
    <span v-if="release.credits.artwork_by" v-html="'Artwork By ' + release.credits.artwork_by"></span>
    <br v-if="release.credits.artwork_by">
    <span v-if="release.credits.mastered_by" v-html="'Mastered By ' + release.credits.mastered_by"></span>
    <br v-if="release.credits.mastered_by">
    <span v-if="release.credits.mixed_and_mastered_by" v-html="'Mixed & Mastered By ' + release.credits.mixed_and_mastered_by"></span>
    <br v-if="release.credits.mixed_and_mastered_by">

    <br>
    ===<br>
    <br>
    Recently all Sentimony Records releases available for FREE DOWNLOAD at Bandcamp.<br>
    Donations are very welcome! It is not an easy mission to keep the free music flowing.<br>
    <br>
    Also we will be grateful for your feedback via COMMENTS on youtube and our website https://sentimony.com<br>
    Huge Thanks for Support!<br>
    <br>
    ===<br>
    <br>
    Sentimony Records is an independent record label started in Kyiv, Ukraine during the autumn 2006 by Ihor Orlovskyi also known as Irukanji.<br>
    The main label's mission is to contribute the growth of the psychedelic chillout and trance scenes.<br>
    <br>
    Follow Sentimony:<br>
    Bandcamp: https://sentimony.bandcamp.com<br>
    Beatport: http://bit.ly/beatport-sentimony<br>
    YouTube: http://bit.ly/youtube-sentimony<br>
    Facebook: http://bit.ly/facebook-sentimony<br>
    SoundCloud https://soundcloud.com/sentimony<br>
    Twitter: https://twitter.com/sentimony<br>
    GooglePlus: http://bit.ly/googleplus-sentimomy<br>

  </div>
</template>

<script>
  import axios from '~/plugins/axios'

  export default {
    async asyncData({ route }) {
      const { key } = route.params
      const { data } = await axios.get(`releases/${key}.json`)
      return { release: data }
    },
    filters: {
      formatDate: function (date) {
        var moment = require('moment');
        if (date) {
          return moment(String(date)).format('YYYY');
        }
      },
      spotifyEmbed (spotify) {
        if (spotify) {
          let s = spotify.replace('https://open.spotify.com/album/', '');
          return 'https://open.spotify.com/embed?uri=spotify:album:' + s + '&theme=white';
        }
      }
    },
    head () {
      return {
        title: this.release.title,
        meta: [
          { name: 'description', content: this.release.tracks_number + ' tracks ' + this.release.style + ' ' + this.release.format + ', ' + this.release.date.split('-')[0] },
          { property: 'og:image', content: 'https://content.sentimony.com/assets/img/releases/og-images/' + this.release.cat_no + '/' + this.release.slug + '.jpg' }
        ]
      }
    }
  }
</script>

<style lang="scss">
  .youtube-page-item {
    padding: 2em 0;
    max-width: 400px;
    margin: 0 auto;
    font-size: 12px;
    line-height: 1.2;
    text-align: left;
    font-family: Roboto, Arial, sans-serif;
    font-weight: 400;
  }
</style>
