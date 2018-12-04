<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="typeStore.frames">
      <div class="frame-tab__tabs">
        <div
          v-for="(i, index) in typeStore.frames"
          :key="i.title"
          @click="chooseFrame(index)"
          class="frame-tab__tabs__item"
          :class="{isActive : currentFrameStore == index}"
        >
          <div :class="'frame-tab__tabs__item__icon frame-tab__tabs__item__icon--' + i.title"/>
          <div class="frame-tab__tabs__item__title" v-html="i.title"/>
        </div>
      </div>
      <div class="frame-tab__content">
        <div :class="'frame-tab__content__frame-holder frame-tab__content__frame-holder--' + typeStore.frames[currentFrameStore].title">
          <iframe
            :class="'frame-tab__content__frame-holder__iframe tracks-' + typeStore.tracks_number"
            :src="typeStore.frames[currentFrameStore].frame | filteredFrameByLength"
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
      filteredFrameByLength (frame) {
        if (frame.length == 14 || frame.length == 15 || frame.length == 16) {
          return 'https://bandcamp.com/EmbeddedPlayer/' + frame + '/size=large/bgcol=ffffff/linkcol=0687f5/artwork=false/transparent=true/'
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
    // display: inline-block;
    // line-height: 40px;
    // justify-content: flex-start;

    &__tabs {
      display: flex;
      // align-items: center;
      // flex-direction: row;

      &__item {
        cursor: pointer;
        opacity: .5;
        padding: 14px .8em;
        background-color: rgba(204, 204, 204, .4);
        margin-left: .4em;
        border-radius: 6px 6px 0 0;
        display: flex;
        align-items: center;

        &:first-child {
          margin-left: 0;
        }

        &.isActive {
          opacity: 1;
        }

        &__icon {
          width: 20px;
          height: 20px;
          margin-right: 6px;
          background-repeat: no-repeat;
          background-size: cover;

          &--Bandcamp {background-image: url(https://content.sentimony.com/assets/img/svg-icons/bandcamp.svg);}
          &--YouTube {background-image: url(https://content.sentimony.com/assets/img/svg-icons/youtube.svg);}
          &--Spotify {background-image: url(https://content.sentimony.com/assets/img/svg-icons/spotify.svg);}
          &--SoundCloud {background-image: url(https://content.sentimony.com/assets/img/svg-icons/soundcloud.svg);}
        }

        &__title {
          font-size: 12px;
        }
      }
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
            width: 100%;
            height: 100%;
            // width: 143%;
            // height: 143%;
            // transform: scale(.7);
            // transform-origin: top left;
          }
        }
        &--Spotify {
          & .tracks- {
            &4 {height: 212px;}
            &5 {height: 245px;}
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
