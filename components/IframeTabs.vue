<template>
  <div class="IframeTabs">
    <!-- <div>sidebarOpen: {{ this.$store.state.mobmenu.sidebarOpen }}</div> -->
    <div>currentFrame: {{ this.$store.state.tabs.currentFrame }}</div>
    <div v-if="one" class="d-flex">
      <a
        v-for="(i, index) in one"
        :key="index"
        v-if="i !== ''"
        @click="chooseFrame(index)"
        style="background:rgba(204,204,204,.4);"
        class="px-2 py-3 mr-2 d-flex pointer rounded-t-lg"
        :class="{ isActive : currentFrameStore == index }"
      >
        <img :src="'https://content.sentimony.com/assets/img/svg-icons/' + icon(i) + '.svg?01'"
          style="width:20px;height:20px;"
          class="mr-1"
        />
        <span style="line-height:20px"
          v-html="title(i)"
          class="text-body-2"
        ></span>
      </a>
      <!-- <div>{{ title }}</div> -->
    </div>
    <!-- <div>{{ content }}</div>
    <br> -->
    <div
      style="background:rgba(204,204,204,.4);"
      class="pa-2 rounded-b-lg rounded-tr-lg"
    >
      <iframe v-if="content"
        class="d-block"
        :src="frame(content)" width="100" height="450"
      />
    </div>
  </div>
</template>

<script>
  export default {
    props: ['one'],
    data () {
      return {
        // title: '',
        content: this.one[0],
        // isActive: false,
      }
    },
    computed: {
      // loading () {
      //   return this.$store.getters.loading
      // },
      currentFrameStore () {
        return this.$store.getters.currentFrame
      }
    },
    methods: {
      icon(content) {
        if (content.length == 72) {
          return 'youtube'
        }
        if (content.length == 6 || content.length == 7 || content.length == 8 || content.length == 9 || content.length == 10) {
          return 'soundcloud'
        }
      },
      title(content) {
        if (content.length == 72) {
          return 'YouTube'
        }
        if (content.length == 6 || content.length == 7 || content.length == 8 || content.length == 9 || content.length == 10) {
          return 'SoundCloud'
        }
      },
      frame(content) {
        // if (this.content.length == 14 || this.content.length == 15 || this.content.length == 16) {
        //   return 'https://bandcamp.com/EmbeddedPlayer/' + this.content + '/size=large/bgcol=ffffff/linkcol=0687f5/artwork=false/transparent=true/'
        // }
        // if (this.content.length == 22) {
        //   return 'https://open.spotify.com/embed?uri=spotify:album:' + this.content
        // }
        if (content.length == 72) {
          const content2 = content.match(/\=(.*)/)[1]
          // const tag = response.data.FE.match(/(.*) /)[1]
          // this.title = 'YouTube'
          // return 'https://www.youtube.com/embed/videoseries?list=' + content2
          return 'https://www.youtube.com/embed/videoseries?list=' + content2
        }
        if (content.length == 6 || content.length == 7 || content.length == 8 || content.length == 9 || content.length == 10) {
          // this.title = 'SoundCloud'
          return 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/' + content + '&color=%23ff5500&auto_play=false&hide_related=true&show_comments=true&show_user=false&show_reposts=true&show_teaser=false'
        }
        // return content
      },
      chooseFrame (index) {
        // this.isActive = !this.isActive
        this.selected == index
        this.content = this.one[index]
        this.$store.dispatch('updateCurrentFrame', index)
      }
    }
  }
</script>

<style lang="scss">
  .IframeTabs a.isActive { background-color: red!important; }
</style>
