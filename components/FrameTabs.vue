<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="typeStore.frames">
      <div
        v-for="(i, index) in typeStore.frames"
        :key="i.title"
        @click="chooseFrame(index)"
        class="frame-tab"
        :class="{isActive : currentFrameStore == index}"
      >
        {{ i.title | filteredTitle }}
      </div>
      <div class="frame-tab__content">
        <div :class="'frame-tab__content__frame-holder frame-tab__content__frame-holder--' + typeStore.frames[currentFrameStore].title">
          <iframe
            :class="'frame-tab__content__frame-holder__iframe tracks-' + typeStore.tracks_number"
            :src="typeStore.frames[currentFrameStore].frame | filteredFrame"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    props: [
      'typeStore'
    ],
    computed: {
      loading () {
        return this.$store.getters.loading
      },
      currentFrameStore () {
        return this.$store.getters.currentFrame
      }
    },
    filters: {
      filteredTitle (title) {
        if (title == 'Spotify') {
          return title + 'Spotify'
        }
        return title + '112'
      },
      filteredFrame (frame) {
        if (frame.length == 10) {
          return 'https://bandcamp.com/EmbeddedPlayer/album=' + frame + '/size=large/bgcol=ffffff/linkcol=0687f5/artwork=small/transparent=true/'
        }
        if (frame.length == 22) {
          return 'https://open.spotify.com/embed?uri=spotify:album:' + frame
        }
        if (frame.length == 34) {
          return 'https://www.youtube.com/embed/videoseries?list=' + frame
        }
        if (frame.length == 6 || frame.length == 7 || frame.length == 8 || frame.length == 9) {
          return 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/users/' + frame + '&color=00aabb&hide_related=true&show_comments=true&show_user=false&sharing=false&show_bpm=true'
        }
        return frame
      }
    },
    methods: {
      chooseFrame (index) {
        this.selected == index
        this.$store.dispatch('updateCurrentFrame', index)
      }
    }
  }
</script>

<style lang="scss">
  @import '../assets/scss/variables';
  @import '../node_modules/coriolan-ui/mixins/ratio';

  .frame-tab {
    cursor: pointer;
    font-size: 12px;
    opacity: .5;
    padding: 0 .8em;
    background-color: rgba(204, 204, 204, .4);
    margin-left: .4em;
    border-radius: 6px 6px 0 0;
    line-height: 48px;
    display: inline-block;

    &:first-child {
      margin-left: 0;
    }

    &.isActive {
      opacity: 1;
    }

    &__content {
      padding: .8em;
      background-color: rgba(204, 204, 204, .4);
      border-radius: 0 9px 9px 9px;

      &__frame-holder {
        border-radius: 6px;
        overflow: hidden;
        box-shadow: $shadow;
        background-color: $colorBgBlack;

        &__iframe {
          display: block;
          border: 0;
        }

        &--Bandcamp {
          & .tracks- {
            &4 {height: 274px;}
            &5 {height: 307px;}
            &7 {height: 373px;}
            &9 {height: 439px;}
            &10 {height: 472px;}
            &11 {height: 505px;}
            &12 {height: 538px;}
          }
        }
        &--YouTube {
          @include ratio(100%,16,9);

          & .frame-tab__content__frame-holder__iframe {
            border-radius: 6px;
            border: none;
            position: absolute;
            top: 0;
            left: 0;
            width: 143%;
            height: 143%;
            transform: scale(.7);
            transform-origin: top left;
          }
        }
        &--Spotify {
          & .tracks- {
            &4 {height: 212px;}
            &5 {height: 307px;}
            &7 {height: 373px;}
            &9 {height: 439px;}
            &10 {height: 472px;}
            &11 {height: 505px;}
            &12 {height: 538px;}
          }
        }
        &--SoundCloud {
          & iframe {height: 500px;}
        }
      }
    }
  }
</style>
