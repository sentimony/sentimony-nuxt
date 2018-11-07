<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else-if="typeStore.frames">
      <div>
        <span
          v-for="(i, index) in typeStore.frames"
          :key="i.title"
          @click="chooseFrame(index)"
          class="mytab"
          :class="{isActive : currentFrameStore == index}"
        >
          {{ i.title }}
        </span>
      </div>
      <div class="mytab__content">
        <div :class="'mytab__content__frame-holder mytab__content__frame-holder--' + typeStore.frames[currentFrameStore].title">
          <iframe
            :class="'mytab__content__frame-holder__iframe tracks-' + typeStore.tracks_number"
            :src="typeStore.frames[currentFrameStore].frame"
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
      // releaseStore () {
      //   return this.$store.getters.loadedRelease(this.$route.params.key)
      // },
      currentFrameStore () {
        return this.$store.getters.currentFrame
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

  .mytab {
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

          & .mytab__content__frame-holder__iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
        }
        &--Spotify {
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
      }
    }
  }
</style>
