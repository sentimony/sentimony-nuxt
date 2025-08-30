<template>
  <div
    ref="box"
    :class="{ AppPlayerDraggable: true, isShown, isDragging }"
    @mousedown="startDragMouse"
    @touchstart="startDragTouch"
    :style="{ bottom: position.bottom, right: position.right }"
  >
    <div class="AppPlayerDraggable__YouTubePlayer">
      <transition v-if="isDragging" name="fade">
        <div class="AppPlayerDraggable__TechnicalLayer">
          Push me<br>
          And then just touch me<br>
          'Til I can get my<br>
          Satisfaction<br>
        </div>
      </transition>
      <client-only>
        <iframe
          :class="{ AppPlayerDraggable__YouTubePlayerIframe: true, isDragging }"
          :src=" 'https://www.youtube-nocookie.com/embed/videoseries?list=' + youtube_playlist_id + '&autoplay=1&mute=1&loop=1'"
          title="'YouTube video player'"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
        />
      </client-only>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    youtube_playlist_id: 'PLp2GaPnw5O3PoanCB55pDHe0u5t1kXXLY',
    isDragging: false,
    position: { right: '0%', bottom: '0%' },
    offset: { x: 0, y: 0 },
    boxSize: { width: 0, height: 0 },
    isShown: false
  }),
  mounted() {
    this.setInitialPosition()
    this.updateBoxSize()
    window.addEventListener('resize', this.updateBoxSize)
    setTimeout(() => {
      this.isShown = true
    }, 1000)
  },
  beforeDestroy() {
    document.removeEventListener('mousemove', this.onDragMouse)
    document.removeEventListener('mouseup', this.stopDragMouse)
    document.removeEventListener('touchmove', this.onDragTouch)
    document.removeEventListener('touchend', this.stopDragTouch)
    window.removeEventListener('resize', this.updateBoxSize)
  },
  methods: {
    setInitialPosition() {
      const isMobile = window.innerWidth < 768
      this.position = isMobile
        ? { right: '0%', bottom: '0%' }
        : { right: '4%', bottom: '45%' }
    },

    updateBoxSize() {
      this.boxSize.width = this.$refs.box.offsetWidth
      this.boxSize.height = this.$refs.box.offsetHeight
    },

    // 🖱 Mouse
    startDragMouse(e) {
      this.isDragging = true
      const box = this.$refs.box.getBoundingClientRect()
      this.offset.x = e.clientX - box.left
      this.offset.y = e.clientY - box.top
      document.addEventListener('mousemove', this.onDragMouse)
      document.addEventListener('mouseup', this.stopDragMouse)
    },
    onDragMouse(e) {
      if (!this.isDragging) return
      const left = e.clientX - this.offset.x
      const top = e.clientY - this.offset.y
      this.setPositionFromTopLeft(left, top)
    },
    stopDragMouse() {
      this.isDragging = false
      document.removeEventListener('mousemove', this.onDragMouse)
      document.removeEventListener('mouseup', this.stopDragMouse)
    },

    // 📱 Touch
    startDragTouch(e) {
      if (e.touches.length !== 1) return
      this.isDragging = true
      const touch = e.touches[0]
      const box = this.$refs.box.getBoundingClientRect()
      this.offset.x = touch.clientX - box.left
      this.offset.y = touch.clientY - box.top
      document.addEventListener('touchmove', this.onDragTouch, {
        passive: false
      })
      document.addEventListener('touchend', this.stopDragTouch)
    },
    onDragTouch(e) {
      if (!this.isDragging) return
      e.preventDefault()
      const touch = e.touches[0]
      const left = touch.clientX - this.offset.x
      const top = touch.clientY - this.offset.y
      this.setPositionFromTopLeft(left, top)
    },
    stopDragTouch() {
      this.isDragging = false
      document.removeEventListener('touchmove', this.onDragTouch)
      document.removeEventListener('touchend', this.stopDragTouch)
    },

    // 🔁 Обчислення right/bottom у %
    setPositionFromTopLeft(leftPx, topPx) {
      const maxLeft = window.innerWidth - this.boxSize.width
      const maxTop = window.innerHeight - this.boxSize.height

      const clampedLeft = Math.max(0, Math.min(leftPx, maxLeft))
      const clampedTop = Math.max(0, Math.min(topPx, maxTop))

      const rightPx = window.innerWidth - clampedLeft - this.boxSize.width
      const bottomPx = window.innerHeight - clampedTop - this.boxSize.height

      const rightPercent = (rightPx / window.innerWidth) * 100
      const bottomPercent = (bottomPx / window.innerHeight) * 100

      this.position.right = `${rightPercent.toFixed(2)}%`
      this.position.bottom = `${bottomPercent.toFixed(2)}%`
    }
  }
}
</script>

<style lang="scss">
@use '@/assets/scss/page';
@use '@/assets/scss/coriolanRatio' as ratio;
@use '@/assets/scss/iframe-size';

.AppPlayerDraggable {
  color: #fff;
  position: fixed;
  width: 100%;
  max-width: 430px;
  // cursor: move;
  user-select: none;
  touch-action: none;
  z-index: 800;
  padding: 12px;
  background-color: rgba(#ccc, 0.4);
  // background-color: #ac5c58;
  border-radius: 9px;
  box-shadow: 0 2px 10px 0 rgba(#000, 0.5);
  // box-shadow: none;
  // cursor: grab;
  cursor: move;
  box-sizing: border-box;
  opacity: 0;
  filter: blur(4px);
  backdrop-filter: blur(2px);
  transition: opacity 0.4s ease, filter 0.4s ease, backdrop-filter 0.4s ease;

  &.isShown {
    opacity: 1;
    filter: blur(0px);
  }

  &.isDragging {
    backdrop-filter: blur(4px);
  }

  &__TechnicalLayer {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(#ccc, 0.4);
    z-index: 960;
    // cursor: grab;
    text-shadow: 0px 0px 1px rgba(#000, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    // font-size: 30px;
    // color: #000;
    // text-transform: uppercase;
    text-align: left;
    font-weight: 900;
  }

  &__YouTubePlayer {
    width: 100%;
    max-width: 420px;
    margin: 0 auto;
    box-sizing: border-box;
    position: relative;
    // color: #fff;
    @include ratio.ratio(100%, 16, 9);
    @extend .sentimony-iframe;
    // box-shadow: none;
    // transform: translateY(50%);

    &Iframe {
      border-radius: 6px;
      border: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 143%;
      height: 143%;
      transform: scale(0.7);
      transform-origin: top left;
      opacity: 1;
      filter: blur(0px);
      transition: opacity 0.4s ease, filter 0.4s ease;

      &.isDragging {
        opacity: 0.4;
        filter: blur(4px);
      }
    }
  }
}
</style>
