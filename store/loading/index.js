export default {

  state: {
    loading: false
  },

  mutations: {
    setLoading (state, payload) {
      state.loading = payload
    }
  },

  actions: {
  },

  getters: {
    loading (state) {
      return state.loading
    }
  }

}
