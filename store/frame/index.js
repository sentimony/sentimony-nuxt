export default {

  state: {
    currentFrame: 0
  },

  mutations: {
    updateGameData (state, payload) {
      state.currentFrame = payload
    }
  },

  actions: {
    updateCurrentFrame ({commit}, payload) {
      commit('updateGameData', payload)
    }
  },

  getters: {
    currentFrame (state) {
      return state.currentFrame
    }
  }

}
