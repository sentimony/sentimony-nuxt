export default {

  state: {
    currentFrame: 0
  },

  mutations: {
    updateCurrentFrame (state, payload) {
      state.currentFrame = payload
    }
  },

  actions: {
    updateCurrentFrame ({commit}, payload) {
      commit('updateCurrentFrame', payload)
    }
  },

  getters: {
    currentFrame (state) {
      return state.currentFrame
    }
  }

}
