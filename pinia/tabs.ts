import { defineStore } from 'pinia'

export const useFrameStore = defineStore('frame', {
  state: () => ({
    currentFrame: 0
  }),

  actions: {
    updateCurrentFrame(payload) {
      this.currentFrame = payload
    }
  }
})