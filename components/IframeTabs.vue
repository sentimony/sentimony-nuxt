<template>
  <div class="IframeTabs">
    <div v-if="one" class="d-flex">
      <a
        v-for="(i, index) in one"
        :key="index"
        v-if="i !== ''"
        @click="chooseFrame(index)"
        style="background:rgba(204,204,204,.4);opacity:.5;"
        class="px-2 py-3 mr-2 d-flex pointer rounded-t-lg"
        :class="{ isActive: currentFrame === index }"
        v-ripple
      >
        <img
          :src="'https://content.sentimony.com/assets/img/svg-icons/' + icon(i) + '.svg?01'"
          style="width:20px;height:20px;"
          class="mr-1"
        />
        <span
          style="line-height:20px"
          v-html="title(i)"
          class="text-body-2"
        ></span>
      </a>
    </div>

    <div
      style="background:rgba(204,204,204,.4);"
      class="pa-2 rounded-b-lg rounded-tr-lg"
    >
      <div
        style="background:rgba(204,204,204,.4);"
        :class="'IframeTabs__player IframeTabs__player-' + icon(currentContent)"
      >
        <iframe
          v-if="currentContent"
          class="d-block"
          :src="frame(currentContent)"
          width="100"
          height="450"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, watch } from '@nuxtjs/composition-api'
  import { useFrameStore } from '@/stores/tabs.ts'

  // Props
  const props = defineProps({
    one: {
      type: Array,
      required: true
    }
  })

  // Store
  const frameStore = useFrameStore()

  // Поточне значення індексу
  const currentFrame = computed(() => frameStore.currentFrame)

  // Поточний елемент з `one` (playlist ID)
  const currentContent = computed(() => props.one?.[currentFrame.value] || '')

  // Метод вибору фрейму
  function chooseFrame(index) {
    frameStore.updateCurrentFrame(index)
  }

  // Хелпери
  function icon(content) {
    if (!content) return ''
    if (content.length === 72) return 'youtube'
    if (content.length >= 6 && content.length <= 10) return 'soundcloud'
    return ''
  }

  function title(content) {
    if (!content) return ''
    if (content.length === 72) return 'YouTube'
    if (content.length >= 6 && content.length <= 10) return 'SoundCloud'
    return ''
  }

  function frame(content) {
    if (!content) return ''
    if (content.length === 72) {
      const match = content.match(/\=(.*)/)
      const contentId = match ? match[1] : ''
      return 'https://www.youtube.com/embed/videoseries?list=' + contentId
    }
    if (content.length >= 6 && content.length <= 10) {
      return `https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/${content}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=true&show_user=false&show_reposts=true&show_teaser=false`
    }
    return ''
  }
</script>

<style lang="scss">
  // @use '@/assets/scss/coriolanMedia' as media;
  @use '@/assets/scss/coriolanRatio' as ratio;
  @use '@/assets/scss/iframe-size';

  .IframeTabs {

    & a.isActive {
      opacity: 1!important;
    }

    &__player {
      @extend .sentimony-iframe;

      &-youtube {
        @include ratio.ratio(100%,16,9);

        & iframe {
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
    }
  }
</style>
